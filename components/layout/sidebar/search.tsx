'use client'

import * as React from 'react'
import SearchIcon from '@/components/icons/search'
import { Badge } from '@/components/ui/badge'

type SidebarSearchProps = {
  query: string
  setQuery: (query: string) => void
}

export function SidebarSearch({ query, setQuery }: SidebarSearchProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        inputRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <div className="h-aside-width bg-muted flex w-full items-center gap-3 px-4">
      <SearchIcon className="text-muted-foreground size-4 shrink-0" />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search"
        className="text-foreground placeholder:text-muted-foreground h-full min-w-0 flex-1 bg-transparent font-mono text-sm tracking-wide uppercase outline-none"
      />
      {query ? (
        <Badge
          asChild
          variant="key"
          className="cursor-pointer"
          onClick={() => {
            setQuery('')
            inputRef.current?.focus()
          }}
        >
          <button>Clear</button>
        </Badge>
      ) : (
        <Badge variant="key" asChild>
          <button
            onClick={() => {
              inputRef.current?.focus()
            }}
          >
            <kbd>
              <span className="text-[10px]">⌘</span>
              <span>K</span>
            </kbd>
          </button>
        </Badge>
      )}
    </div>
  )
}
