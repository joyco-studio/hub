'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import { useSearch } from '@/hooks/use-search'
import { SearchResults } from './sidebar/search-results'
import { NoResults } from './sidebar/no-results'
import SearchIcon from '@/components/icons/search'
import { Kbd } from '@/components/ui/kbd'
import { cn } from '@/lib/utils'

const suggestedSearches = [
  'Chat',
  'Scroll Area',
  'File Upload',
  'Marquee',
  'Video Player',
  'Mobile Menu',
]

export function CommandPalette() {
  const router = useRouter()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [isOpen, setIsOpen] = React.useState(false)
  const { query, setQuery, results, hasResults, isEmpty, isLoading } =
    useSearch()

  const handleClose = React.useCallback(() => {
    setIsOpen(false)
    setQuery('')
  }, [setIsOpen, setQuery])

  const handleSelect = React.useCallback(
    (url: string) => {
      router.push(url)
      handleClose()
    },
    [router, handleClose]
  )

  const onKeyDown = React.useEffectEvent((event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault()
      setIsOpen((prev) => !prev)
    }

    if (event.key === 'Escape' && isOpen) {
      event.preventDefault()
      handleClose()
    }
  })

  // Handle cmd+k to open/close
  React.useEffect(() => {
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  // Focus input when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      // Small delay to ensure the dialog is rendered
      requestAnimationFrame(() => {
        inputRef.current?.focus()
      })
    }
  }, [isOpen])

  // Lock body scroll when open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-(--z-dialog) flex items-start justify-center pt-[15vh]">
      {/* CCTV striped backdrop */}
      <div
        onClick={handleClose}
        className="cctv-backdrop absolute inset-0 cursor-pointer"
      />

      {/* Dialog content */}
      <Command
        shouldFilter={false}
        loop
        className="bg-background relative mx-4 flex w-full max-w-xl flex-col shadow-2xl"
      >
        {/* Search input - styled like sidebar */}
        <div className="relative">
          <div className="bg-muted flex h-14 w-full items-center gap-3 px-4">
            <SearchIcon className="text-muted-foreground size-4 shrink-0" />
            <Command.Input
              ref={inputRef}
              value={query}
              onValueChange={setQuery}
              onKeyDown={(e) => {
                if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                  e.preventDefault()
                  const syntheticKey =
                    e.key === 'ArrowLeft' ? 'ArrowUp' : 'ArrowDown'
                  e.currentTarget.dispatchEvent(
                    new KeyboardEvent('keydown', {
                      key: syntheticKey,
                      bubbles: true,
                    })
                  )
                }
              }}
              placeholder="Search"
              className="text-foreground placeholder:text-muted-foreground h-full min-w-0 flex-1 bg-transparent font-mono text-sm tracking-wide uppercase outline-none"
            />
            <Kbd className="h-[2em] px-2">ESC</Kbd>
          </div>
          {isLoading && (
            <div className="absolute right-0 bottom-0 left-0 h-0.5 overflow-hidden">
              <div className="bg-primary animate-loading-bar h-full w-[30%]" />
            </div>
          )}
        </div>
        <div
          className={cn(
            'aspect-square h-auto max-h-[60vh] w-auto overflow-y-auto',
            "**:data-[slot='snake-game-canvas']:border-border **:data-[slot='snake-game']:bg-black/40 **:data-[slot='snake-game-canvas']:border",
            "**:data-[slot='snake-game-highscores']:bg-background **:data-[slot='snake-game-highscores']:absolute **:data-[slot='snake-game-highscores']:top-0 **:data-[slot='snake-game-highscores']:left-0 **:data-[slot='snake-game-highscores']:h-full **:data-[slot='snake-game-highscores']:max-w-44 **:data-[slot='snake-game-highscores']:-translate-x-[calc(100%+1rem)]"
          )}
        >
          {/* Results */}
          {hasResults && (
            <SearchResults
              className={cn(
                'h-full p-0 pt-2 pb-4',
                "**:data-[slot='command-group-wrapper']:ml-0 **:data-[slot='command-group-wrapper']:border-none",
                "**:data-[slot='command-item']:py-3 **:data-[slot='command-item']:pr-4 **:data-[slot='command-item']:pl-4",
                // description occupy 2 lines ever
                "**:data-[slot='command-item-description']:line-clamp-2 **:data-[slot='command-item-description']:text-xs **:data-[slot='command-item-description']:normal-case"
              )}
              results={results}
              query={query}
              onSelect={handleSelect}
            />
          )}
          {isEmpty && <NoResults query={query} />}
          {!hasResults && !isEmpty && (
            <Command.List
              className="bg-accent/70 flex h-full flex-col p-4 outline-0"
              onKeyDown={(e) => {
                // Map left/right arrows to up/down for horizontal navigation
                if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                  e.preventDefault()
                  const syntheticKey =
                    e.key === 'ArrowLeft' ? 'ArrowUp' : 'ArrowDown'
                  e.currentTarget.dispatchEvent(
                    new KeyboardEvent('keydown', {
                      key: syntheticKey,
                      bubbles: true,
                    })
                  )
                }
              }}
            >
              <p className="text-muted-foreground mb-4 font-mono text-xs tracking-wide uppercase">
                Suggested Searches
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedSearches.map((suggestion) => (
                  <Command.Item
                    key={suggestion}
                    value={suggestion}
                    onSelect={() => setQuery(suggestion)}
                    className="bg-muted text-foreground data-[selected=true]:bg-accent cursor-pointer px-3 py-2 font-mono text-xs tracking-wide uppercase transition-colors"
                  >
                    {suggestion}
                  </Command.Item>
                ))}
              </div>
            </Command.List>
          )}
        </div>
      </Command>
    </div>
  )
}
