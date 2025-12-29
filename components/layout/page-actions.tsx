'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Check, Copy, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

export function PageActions({
  content,
  llmUrl,
  className,
}: {
  content: string
  llmUrl: string
  className?: string
}) {
  const [hasCopied, setHasCopied] = React.useState(false)

  React.useEffect(() => {
    if (hasCopied) {
      const timer = setTimeout(() => setHasCopied(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [hasCopied])

  const copyToClipboard = React.useCallback(() => {
    navigator.clipboard.writeText(content)
    setHasCopied(true)
  }, [content])

  const openMarkdown = React.useCallback(() => {
    window.open(llmUrl, '_blank', 'noopener,noreferrer')
  }, [llmUrl])

  return (
    <div className={cn('not-prose flex gap-x-1', className)}>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={copyToClipboard}
        title="Copy page as Markdown"
      >
        {hasCopied ? (
          <Check className="size-4" />
        ) : (
          <Copy className="size-4" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={openMarkdown}
        title="View as Markdown"
      >
        <ExternalLink className="size-4" />
      </Button>
    </div>
  )
}
