'use client'

import Link from 'next/link'
import { CopyButton } from '@/components/copy-button'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'

export function PageActions({
  content,
  llmUrl,
  className,
}: {
  content: string
  llmUrl: string | null
  className?: string
}) {
  return (
    <div className={cn('not-prose flex items-center gap-1', className)}>
      <CopyButton
        value={content}
        variant="accent"
        size="sm"
        className="font-mono tracking-wide uppercase"
      >
        {(hasCopied) => (
          <>
            {hasCopied ? 'Copied!' : 'Copy Markdown'}
            <ArrowUpRight className="size-3" />
          </>
        )}
      </CopyButton>
      {llmUrl && (
        <Button
          asChild
          variant="accent"
          size="sm"
          className="font-mono tracking-wide uppercase"
        >
          <Link href={llmUrl} target="_blank" rel="noopener noreferrer">
            Open Markdown
            <ArrowUpRight className="size-3" />
          </Link>
        </Button>
      )}
    </div>
  )
}
