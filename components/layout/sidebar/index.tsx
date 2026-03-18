'use client'

import * as React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import type * as PageTree from 'fumadocs-core/page-tree'

import { SidebarSearch } from './search'
import { SearchResults } from './search-results'
import { NoResults } from './no-results'
import { SidebarSection, type SidebarItemMeta } from './section'
import { LabSidebarSection } from './lab-section'
import { SocialLinks } from './social-links'
import { NavAside } from '../nav-aside'
import { useSearch } from '@/hooks/use-search'
import type { Experiment } from '@/lib/lab'

export type { SidebarItemMeta }

type RegistrySidebarProps = {
  tree: PageTree.Root
  itemMeta?: Record<string, SidebarItemMeta>
  gameSlugs?: string[]
  effectSlugs?: string[]
  canvasSlugs?: string[]
  experiments?: Experiment[]
}

export function RegistrySidebar({
  tree,
  itemMeta = {},
  gameSlugs = [],
  effectSlugs = [],
  canvasSlugs = [],
  experiments = [],
}: RegistrySidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { query, setQuery, results, resultsForQuery, hasResults, isEmpty, isLoading } =
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
          key={resultsForQuery}
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

    // Lab section has its own data source (not from Fumadocs tree)
    if (pathname.startsWith('/lab')) {
      return (
        <nav className="bg-accent/70 flex flex-col overflow-y-auto">
          <LabSidebarSection experiments={experiments} />
        </nav>
      )
    }

    // Default: show sidebar navigation (idle or loading states)
    const folder = currentFolder ?? folders[0]
    if (!folder) return null

    return (
      <nav className="bg-accent/70 flex flex-col overflow-y-auto">
        <SidebarSection
          folder={folder}
          defaultOpen
          meta={itemMeta}
          gameSlugs={gameSlugs}
          effectSlugs={effectSlugs}
          canvasSlugs={canvasSlugs}
        />
      </nav>
    )
  }

  return (
    <div className="sticky top-0 hidden h-screen shrink-0 gap-1 [grid-area:sidebar] md:flex">
      <NavAside />

      <Command
        shouldFilter={false}
        loop
        className="w-sidebar-width flex flex-col gap-1 text-sm"
        suppressHydrationWarning
      >
        <SidebarSearch
          query={query}
          setQuery={setQuery}
          isLoading={isLoading}
        />
        {renderContent()}
        <div className="bg-muted flex-1" />
        <SocialLinks />
      </Command>
    </div>
  )
}
