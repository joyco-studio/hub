'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type * as PageTree from 'fumadocs-core/page-tree'
import { Minus, Plus } from 'lucide-react'
import CaretDownIcon from '@/components/icons/caret-down'
import { cn } from '@/lib/utils'
import { Logo } from '../logos'
import SearchIcon from '@/components/icons/search'
import CubeIcon from '@/components/icons/3d-cube'
import TerminalWithCursorIcon from '@/components/icons/terminal-w-cursor'
import FileIcon from '@/components/icons/file'
import type { SidebarItemMeta } from './sidebar/section'
import { SearchResults } from './sidebar/search-results'
import { NoResults } from './sidebar/no-results'
import { useSearch, type SearchResult } from '@/hooks/use-search'
import { ThemePreview, themes } from './theme-toggle'
import { useTheme } from 'next-themes'

/* -------------------------------------------------------------------------------------------------
 * Types
 * -------------------------------------------------------------------------------------------------*/

type MobileNavProps = {
  tree: PageTree.Root
  itemMeta?: Record<string, SidebarItemMeta>
}

type MobileNavState = 'closed' | 'menu' | 'search'

const sectionIcons: Record<
  string,
  React.ComponentType<React.SVGProps<SVGSVGElement>>
> = {
  components: CubeIcon,
  toolbox: TerminalWithCursorIcon,
  logs: FileIcon,
}

/* -------------------------------------------------------------------------------------------------
 * MobileNav - Main mobile navigation component
 * -------------------------------------------------------------------------------------------------*/

