'use client'
import type { ComponentProps } from 'react'
import { useEffect, useRef } from 'react'
import type { VariantProps } from 'class-variance-authority'
import { Search } from 'lucide-react'
import { useSearchContext } from 'fumadocs-ui/contexts/search'
import { useI18n } from 'fumadocs-ui/contexts/i18n'
import { cn } from '../../lib/cn'
import { buttonVariants } from '../ui/button'

interface SearchToggleProps
  extends
    Omit<ComponentProps<'button'>, 'color'>,
    VariantProps<typeof buttonVariants> {
  hideIfDisabled?: boolean
}

export function SearchToggle({
  hideIfDisabled,
  size = 'icon-sm',
  variant = 'ghost',
  ...props
}: SearchToggleProps) {
  const { setOpenSearch, enabled } = useSearchContext()
  if (hideIfDisabled && !enabled) return null

  return (
    <button
      type="button"
      className={cn(
        buttonVariants({
          size,
          variant,
        }),
        props.className
      )}
      data-search=""
      aria-label="Open Search"
      onClick={() => {
        setOpenSearch(true)
      }}
    >
      <Search />
    </button>
  )
}

export function LargeSearchToggle({
  hideIfDisabled,
  ...props
}: ComponentProps<'button'> & {
  hideIfDisabled?: boolean
}) {
  const { enabled, hotKey, setOpenSearch } = useSearchContext()
  const { text } = useI18n()
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for cmd+k or ctrl+k
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()
        // Focus the button instead of opening the search modal
        buttonRef.current?.focus()
        return false
      }
    }

    // Register with highest priority (capture phase)
    document.addEventListener('keydown', handleKeyDown, { capture: true })
    return () => {
      document.removeEventListener('keydown', handleKeyDown, { capture: true })
    }
  }, [])

  if (hideIfDisabled && !enabled) return null

  return (
    <button
      ref={buttonRef}
      type="button"
      data-search-full=""
      {...props}
      className={cn(
        'bg-secondary/50 text-muted-foreground hover:bg-accent hover:text-accent-foreground inline-flex items-center gap-2 rounded-lg border p-1.5 ps-2 text-sm transition-colors',
        props.className
      )}
      onClick={() => {
        setOpenSearch(true)
      }}
    >
      <Search className="size-4" />
      {text.search}
      <div className="ms-auto inline-flex gap-0.5">
        {hotKey.map((k, i) => (
          <kbd key={i} className="bg-background rounded-md border px-1.5">
            {k.display}
          </kbd>
        ))}
      </div>
    </button>
  )
}
