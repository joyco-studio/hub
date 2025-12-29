'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Check, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'

export function useCopyToClipboard(timeout = 2000) {
  const [hasCopied, setHasCopied] = React.useState(false)

  React.useEffect(() => {
    if (hasCopied) {
      const timer = setTimeout(() => setHasCopied(false), timeout)
      return () => clearTimeout(timer)
    }
  }, [hasCopied, timeout])

  const copy = React.useCallback((value: string) => {
    navigator.clipboard.writeText(value)
    setHasCopied(true)
  }, [])

  return { hasCopied, copy }
}

export function CopyButton({
  value,
  className,
  forceVisible = false,
  children,
  variant = 'ghost',
  size = 'icon',
  ...props
}: {
  value: string
  forceVisible?: boolean
  children?: (hasCopied: boolean) => React.ReactNode
} & Omit<React.ComponentProps<typeof Button>, 'children'>) {
  const { hasCopied, copy } = useCopyToClipboard()

  return (
    <Button
      data-slot="copy-button"
      size={size}
      variant={variant}
      className={cn(
        size === 'icon' &&
          'dark:hover:bg-accent absolute top-[0.725rem] right-3 z-10 size-7',
        size === 'icon' &&
          (forceVisible
            ? 'opacity-70 hover:opacity-100'
            : 'opacity-0 transition-opacity group-hover/code:opacity-100 hover:opacity-100 focus-visible:opacity-100'),
        className
      )}
      onClick={() => copy(value)}
      {...props}
    >
      {children ? (
        children(hasCopied)
      ) : hasCopied ? (
        <Check className="h-4 w-4" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  )
}
