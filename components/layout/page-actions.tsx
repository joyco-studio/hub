'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useCopyToClipboard } from '@/components/copy-button'
import {
  ActionHintEmitter,
  useActionHint,
} from '@/registry/joyco/blocks/action-hint'
import { ChevronDown, Check, Code } from 'lucide-react'
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
import ClaudeIcon from '@/components/icons/claude'
import ChatGPTIcon from '@/components/icons/chatgpt'
import MarkdownIcon from '@/components/icons/markdown'
import CopyIcon from '@/components/icons/copy'

function getAIChatPrompt(pageUrl: string) {
  return `Based on this post context: ${pageUrl}\n\nI have some questions:`
}

function getClaudeUrl(pageUrl: string) {
  const prompt = getAIChatPrompt(pageUrl)
  return `https://claude.ai/new?q=${encodeURIComponent(prompt)}`
}

function getChatGPTUrl(pageUrl: string) {
  const prompt = getAIChatPrompt(pageUrl)
  return `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`
}

export function PageActions({
  content,
  llmUrl,
  componentSource,
  className,
  showShortcuts = true,
}: {
  content: string
  llmUrl: string | null
  componentSource?: string | null
  className?: string
  showShortcuts?: boolean
}) {
  return (
    <div className={cn('not-prose flex items-center gap-1', className)}>
      <PageActionsContent
        content={content}
        llmUrl={llmUrl}
        componentSource={componentSource}
        showShortcuts={showShortcuts}
      />
    </div>
  )
}

function PageActionsContent({
  content,
  llmUrl,
  componentSource,
  showShortcuts,
}: {
  content: string
  llmUrl: string | null
  componentSource?: string | null
  showShortcuts: boolean
}) {
  const { hasCopied, copy } = useCopyToClipboard()
  const { hasCopied: hasCopiedComponent, copy: copyComponent } =
    useCopyToClipboard()

  const cursorUrl = `https://cursor.com/link/prompt?text=${encodeURIComponent(content)}`

  const openInCursor = useCallback(() => {
    window.open(cursorUrl, '_blank')
  }, [cursorUrl])

  // CMD/Ctrl + U: Copy Page (button shows its own feedback)
  useEffect(() => {
    if (!showShortcuts) return
    const handleKeyDown = (e: KeyboardEvent) => {
      const modifier = e.metaKey || e.ctrlKey
      if (modifier && e.key === 'u') {
        e.preventDefault()
        copy(content)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [content, copy, showShortcuts])

  return (
    <>
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
      <ActionHintEmitter>
        <PageActionsDropdown
          llmUrl={llmUrl}
          componentSource={componentSource}
          showShortcuts={showShortcuts}
          hasCopiedComponent={hasCopiedComponent}
          copyComponent={copyComponent}
          openInCursor={openInCursor}
        />
      </ActionHintEmitter>
    </>
  )
}

function PageActionsDropdown({
  llmUrl,
  componentSource,
  showShortcuts,
  hasCopiedComponent,
  copyComponent,
  openInCursor,
}: {
  llmUrl: string | null
  componentSource?: string | null
  showShortcuts: boolean
  hasCopiedComponent: boolean
  copyComponent: (value: string) => void
  openInCursor: () => void
}) {
  const { emit } = useActionHint()
  const [open, setOpen] = useState(false)
  const getLlmPageUrl = () => `${window.location.origin}${llmUrl}`

  useEffect(() => {
    if (!showShortcuts) return
    const handleKeyDown = (e: KeyboardEvent) => {
      const modifier = e.metaKey || e.ctrlKey

      // CMD/Ctrl + I: Open in Cursor
      if (modifier && e.key === 'i') {
        e.preventDefault()
        openInCursor()
        if (!open) {
          emit(
            <span className="flex items-center gap-1.5">
              <CursorIcon className="size-3" />
              Opening in Cursor...
            </span>
          )
        }
        return
      }

      // CMD/Ctrl + O: Open Markdown
      if (modifier && e.key === 'o' && llmUrl) {
        e.preventDefault()
        window.open(llmUrl, '_blank')
        if (!open) {
          emit(
            <span className="flex items-center gap-1.5">
              <MarkdownIcon className="size-3" />
              Opening Markdown...
            </span>
          )
        }
        return
      }

      // CMD/Ctrl + P: Copy Component
      if (modifier && e.key === 'p' && componentSource) {
        e.preventDefault()
        e.stopPropagation()
        copyComponent(componentSource)
        if (!open) {
          emit(
            <span className="flex items-center gap-1.5">
              <Code className="size-3" />
              Component Copied!
            </span>
          )
        }
        return
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [
    copyComponent,
    componentSource,
    emit,
    llmUrl,
    open,
    openInCursor,
    showShortcuts,
  ])

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="icon-sm" aria-label="More actions">
          <ChevronDown className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="text-medium font-mono uppercase"
        align="end"
      >
        {componentSource && (
          <DropdownMenuItem
            className="text-xs"
            onSelect={(e) => {
              e.preventDefault()
              copyComponent(componentSource)
            }}
          >
            <Code className="size-4" />
            {hasCopiedComponent ? 'Copied!' : 'Copy Component'}
            <Kbd className={cn('ml-auto', { hidden: !showShortcuts })}>⌘P</Kbd>
          </DropdownMenuItem>
        )}
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
        {llmUrl && (
          <DropdownMenuItem
            className="text-xs"
            onSelect={() => window.open(getClaudeUrl(getLlmPageUrl()), '_blank')}
          >
            <ClaudeIcon />
            Open in Claude
          </DropdownMenuItem>
        )}
        {llmUrl && (
          <DropdownMenuItem
            className="text-xs"
            onSelect={() =>
              window.open(getChatGPTUrl(getLlmPageUrl()), '_blank')
            }
          >
            <ChatGPTIcon />
            Open in ChatGPT
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
