'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Check, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'

export function CodeBlock({
  children,
  className,
  __raw__,
  ...props
}: React.ComponentProps<'code'> & {
  __raw__?: string
}) {
  const [hasCopied, setHasCopied] = React.useState(false)

  React.useEffect(() => {
    if (hasCopied) {
      const timer = setTimeout(() => setHasCopied(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [hasCopied])

  const copyCode = React.useCallback(() => {
    const codeToCopy = __raw__ || extractTextFromChildren(children)

    if (!codeToCopy) {
      return
    }

    navigator.clipboard.writeText(codeToCopy)
    setHasCopied(true)
  }, [__raw__, children])

  return (
    <code
      className={cn(
        'bg-card border-border group relative rounded-lg border p-3.5',
        className
      )}
      {...props}
    >
      {children}
      <Button
        data-slot="copy-button"
        size="icon"
        variant="ghost"
        className="absolute top-2 right-2 z-10 size-7 opacity-0 transition-opacity group-hover:opacity-70 hover:opacity-100 focus-visible:opacity-100"
        onClick={copyCode}
      >
        {hasCopied ? (
          <Check className="h-4 w-4" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </code>
  )
}

function extractTextFromChildren(children: React.ReactNode): string {
  if (typeof children === 'string') {
    return children
  }

  if (Array.isArray(children)) {
    return children.map(extractTextFromChildren).join('')
  }

  if (React.isValidElement(children) && 'props' in children) {
    return extractTextFromChildren(
      (children as React.ReactElement<{ children: React.ReactNode }>).props
        ?.children || ''
    )
  }

  return ''
}
