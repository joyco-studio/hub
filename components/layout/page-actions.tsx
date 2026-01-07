'use client'

import Link from 'next/link'
import { CopyButton } from '@/components/copy-button'
import { ArrowUpRight, EllipsisVertical } from 'lucide-react'
import CopyIcon from '@/components/icons/copy'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'

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
      {/* Copy Markdown - always visible */}
      <CopyButton
        value={content}
        variant="accent"
        size="sm"
        className="font-mono tracking-wide uppercase"
      >
        {(hasCopied) => (
          <>
            {hasCopied ? (
              'Copied!'
            ) : (
              <>
                Copy Markdown <CopyIcon className="size-3" />
              </>
            )}
          </>
        )}
      </CopyButton>

      {/* Desktop: Show Open Markdown inline */}
      {llmUrl && (
        <Button
          asChild
          variant="accent"
          size="sm"
          className="font-mono tracking-wide uppercase max-sm:hidden"
        >
          <Link href={llmUrl} target="_blank" rel="noopener noreferrer">
            Open Markdown
            <ArrowUpRight className="size-3" />
          </Link>
        </Button>
      )}

      {/* Mobile: Show overflow options in dropdown */}
      {llmUrl && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="accent"
              size="icon-sm"
              className="sm:hidden"
              aria-label="More actions"
            >
              <EllipsisVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={llmUrl} target="_blank" rel="noopener noreferrer">
                <ArrowUpRight className="size-4" />
                Open Markdown
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
