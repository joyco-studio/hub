'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Check, Copy, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

export function PageActions({
  slugs,
  className,
}: {
  slugs: string[]
  className?: string
}) {
  const [hasCopied, setHasCopied] = React.useState(false)

  const llmUrl = `/llm/${slugs.join('/')}`

  React.useEffect(() => {
    if (hasCopied) {
      const timer = setTimeout(() => setHasCopied(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [hasCopied])

  const copyToClipboard = React.useCallback(async () => {
    try {
      const response = await fetch(llmUrl)
      const text = await response.text()
      await navigator.clipboard.writeText(text)
      setHasCopied(true)
    } catch (error) {
      console.error('Failed to copy page content:', error)
    }
  }, [llmUrl])

  const openMarkdown = React.useCallback(() => {
    window.open(llmUrl, '_blank', 'noopener,noreferrer')
  }, [llmUrl])

  return (
    <div
      className={cn('not-prose my-0 flex flex-wrap gap-x-2 gap-y-1', className)}
    >
      <Button variant="outline" size="sm" onClick={copyToClipboard}>
        {hasCopied ? (
          <Check className="size-4" />
        ) : (
          <Copy className="size-4" />
        )}
        {hasCopied ? 'Copied!' : 'Copy Page'}
      </Button>
      <Button variant="outline" size="sm" onClick={openMarkdown}>
        <ExternalLink className="size-4" />
        View as Markdown
      </Button>
    </div>
  )
}
