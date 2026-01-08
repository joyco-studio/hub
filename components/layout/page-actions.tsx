'use client'

import { useEffect, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { useCopyToClipboard } from '@/components/copy-button'
import { ArrowUpRight, ChevronDown, Check } from 'lucide-react'
import CopyIcon from '@/components/icons/copy'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="bg-background ml-auto rounded border px-1.5 py-0.5 text-[10px] font-medium">
      {children}
    </kbd>
  )
}

const emptySubscribe = () => () => {}
const getIsMac = () =>
  typeof navigator !== 'undefined'
    ? navigator.platform.toUpperCase().indexOf('MAC') >= 0
    : true
const getServerSnapshot = () => true

function useIsMac() {
  return useSyncExternalStore(emptySubscribe, getIsMac, getServerSnapshot)
}

export function PageActions({
  content,
  llmUrl,
  className,
}: {
  content: string
  llmUrl: string | null
  className?: string
}) {
  const { hasCopied, copy } = useCopyToClipboard()
  const isMac = useIsMac()

  const cursorUrl = `https://cursor.com/link/prompt?text=${encodeURIComponent(content)}`

  useEffect(() => {
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
        window.open(cursorUrl, '_blank')
        return
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [content, copy, cursorUrl])

  const modKey = isMac ? '⌘' : 'Ctrl'

  return (
    <div className={cn('not-prose flex items-center gap-1', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="accent"
            size="sm"
            className="font-mono tracking-wide uppercase"
          >
            {hasCopied ? (
              <>
                Copied! <Check className="size-3" />
              </>
            ) : (
              <>
                Markdown <ChevronDown className="size-3" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => copy(content)}>
            <CopyIcon className="size-4" />
            Copy Markdown
            <Kbd>
              {modKey}U
            </Kbd>
          </DropdownMenuItem>
          {llmUrl && (
            <DropdownMenuItem asChild>
              <Link href={llmUrl} target="_blank" rel="noopener noreferrer">
                <ArrowUpRight className="size-4" />
                Open Markdown
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <Link href={cursorUrl} target="_blank" rel="noopener noreferrer">
              <svg
                className="size-4"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M3.5 20.5L20.5 12L3.5 3.5V10.5L14.5 12L3.5 13.5V20.5Z" />
              </svg>
              Open in Cursor
              <Kbd>
                {modKey}I
              </Kbd>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
