'use client'

import {
  createContext,
  useContext,
  useMemo,
  useCallback,
  useState,
  useEffect,
  useRef,
} from 'react'
import type { ProfileFormState } from './types'

type EditProfileContextType = {
  formState: ProfileFormState
  initialData: ProfileFormState
  hasChanges: boolean
  isSaving: boolean
  errors: Partial<Record<keyof ProfileFormState, string>>
  onChange: (field: keyof ProfileFormState, value: string) => void
  onSave: () => void
  onReset: () => void
}

const EditProfileContext = createContext<EditProfileContextType | null>(null)

export function useEditProfileContext() {
  const ctx = useContext(EditProfileContext)
  if (!ctx) throw new Error('Must be used within EditProfileProvider')
  return ctx
}

export function EditProfileProvider({
  initialData,
  onSubmit,
  children,
}: {
  initialData: ProfileFormState
  onSubmit: (data: ProfileFormState) => Promise<void>
  children: React.ReactNode
}) {
  const [formState, setFormState] = useState<ProfileFormState>(initialData)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<
    Partial<Record<keyof ProfileFormState, string>>
  >({})
  const isDiscardedRef = useRef(false)

  const hasChanges = useMemo(() => {
    return JSON.stringify(formState) !== JSON.stringify(initialData)
  }, [formState, initialData])

  const validate = useCallback((data: ProfileFormState) => {
    const newErrors: Partial<Record<keyof ProfileFormState, string>> = {}
    if (!data.name.trim()) {
      newErrors.name = 'Name is required'
    }
    if (data.bio.length > 200) {
      newErrors.bio = 'Bio must be 200 characters or less'
    }
    return newErrors
  }, [])

  const onChange = useCallback(
    (field: keyof ProfileFormState, value: string) => {
      setFormState((prev) => ({ ...prev, [field]: value }))
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    },
    []
  )

  const onSave = useCallback(async () => {
    const validationErrors = validate(formState)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsSaving(true)
    try {
      await onSubmit(formState)
    } finally {
      setIsSaving(false)
    }
  }, [formState, onSubmit, validate])

  const onReset = useCallback(() => {
    setFormState(initialData)
    setErrors({})
    isDiscardedRef.current = true
  }, [initialData])

  // Navigation guard
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges && !isSaving && !isDiscardedRef.current) {
        e.preventDefault()
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasChanges, isSaving])

  const value = useMemo(
    () => ({
      formState,
      initialData,
      hasChanges,
      isSaving,
      errors,
      onChange,
      onSave,
      onReset,
    }),
    [
      formState,
      initialData,
      hasChanges,
      isSaving,
      errors,
      onChange,
      onSave,
      onReset,
    ]
  )

  return (
    <EditProfileContext.Provider value={value}>
      {children}
    </EditProfileContext.Provider>
  )
}
