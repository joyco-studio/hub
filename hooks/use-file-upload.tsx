import { useCallback, useId, useRef, useState } from 'react'

export interface FileWithPreview {
  id: string
  file: File
  preview?: string
}

export interface UseFileUploadOptions {
  accept?: string
  maxSize?: number
  maxFiles?: number
  onUpload?: (file: File) => Promise<unknown> | void
}

export interface UseFileUploadReturn {
  files: FileWithPreview[]
  errors: string[]
  isDragging: boolean
  addFiles: (fileList: FileList | File[]) => Promise<void>
  removeFile: (id: string) => void
  clearErrors: () => void
  openFileDialog: () => void
  getInputProps: () => {
    ref: React.RefObject<HTMLInputElement | null>
    type: 'file'
    id: string
    accept?: string
    multiple: boolean
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  }
  handleDragEnter: (e: React.DragEvent) => void
  handleDragLeave: (e: React.DragEvent) => void
  handleDragOver: (e: React.DragEvent) => void
  handleDrop: (e: React.DragEvent) => void
}

export function useFileUpload(
  options: UseFileUploadOptions = {}
): UseFileUploadReturn {
  const { accept, maxSize, maxFiles = 1, onUpload } = options

  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const dragCounterRef = useRef(0) // Track nested drag events to prevent flickering

  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const validateFile = useCallback(
    (file: File): string | null => {
      if (accept) {
        const acceptedTypes = accept.split(',').map((t) => t.trim())
        const fileType = file.type
        const isAccepted = acceptedTypes.some((type) => {
          // Support wildcards like "image/*"
          if (type.endsWith('/*')) {
            return fileType.startsWith(type.replace('/*', ''))
          }
          return fileType === type
        })

        if (!isAccepted) {
          return `File type not accepted. Allowed: ${accept}`
        }
      }

      if (maxSize && file.size > maxSize) {
        const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1)
        return `File too large. Max size: ${maxSizeMB}MB`
      }

      return null
    },
    [accept, maxSize]
  )

  // Generate base64 preview for images only
  const createPreview = useCallback(
    (file: File): Promise<string | undefined> => {
      return new Promise((resolve) => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.onerror = () => resolve(undefined)
          reader.readAsDataURL(file)
        } else {
          resolve(undefined)
        }
      })
    },
    []
  )

  const addFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const filesArray = Array.from(fileList)
      const newErrors: string[] = []
      const validFiles: FileWithPreview[] = []

      for (const file of filesArray) {
        const error = validateFile(file)
        if (error) {
          newErrors.push(error)
          continue
        }

        const preview = await createPreview(file)

        validFiles.push({
          id: `${Date.now()}-${Math.random()}`,
          file,
          preview,
        })

        if (onUpload) {
          await onUpload(file)
        }
      }

      setErrors(newErrors)
      setFiles((prev) => {
        const combined = [...prev, ...validFiles]
        return combined.slice(0, maxFiles) // Respect maxFiles limit
      })
    },
    [validateFile, createPreview, onUpload, maxFiles]
  )

  const removeFile = useCallback((fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId))
  }, [])

  const clearErrors = useCallback(() => {
    setErrors([])
  }, [])

  const openFileDialog = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const fileList = event.target.files
      if (fileList && fileList.length > 0) {
        await addFiles(fileList)
      }
      // Reset input to allow uploading the same file again
      event.target.value = ''
    },
    [addFiles]
  )

  const getInputProps = useCallback(() => {
    return {
      ref: inputRef,
      type: 'file' as const,
      id: `${id}-file-input`,
      accept,
      multiple: maxFiles > 1,
      onChange: handleFileChange,
    }
  }, [id, accept, maxFiles, handleFileChange])

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current++
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true)
    }
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current--
    // Only disable when completely outside the drop zone
    if (dragCounterRef.current === 0) {
      setIsDragging(false)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
      dragCounterRef.current = 0

      const fileList = e.dataTransfer.files
      if (fileList && fileList.length > 0) {
        await addFiles(fileList)
      }
    },
    [addFiles]
  )

  return {
    files,
    errors,
    isDragging,
    addFiles,
    removeFile,
    clearErrors,
    openFileDialog,
    getInputProps,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
  }
}
