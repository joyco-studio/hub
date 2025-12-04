'use client'
import { Button } from '@/components/ui/button'
import { useFileUpload } from '@/hooks/use-file-upload'

export interface FileInputProps {
  onUpload: (file: File) => Promise<unknown> | void
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>
}

export const FileInputButton = (
  props: FileInputProps & React.ComponentProps<typeof Button>
) => {
  const { inputProps, onUpload, children, ...buttonProps } = props
  const { openFileDialog, getInputProps } = useFileUpload({ onUpload })

  return (
    <Button onClick={openFileDialog} {...buttonProps}>
      <input {...getInputProps()} {...inputProps} className="sr-only" />
      {children}
    </Button>
  )
}
