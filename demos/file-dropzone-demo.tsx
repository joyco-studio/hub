'use client'

import { FileDropzone } from '@/registry/joyco/blocks/file-dropzone'

function FileForm() {
  const handleUpload = (file: File) => {
    console.log('File uploaded:', file.name, file.type)
  }

  return (
    <div className="flex flex-col gap-4 p-10">
      <FileDropzone
        accept="application/pdf,image/*"
        maxSizeMB={10}
        maxFiles={20}
        multiple={true}
        onUpload={handleUpload}
      />
    </div>
  )
}

export default FileForm
