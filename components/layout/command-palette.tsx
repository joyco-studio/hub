'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import { useSearch } from '@/hooks/use-search'
import { SearchResults } from './sidebar/search-results'
import { NoResults } from './sidebar/no-results'
import SearchIcon from '@/components/icons/search'
import { Kbd } from '@/components/ui/kbd'

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
  const { query, setQuery, results, hasResults, isEmpty } = useSearch()

  // Handle cmd+k to open/close
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        setIsOpen((prev) => !prev)
      }
      // Close on escape
      if (event.key === 'Escape' && isOpen) {
        event.preventDefault()
        handleClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

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

  const handleClose = React.useCallback(() => {
    setIsOpen(false)
    setQuery('')
  }, [setQuery])

  const handleSelect = React.useCallback(
    (url: string) => {
      router.push(url)
      handleClose()
    },
    [router, handleClose]
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
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
        <div className="bg-muted flex h-14 w-full items-center gap-3 px-4">
          <SearchIcon className="text-muted-foreground size-4 shrink-0" />
          <Command.Input
            ref={inputRef}
            value={query}
            onValueChange={setQuery}
            placeholder="Search"
            className="text-foreground placeholder:text-muted-foreground h-full min-w-0 flex-1 bg-transparent font-mono text-sm tracking-wide uppercase outline-none"
          />
          <Kbd className="h-[2em] px-2">ESC</Kbd>
        </div>

        {/* Results */}
        <Command.List className="max-h-[60vh] overflow-y-auto">
          {hasResults && (
            <SearchResults
              results={results}
              query={query}
              onSelect={handleSelect}
            />
          )}
          {isEmpty && <NoResults query={query} />}
          {!hasResults && !isEmpty && (
            <div className="bg-accent/70 flex flex-col p-4">
              <p className="text-muted-foreground mb-4 font-mono text-xs tracking-wide uppercase">
                Suggested Searches
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedSearches.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setQuery(suggestion)}
                    className="bg-muted hover:bg-accent text-foreground px-3 py-2 font-mono text-xs tracking-wide uppercase transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </Command.List>
      </Command>
    </div>
  )
}
