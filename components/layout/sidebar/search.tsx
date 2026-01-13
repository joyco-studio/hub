'use client'

import * as React from 'react'
import { Command } from 'cmdk'
import SearchIcon from '@/components/icons/search'
import { Kbd } from '@/components/ui/kbd'

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
      <Command.Input
        ref={inputRef}
        value={query}
        onValueChange={setQuery}
        placeholder="Search"
        className="text-foreground placeholder:text-muted-foreground h-full min-w-0 flex-1 bg-transparent font-mono text-sm tracking-wide uppercase outline-none"
      />
      {!query && <Kbd className="h-[2em] px-2">⌘K</Kbd>}
    </div>
  )
}
