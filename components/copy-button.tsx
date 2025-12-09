'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Check, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'

export function CopyButton({
  value,
  className,
  forceVisible = false,
}: {
  value: string
  className?: string
  forceVisible?: boolean
}) {
  const [hasCopied, setHasCopied] = React.useState(false)

  React.useEffect(() => {
    if (hasCopied) {
      const timer = setTimeout(() => setHasCopied(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [hasCopied])

  const copyToClipboard = React.useCallback(() => {
    navigator.clipboard.writeText(value)
    setHasCopied(true)
  }, [value])

  return (
    <Button
      data-slot="copy-button"
      size="icon"
      variant="ghost"
      className={cn(
        'absolute top-[0.725rem] right-3 z-10 size-7 dark:hover:bg-accent',
        forceVisible
          ? 'opacity-70 hover:opacity-100'
          : 'opacity-0 transition-opacity group-hover/code:opacity-100 hover:opacity-100 focus-visible:opacity-100',
        className
      )}
      onClick={copyToClipboard}
    >
      {hasCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
    </Button>
  )
}
