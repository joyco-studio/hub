'use client'

import * as React from 'react'
import { Command } from 'cmdk'
import SearchIcon from '@/components/icons/search'
import { Kbd } from '@/components/ui/kbd'

type SidebarSearchProps = {
  query: string
  setQuery: (query: string) => void
  isLoading?: boolean
}

export function SidebarSearch({
  query,
  setQuery,
  isLoading,
}: SidebarSearchProps) {
  return (
    <div className="relative">
      <div className="h-aside-width bg-muted focus-within:bg-accent/70 active:bg-accent/70 flex w-full items-center gap-3 px-4">
        <SearchIcon className="text-muted-foreground size-4 shrink-0" />
        <Command.Input
          value={query}
          onValueChange={setQuery}
          placeholder="Search"
          className="text-foreground placeholder:text-muted-foreground h-full min-w-0 flex-1 bg-transparent focus:bg-transparent active:bg-transparent font-mono text-sm tracking-wide uppercase outline-none focus-visible:outline-none"
        />
        {!query && <Kbd className="h-[2em] px-2">⌘K</Kbd>}
      </div>
      {isLoading && (
        <div className="absolute right-0 bottom-0 left-0 h-0.5 overflow-hidden">
          <div className="bg-primary h-full w-[30%] animate-loading-bar" />
        </div>
      )}
    </div>
  )
}
