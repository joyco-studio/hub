'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { cn } from '@/lib/utils'

export function DownloadFileButton({
  value,
  fileName,
  className,
}: {
  value: string
  fileName: string
  className?: string
}) {
  const downloadFile = React.useCallback(() => {
    const blob = new Blob([value], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [value, fileName])

  return (
    <Button
      data-slot="download-button"
      variant="ghost"
      size="sm"
      className={cn(
        'dark:hover:bg-accent font-normal px-2! h-7 opacity-70 hover:opacity-100',
        className
      )}
      onClick={downloadFile}
    >
      <Download className="h-4 w-4" />
      Download
    </Button>
  )
}

