'use client'

import { useCallback, useEffect } from 'react'
import Link from 'next/link'
import { useCopyToClipboard } from '@/components/copy-button'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Kbd } from '@/components/ui/kbd'
import CursorIcon from '@/components/icons/cursor'
import MarkdownIcon from '@/components/icons/markdown'
import CopyIcon from '@/components/icons/copy'

export function PageActions({
  content,
  llmUrl,
  className,
  showShortcuts = true,
}: {
  content: string
  llmUrl: string | null
  className?: string
  showShortcuts?: boolean
}) {
  const { hasCopied, copy } = useCopyToClipboard()

  const cursorUrl = `https://cursor.com/link/prompt?text=${encodeURIComponent(content)}`

  const openInCursor = useCallback(() => {
    window.open(cursorUrl, '_blank')
  }, [cursorUrl])

  useEffect(() => {
    if (!showShortcuts) return
    const handleKeyDown = (e: KeyboardEvent) => {
      const modifier = e.metaKey || e.ctrlKey

      // CMD/Ctrl + U: Copy Markdown
      if (modifier && e.key === 'u') {
        e.preventDefault()
        copy(content)
        return
      }

      // CMD/Ctrl + I: Open in Cursor
      if (modifier && e.key === 'i') {
        e.preventDefault()
        openInCursor()
        return
      }

      // CMD/Ctrl + O: Open Markdown
      if (modifier && e.key === 'o' && llmUrl) {
        e.preventDefault()
        window.open(llmUrl, '_blank')
        return
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [content, copy, openInCursor, showShortcuts])

  return (
    <div className={cn('not-prose flex items-center gap-1', className)}>
      {/* Copy Markdown - standalone button */}
      <Button
        variant="secondary"
        size="sm"
        className="gap-x-2 font-mono tracking-wide uppercase"
        onClick={() => copy(content)}
      >
        <CopyIcon />
        {hasCopied ? (
          <>
            Copied! <Check className="size-3" />
          </>
        ) : (
          <>
            Copy Page
            <Kbd className={cn('font-normal', { hidden: !showShortcuts })}>
              ⌘U
            </Kbd>
          </>
        )}
      </Button>

      {/* Dropdown for Open Markdown and Open in Cursor */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon-sm" aria-label="More actions">
            <ChevronDown className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="text-medium font-mono uppercase"
          align="end"
        >
          {llmUrl && (
            <DropdownMenuItem className="text-xs" asChild>
              <Link href={llmUrl} target="_blank" rel="noopener noreferrer">
                <MarkdownIcon />
                Open Markdown
                <Kbd className={cn('ml-auto', { hidden: !showShortcuts })}>
                  ⌘O
                </Kbd>
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem className="text-xs" onSelect={openInCursor}>
            <CursorIcon />
            Open in Cursor
            <Kbd className={cn('ml-auto', { hidden: !showShortcuts })}>⌘I</Kbd>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