export function MobileNav({ tree, itemMeta = {} }: MobileNavProps) {
  const pathname = usePathname()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [state, setState] = React.useState<MobileNavState>('closed')
  const { query, setQuery, results, hasResults, isEmpty } = useSearch()

  // Close menu on navigation
  React.useEffect(() => {
    setState('closed')
    setQuery('')
  }, [pathname, setQuery])

  // Auto-focus search input when search opens
  React.useEffect(() => {
    if (state === 'search') {
      inputRef.current?.focus()
    }
  }, [state])

  // Lock body scroll when menu or search is open
  React.useEffect(() => {
    if (state === 'menu' || state === 'search') {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [state])

  // Get current section name for header
  const folders = tree.children.filter(
    (child): child is PageTree.Folder => child.type === 'folder'
  )
  const currentFolder = folders.find((folder) => {
    const folderName =
      typeof folder.name === 'string' ? folder.name : String(folder.name)
    const sectionId =
      folder.$id?.split(':')[1]?.toLowerCase() ?? folderName.toLowerCase()
    return pathname.startsWith(`/${sectionId}`)
  })
  const currentSectionName = currentFolder
    ? typeof currentFolder.name === 'string'
      ? currentFolder.name
      : String(currentFolder.name)
    : 'Registry'

  const handleClose = () => {
    setState('closed')
    setQuery('')
  }

  return (
    <div className="contents md:hidden">
      {/* Mobile Header */}
      <header className="bg-background h-mobile-header sticky top-0 z-(--z-mobile-nav) flex w-full items-center gap-1 overflow-hidden">
        {/* Logo / Search icon button */}
        <button
          onClick={() =>
            state === 'search' ? handleClose() : setState('menu')
          }
          className={cn(
            'flex aspect-square h-full shrink-0 items-center justify-center',
            state === 'search'
              ? 'bg-primary text-primary-foreground'
              : 'bg-primary text-primary-foreground'
          )}
        >
          {state === 'search' ? (
            <SearchIcon className="size-5" />
          ) : state === 'closed' ? (
            <Logo />
          ) : (
            <CaretDownIcon className="size-5" />
          )}
        </button>

        {/* Main content area - either dropdown or search input */}
        {state === 'search' ? (
          <div className="bg-muted flex h-full min-w-0 flex-1 items-center px-4">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="text-foreground placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent font-mono text-base tracking-wide uppercase outline-none"
            />
          </div>
        ) : (
          <>
            {/* Section dropdown - toggles menu open/close */}
            <button
              onClick={() => setState(state === 'menu' ? 'closed' : 'menu')}
              className="bg-accent flex h-full min-w-0 flex-1 items-center gap-2 px-4 font-mono text-xs font-medium tracking-wide uppercase"
            >
              <span className="text-muted-foreground shrink-0">JOYCO:</span>
              <span className="truncate">{currentSectionName}</span>
              <CaretDownIcon className="text-muted-foreground ml-auto size-4 shrink-0" />
            </button>

            {/* Search button */}
            <button
              onClick={() => setState('search')}
              className="bg-muted flex h-full shrink-0 items-center gap-2 px-4 font-mono text-xs tracking-wide uppercase"
            >
              <SearchIcon className="size-4" />
              <span className="opacity-70 max-[400px]:hidden">Search</span>
            </button>
          </>
        )}

        {/* Menu / Close button */}
        <button
          onClick={state === 'closed' ? () => setState('menu') : handleClose}
          className="bg-muted flex aspect-square h-full shrink-0 items-center justify-center"
        >
          {state === 'closed' ? (
            <div className="bg-muted-foreground size-3" />
          ) : (
            <span className="font-mono text-xs tracking-wide uppercase">
              ESC
            </span>
          )}
        </button>
      </header>

      {/* Menu Overlay */}
      {state === 'menu' && (
        <MobileMenuContent
          tree={tree}
          itemMeta={itemMeta}
          onClose={handleClose}
        />
      )}

      {/* Search Results Overlay */}
      {state === 'search' && (
        <MobileSearchContent
          query={query}
          results={results}
          hasResults={hasResults}
          isEmpty={isEmpty}
          onClose={handleClose}
          onSuggestedSearch={setQuery}
        />
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------------------------------
 * MobileMenuContent - Menu content below header
 * -------------------------------------------------------------------------------------------------*/

type MobileMenuContentProps = {
  tree: PageTree.Root
  itemMeta?: Record<string, SidebarItemMeta>
  onClose: () => void
}

function MobileMenuContent({
  tree,
  itemMeta = {},
  onClose,
}: MobileMenuContentProps) {
  const folders = tree.children.filter(
    (child): child is PageTree.Folder => child.type === 'folder'
  )

  return (
    <div className="top-mobile-header fixed inset-0 z-(--z-overlay) overflow-y-auto">
      {/* CCTV striped backdrop - clickable to close */}
      <div
        onClick={onClose}
        className="cctv-backdrop absolute inset-0 cursor-pointer"
      />

      {/* Menu content */}
      <div className="bg-background relative">
        {/* Navigation sections */}
        <nav className="flex flex-col">
          {folders.map((folder, index) => (
            <MobileMenuSection
              key={folder.$id ?? index}
              folder={folder}
              itemMeta={itemMeta}
            />
          ))}
        </nav>

        {/* Theme toggle */}
        <MobileThemeToggle />
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------------------------------
 * MobileMenuSection - Collapsible section in menu
 * -------------------------------------------------------------------------------------------------*/

type MobileMenuSectionProps = {
  folder: PageTree.Folder
  itemMeta?: Record<string, SidebarItemMeta>
}

function MobileMenuSection({ folder, itemMeta = {} }: MobileMenuSectionProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const pathname = usePathname()

  const folderName =
    typeof folder.name === 'string' ? folder.name : String(folder.name)
  const sectionId =
    folder.$id?.split(':')[1]?.toLowerCase() ?? folderName.toLowerCase()
  const Icon = sectionIcons[sectionId] ?? CubeIcon
  const isActive = pathname.startsWith(`/${sectionId}`)

  return (
    <div className="">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex w-full items-center gap-3 px-4 py-4 text-left transition-colors',
          isActive && 'bg-accent'
        )}
      >
        <Icon className="size-5" />
        <span className="font-mono text-xs font-medium tracking-wide uppercase">
          {folder.name}
        </span>
        <span className="ml-auto">
          {isOpen ? (
            <Minus className="text-muted-foreground size-4" />
          ) : (
            <Plus className="text-muted-foreground size-4" />
          )}
        </span>
      </button>

      {isOpen && (
        <div className="bg-accent/50 flex flex-col">
          {folder.children.map((child) => {
            if (child.type === 'page') {
              const meta = itemMeta[child.url] ?? {}
              const isItemActive = pathname === child.url

              return (
                <Link
                  key={child.url}
                  href={child.url}
                  className={cn(
                    'flex items-center gap-2 py-2 pr-4 pl-12 font-mono text-xs tracking-wide uppercase transition-colors',
                    isItemActive
                      ? 'text-foreground bg-accent font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  {meta.dot && (
                    <span
                      className={cn(
                        'size-2 shrink-0 rounded-full',
                        meta.dot === 'red' && 'bg-red-500',
                        meta.dot === 'blue' && 'bg-blue-500',
                        meta.dot === 'green' && 'bg-green-500',
                        meta.dot === 'yellow' && 'bg-yellow-500'
                      )}
                    />
                  )}
                  <span className="truncate">{child.name}</span>
                  {meta.badge && (
                    <span
                      className={cn(
                        'ml-auto shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase',
                        meta.badge === 'new' && 'bg-blue-500/20 text-blue-400',
                        meta.badge === 'updated' &&
                          'bg-orange-500/20 text-orange-400'
                      )}
                    >
                      {meta.badge}
                    </span>
                  )}
                </Link>
              )
            }
            return null
          })}
        </div>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------------------------------
 * MobileThemeToggle - Theme selection for mobile menu
 * -------------------------------------------------------------------------------------------------*/

function MobileThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="bg-accent/50 pt-10">
      <div className="bg-background grid gap-y-4 pt-4">
        <p className="text-muted-foreground/80 px-4 font-mono text-xs font-medium tracking-wide uppercase">
          Theme
        </p>
        <div className="flex gap-1">
          <div className="bg-accent/70 w-3 self-stretch" />

          {themes.map((t) => (
            <button
              key={t.name}
              onClick={() => setTheme(t.name)}
              className={cn(
                'flex size-16 flex-1 items-center justify-center',
                theme === t.name
                  ? 'bg-accent **:data-[slot=theme-preview]:bg-foreground/60'
                  : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <ThemePreview themeClass={t.name} />
            </button>
          ))}
          {/* <div className="bg-muted flex-1" /> */}
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------------------------------
 * MobileSearchContent - Search results below header with CCTV backdrop
 * -------------------------------------------------------------------------------------------------*/

type MobileSearchContentProps = {
  query: string
  results: SearchResult[]
  hasResults: boolean
  isEmpty: boolean
  onClose: () => void
  onSuggestedSearch?: (query: string) => void
}

function MobileSearchContent({
  query,
  results,
  hasResults,
  isEmpty,
  onClose,
  onSuggestedSearch,
}: MobileSearchContentProps) {
  const suggestedSearches = [
    'Chat',
    'Scroll Area',
    'File Upload',
    'Marquee',
    'Video Player',
    'Mobile Menu',
  ]

  return (
    <div className="top-mobile-header fixed inset-0 z-(--z-overlay) overflow-y-auto">
      {/* CCTV striped backdrop - clickable to close */}
      <div
        onClick={onClose}
        className="cctv-backdrop absolute inset-0 cursor-pointer"
      />

      {/* Search content */}
      <div className="bg-background relative">
        {hasResults && <SearchResults results={results} query={query} />}
        {isEmpty && <NoResults query={query} />}
        {!hasResults && !isEmpty && (
          <div className="bg-background flex min-h-[50vh] flex-col p-6">
            <p className="text-muted-foreground mb-6 font-mono text-xs tracking-wide uppercase">
              Suggested Searches
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedSearches.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => onSuggestedSearch?.(suggestion)}
                  className="bg-muted hover:bg-accent text-foreground px-3 py-2 font-mono text-xs tracking-wide uppercase transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
