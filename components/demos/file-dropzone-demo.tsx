'use client'

import { FileDropzone } from '@/registry/joyco/blocks/file-dropzone'
import { Card, CardContent } from '@/components/ui/card'

export function FileDropzoneDemo() {
  const handleUpload = (file: File) => {
    console.log('File uploaded:', file.name, file.type)
  }

  return (
    <Card className="not-prose">
      <CardContent>
        <FileDropzone
          accept="application/pdf,image/*"
          maxSizeMB={10}
          // maxFiles={20}
          // multiple={true}
          onUpload={handleUpload}
        />
      </CardContent>
    </Card>
  )
}
