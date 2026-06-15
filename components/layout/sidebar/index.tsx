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
import { useIsTeam } from '@/hooks/use-team-cookie'
import type { Experiment } from '@/lib/lab'

export type { SidebarItemMeta }

type RegistrySidebarProps = {
  tree: PageTree.Root
  itemMeta?: Record<string, SidebarItemMeta>
  gameSlugs?: string[]
  effectSlugs?: string[]
  canvasSlugs?: string[]
  librarySlugs?: string[]
  libSlugs?: string[]
  experiments?: Experiment[]
}

export function RegistrySidebar({
  tree,
  itemMeta = {},
  gameSlugs = [],
  effectSlugs = [],
  canvasSlugs = [],
  librarySlugs = [],
  libSlugs = [],
  experiments = [],
}: RegistrySidebarProps) {
  const isTeam = useIsTeam()
  const resolvedMeta = React.useMemo(
    () =>
      isTeam
        ? { ...itemMeta, '/toolbox/ui': { badge: 'internal' as const } }
        : itemMeta,
    [isTeam, itemMeta]
  )
  const pathname = usePathname()
  const router = useRouter()
  const {
    query,
    setQuery,
    results,
    resultsForQuery,
    hasResults,
    isEmpty,
    isLoading,
  } = useSearch()

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
        <nav className="bg-accent/70 flex flex-col overflow-x-hidden overflow-y-auto [scrollbar-gutter:stable]">
          <LabSidebarSection experiments={experiments} />
        </nav>
      )
    }

    // Default: show sidebar navigation (idle or loading states)
    const folder = currentFolder ?? folders[0]
    if (!folder) return null

    return (
      <nav className="bg-accent/70 flex flex-col overflow-x-hidden overflow-y-auto [scrollbar-gutter:stable]">
        <SidebarSection
          folder={folder}
          defaultOpen
          meta={resolvedMeta}
          gameSlugs={gameSlugs}
          effectSlugs={effectSlugs}
          canvasSlugs={canvasSlugs}
          librarySlugs={librarySlugs}
          libSlugs={libSlugs}
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
        {/* -mt-1 cancels the top `gap-1` seam (negative margin combines with
            flex gap). This keeps a single 4px seam above the social row whether
            the filler has height (short pages) or collapses to 0 (tall pages),
            computed at render time — so there's no post-paint reflow. */}
        <div className="bg-muted -mt-1 flex-1" />
        <SocialLinks />
      </Command>
    </div>
  )
}
