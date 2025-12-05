'use client'
import { useState } from 'react'
import { FileInputButton } from '@/registry/joyco/blocks/file-button'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Upload,
  FileText,
  Image as ImageIcon,
  Music,
  Video,
  File,
} from 'lucide-react'

interface UploadedFile {
  name: string
  size: number
  type: string
}

export function FileInputButtonDemo() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])

  const handleUpload = (file: File) => {
    setUploadedFiles((prev) => [
      ...prev,
      {
        name: file.name,
        size: file.size,
        type: file.type,
      },
    ])
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="h-4 w-4" />
    if (type.startsWith('audio/')) return <Music className="h-4 w-4" />
    if (type.startsWith('video/')) return <Video className="h-4 w-4" />
    if (type.startsWith('text/')) return <FileText className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center justify-center p-8">
      <div className="mb-6 flex w-full items-center justify-center gap-2">
        <FileInputButton
          onUpload={handleUpload}
          inputProps={{ multiple: true }}
          variant="default"
        >
          <Upload />
          Upload Files
        </FileInputButton>
        {uploadedFiles.length > 0 && (
          <Button variant="ghost" onClick={() => setUploadedFiles([])}>
            Clear All
          </Button>
        )}
      </div>
      <div className="bg-muted/40 border-border flex min-h-21 w-full items-center rounded-lg border">
        {uploadedFiles.length > 0 ? (
          <div className="max-h-90 w-full flex-1 space-y-2 overflow-y-auto">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-3 p-3">
                <div className="text-muted-foreground">
                  {getFileIcon(file.type)}
                </div>
                <div className="max-w-full min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground flex-1 text-center text-sm">
            No files uploaded yet
          </div>
        )}
      </div>
    </div>
  )
}

export default FileInputButtonDemo
