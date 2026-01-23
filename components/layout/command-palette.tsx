'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import { useSearch } from '@/hooks/use-search'
import { SearchResults } from './sidebar/search-results'
import { NoResults } from './sidebar/no-results'
import SearchIcon from '@/components/icons/search'
import HistoryIcon from '@/components/icons/history'
import { Kbd } from '@/components/ui/kbd'
import { cn } from '@/lib/utils'

const RECENT_ITEMS_KEY = 'joyco-recent-items'
const MAX_RECENT_ITEMS = 6

type RecentItem = {
  url: string
  title: string
}

const suggestedSearches = [
  'Chat',
  'Scroll Area',
  'File Upload',
  'Marquee',
  'Video Player',
  'Mobile Menu',
]

function getRecentItems(): RecentItem[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(RECENT_ITEMS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function addRecentItem(item: RecentItem): void {
  if (typeof window === 'undefined' || !item.url) return
  try {
    const recent = getRecentItems()
    const filtered = recent.filter((i) => i.url !== item.url)
    const updated = [item, ...filtered].slice(0, MAX_RECENT_ITEMS)
    localStorage.setItem(RECENT_ITEMS_KEY, JSON.stringify(updated))
  } catch {
    // Ignore localStorage errors
  }
}

function clearRecentItems(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(RECENT_ITEMS_KEY)
  } catch {
    // Ignore localStorage errors
  }
}

export function CommandPalette() {
  const router = useRouter()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [isOpen, setIsOpen] = React.useState(false)
  const [recentItems, setRecentItems] = React.useState<RecentItem[]>([])
  const { query, setQuery, results, hasResults, isEmpty, isLoading } =
    useSearch()

  // Load recent items on mount
  React.useEffect(() => {
    setRecentItems(getRecentItems())
  }, [])

  const handleClose = React.useCallback(() => {
    setIsOpen(false)
    setQuery('')
  }, [setIsOpen, setQuery])

  const handleSelect = React.useCallback(
    (url: string) => {
      // Find the selected result to save it
      const selectedResult = results.find((r) => r.url.split('#')[0] === url)
      if (selectedResult) {
        addRecentItem({
          url,
          title: selectedResult.content,
        })
        setRecentItems(getRecentItems())
      }
      router.push(url)
      handleClose()
    },
    [router, handleClose, results]
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
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search"
      className="fixed inset-0 z-(--z-dialog) flex items-start justify-center pt-[15vh]"
    >
      <span className="sr-only">Press Escape to close</span>
      {/* CCTV striped backdrop */}
      <div
        onClick={handleClose}
        aria-hidden="true"
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
              className="text-foreground placeholder:text-muted-foreground h-full min-w-0 flex-1 bg-transparent font-mono text-sm tracking-wide uppercase outline-none focus-visible:outline-none"
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
            'max-h-[60vh] overflow-x-hidden overflow-y-auto',
            isEmpty && 'aspect-square w-full',
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
            <Command.List className="bg-accent/70 flex flex-col pt-2 pb-4 outline-0">
              {recentItems.length > 0 ? (
                <Command.Group
                  heading={
                    <div className="group flex items-center justify-between px-4 py-2">
                      <span className="text-muted-foreground font-mono text-xs tracking-wide uppercase">
                        Recent
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          clearRecentItems()
                          setRecentItems([])
                        }}
                        className="text-muted-foreground hover:text-foreground focus-visible:text-foreground font-mono text-xs tracking-wide uppercase opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                      >
                        Clear
                      </button>
                    </div>
                  }
                  className="[&_[cmdk-group-heading]]:p-0"
                >
                  {recentItems.map((item) => (
                    <Command.Item
                      key={item.url}
                      value={item.title}
                      onSelect={() => {
                        router.push(item.url)
                        handleClose()
                      }}
                      className={cn(
                        'flex cursor-pointer items-center gap-2 py-3 pr-4 pl-4 transition-colors',
                        'text-muted-foreground',
                        'data-[selected=true]:text-foreground data-[selected=true]:bg-accent'
                      )}
                    >
                      <HistoryIcon className="size-3.5 shrink-0 opacity-50" />
                      <span className="font-mono text-sm tracking-wide uppercase">
                        {item.title}
                      </span>
                    </Command.Item>
                  ))}
                </Command.Group>
              ) : (
                <Command.Group
                  heading={
                    <span className="text-muted-foreground px-4 py-2 font-mono text-xs tracking-wide uppercase">
                      Suggested Searches
                    </span>
                  }
                  className="**:[cmdk-group-heading]:p-0"
                >
                  {suggestedSearches.map((suggestion) => (
                    <Command.Item
                      key={suggestion}
                      value={suggestion}
                      onSelect={() => setQuery(suggestion)}
                      className={cn(
                        'flex cursor-pointer items-center gap-2 py-3 pr-4 pl-4 transition-colors',
                        'text-muted-foreground',
                        'data-[selected=true]:text-foreground data-[selected=true]:bg-accent'
                      )}
                    >
                      <SearchIcon className="size-3.5 shrink-0 opacity-50" />
                      <span className="font-mono text-sm tracking-wide uppercase">
                        {suggestion}
                      </span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}
            </Command.List>
          )}
        </div>
      </Command>
    </div>
  )
}
