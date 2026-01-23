'use client'

import * as React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import type * as PageTree from 'fumadocs-core/page-tree'

import { SidebarSearch } from './search'
import { SearchResults } from './search-results'
import { NoResults } from './no-results'
import { SidebarSection, type SidebarItemMeta } from './section'
import { SocialLinks } from './social-links'
import { NavAside } from '../nav-aside'
import { useLayout } from '@/hooks/use-layout'
import { useSearch } from '@/hooks/use-search'
import { cn } from '@/lib/utils'

export type { SidebarItemMeta }

type RegistrySidebarProps = {
  tree: PageTree.Root
  itemMeta?: Record<string, SidebarItemMeta>
}

export function RegistrySidebar({ tree, itemMeta = {} }: RegistrySidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { layout } = useLayout()
  const { query, setQuery, results, hasResults, isEmpty, isLoading } =
    useSearch()

  // Get all folders from the tree
  const folders = tree.children.filter(
    (child): child is PageTree.Folder => child.type === 'folder'
  )

  // Find the current section based on pathname
  const currentFolder = folders.find((folder) => {
    const folderName =
      typeof folder.name === 'string' ? folder.name : String(folder.name)
    const sectionId =
      folder.$id?.split(':')[1]?.toLowerCase() ?? folderName.toLowerCase()
    return pathname.startsWith(`/${sectionId}`)
  })

  // Handle navigation when an item is selected
  const handleSelect = React.useCallback(
    (url: string) => {
      router.push(url)
      setQuery('')
    },
    [router, setQuery]
  )

  // Render content based on search state
  const renderContent = () => {
    // Show results when we have them
    if (hasResults) {
      return (
        <SearchResults
          results={results}
          query={query}
          onSelect={handleSelect}
        />
      )
    }

    // Show no results only when confirmed empty
    if (isEmpty) {
      return <NoResults query={query} />
    }

    // Default: show sidebar navigation (idle or loading states)
    const folder = currentFolder ?? folders[0]
    if (!folder) return null

    return (
      <nav className="bg-accent/70 flex flex-col overflow-y-auto">
        <SidebarSection folder={folder} defaultOpen meta={itemMeta} />
      </nav>
    )
  }

  return (
    <div className="sticky top-0 hidden h-screen shrink-0 gap-1 [grid-area:sidebar] md:flex md:justify-end">
      <div
        className={cn(
          'bg-muted/50 hidden flex-1',
          layout === 'fixed' && '2xl:block'
        )}
      />
      <NavAside />

      <Command
        shouldFilter={false}
        loop
        className="w-sidebar-width flex flex-col gap-1 text-sm"
      >
        <SidebarSearch query={query} setQuery={setQuery} isLoading={isLoading} />
        {renderContent()}
        <div className="bg-muted flex-1" />
        <SocialLinks />
      </Command>
    </div>
  )
}
