'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type * as PageTree from 'fumadocs-core/page-tree'
import { cn } from '@/lib/utils'
import CubeIcon from '@/components/icons/3d-cube'
import TerminalWithCursorIcon from '@/components/icons/terminal-w-cursor'
import FileIcon from '@/components/icons/file'
import GamepadIcon from '@/components/icons/gamepad'
import { Minus, Plus } from 'lucide-react'

export type SidebarItemMeta = {
  badge?: 'new' | 'updated'
  dot?: 'red' | 'blue' | 'green' | 'yellow'
}

const sectionIcons: Record<
  string,
  React.ComponentType<React.SVGProps<SVGSVGElement>>
> = {
  components: CubeIcon,
  toolbox: TerminalWithCursorIcon,
  logs: FileIcon,
  ui: CubeIcon,
  games: GamepadIcon,
}

/**
 * Recursively collects all pages from a folder and its nested subfolders.
 * Returns an array of { page, groupName } where groupName is the parent folder name.
 */
function collectPagesFromFolder(
  folder: PageTree.Folder
): Array<{ page: PageTree.Item; groupName: string | null }> {
  const results: Array<{ page: PageTree.Item; groupName: string | null }> = []

  for (const child of folder.children) {
    if (child.type === 'page') {
      results.push({ page: child, groupName: null })
    } else if (child.type === 'folder') {
      // Recursively get pages from nested folders
      const nestedPages = collectPagesFromFolder(child)
      const groupName = typeof child.name === 'string' ? child.name : String(child.name)
      for (const nested of nestedPages) {
        // Use the immediate parent folder name as the group
        results.push({
          page: nested.page,
          groupName: nested.groupName ?? groupName,
        })
      }
    }
  }

  return results
}

type SidebarItemsProps = {
  folder: PageTree.Folder
  meta?: Record<string, SidebarItemMeta>
}

/**
 * Renders a section with header and items (non-collapsible).
 * Shows all items from the current section with the section title.
 */
export function SidebarItems({ folder, meta = {} }: SidebarItemsProps) {
  const pathname = usePathname()

  const folderName =
    typeof folder.name === 'string' ? folder.name : String(folder.name)
  const sectionId =
    folder.$id?.split(':')[1]?.toLowerCase() ?? folderName.toLowerCase()
  const Icon = sectionIcons[sectionId] ?? CubeIcon

  // Collect all pages including from nested folders
  const allPages = collectPagesFromFolder(folder)

  // Group pages by their group name
  const groupedPages = allPages.reduce(
    (acc, { page, groupName }) => {
      const key = groupName ?? '__root__'
      if (!acc[key]) acc[key] = []
      acc[key].push(page)
      return acc
    },
    {} as Record<string, PageTree.Item[]>
  )

  const groupNames = Object.keys(groupedPages).filter((k) => k !== '__root__')
  const rootPages = groupedPages['__root__'] ?? []

  return (
    <div className="flex flex-col">
      {/* Section header */}
      <div className="text-foreground flex items-center gap-2 px-4 py-2.5">
        <Icon className="size-4" />
        <span className="font-mono text-sm font-medium tracking-wide uppercase">
          {folder.name}
        </span>
      </div>

      {/* Root pages (if any) */}
      {rootPages.length > 0 && (
        <div className="border-border mx-4 flex flex-col border-l-2">
          {rootPages.map((page) => {
            const itemMeta = meta[page.url] ?? {}
            const isItemActive = pathname === page.url

            return (
              <Link
                key={page.url}
                href={page.url}
                className={cn(
                  '-ml-[2px] flex items-center gap-2 py-1.5 pr-4 pl-4 font-mono text-sm tracking-wide uppercase transition-colors',
                  isItemActive
                    ? 'text-foreground border-primary border-l-2 font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:border-foreground/50 border-l-2'
                )}
              >
                {itemMeta.dot && (
                  <span
                    className={cn(
                      'size-2 shrink-0 rounded-full',
                      itemMeta.dot === 'red' && 'bg-red-500',
                      itemMeta.dot === 'blue' && 'bg-blue-500',
                      itemMeta.dot === 'green' && 'bg-green-500',
                      itemMeta.dot === 'yellow' && 'bg-yellow-500'
                    )}
                  />
                )}
                <span className="truncate">{page.name}</span>
                {itemMeta.badge && (
                  <span
                    className={cn(
                      'ml-auto shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase',
                      itemMeta.badge === 'new' &&
                        'bg-blue-500/20 text-blue-400',
                      itemMeta.badge === 'updated' &&
                        'bg-orange-500/20 text-orange-400'
                    )}
                  >
                    {itemMeta.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      )}

      {/* Grouped pages (from nested folders) */}
      {groupNames.map((groupName) => (
        <div key={groupName} className="flex flex-col">
          {/* Sub-section header */}
          <div className="text-muted-foreground mt-4 flex items-center gap-2 px-4 py-1.5">
            <span className="font-mono text-xs font-medium tracking-wide uppercase">
              {groupName}
            </span>
          </div>
          {/* Sub-section items */}
          <div className="border-border mx-4 flex flex-col border-l-2">
            {groupedPages[groupName].map((page) => {
              const itemMeta = meta[page.url] ?? {}
              const isItemActive = pathname === page.url

              return (
                <Link
                  key={page.url}
                  href={page.url}
                  className={cn(
                    '-ml-[2px] flex items-center gap-2 py-1.5 pr-4 pl-4 font-mono text-sm tracking-wide uppercase transition-colors',
                    isItemActive
                      ? 'text-foreground border-primary border-l-2 font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:border-foreground/50 border-l-2'
                  )}
                >
                  {itemMeta.dot && (
                    <span
                      className={cn(
                        'size-2 shrink-0 rounded-full',
                        itemMeta.dot === 'red' && 'bg-red-500',
                        itemMeta.dot === 'blue' && 'bg-blue-500',
                        itemMeta.dot === 'green' && 'bg-green-500',
                        itemMeta.dot === 'yellow' && 'bg-yellow-500'
                      )}
                    />
                  )}
                  <span className="truncate">{page.name}</span>
                  {itemMeta.badge && (
                    <span
                      className={cn(
                        'ml-auto shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase',
                        itemMeta.badge === 'new' &&
                          'bg-blue-500/20 text-blue-400',
                        itemMeta.badge === 'updated' &&
                          'bg-orange-500/20 text-orange-400'
                      )}
                    >
                      {itemMeta.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

type CollapsibleSubSectionProps = {
  name: string
  pages: PageTree.Item[]
  meta: Record<string, SidebarItemMeta>
  defaultOpen?: boolean
}

/**
 * Renders a collapsible sub-section (like UI/Games).
 * Styled identically to the main section headers.
 */
function CollapsibleSubSection({
  name,
  pages,
  meta,
  defaultOpen = true,
}: CollapsibleSubSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)
  const pathname = usePathname()
  const subSectionId = name.toLowerCase()
  const Icon = sectionIcons[subSectionId] ?? CubeIcon

  // Check if any page in this section is active
  const isActive = pages.some((page) => pathname === page.url)

  return (
    <div className="flex flex-col">
      {/* Section header (collapsible) - same style as main sections */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-4 py-5 text-left transition-colors',
          'hover:bg-accent',
          isActive && 'text-foreground/70'
        )}
      >
        <Icon className="size-4" />
        <span className="font-mono text-sm font-medium tracking-wide uppercase">
          {name}
        </span>
        <span className="ml-auto">
          {isOpen ? (
            <Minus className="text-muted-foreground size-3" />
          ) : (
            <Plus className="text-muted-foreground size-3" />
          )}
        </span>
      </button>

      {/* Section items */}
      {isOpen && (
        <>
          <div className="border-border ml-4 flex flex-col border-l-2">
            {pages.map((page) => {
              const itemMeta = meta[page.url] ?? {}
              const isItemActive = pathname === page.url

              return (
                <Link
                  key={page.url}
                  href={page.url}
                  className={cn(
                    '-ml-[2px] flex items-center gap-2 px-4 py-1.5 font-mono text-sm tracking-wide uppercase transition-colors',
                    isItemActive
                      ? 'text-foreground border-foreground bg-accent border-l-4 pl-6 font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:border-foreground/50 border-l-2'
                  )}
                >
                  {itemMeta.dot && (
                    <span
                      className={cn(
                        'size-2 shrink-0 rounded-full',
                        itemMeta.dot === 'red' && 'bg-red-500',
                        itemMeta.dot === 'blue' && 'bg-blue-500',
                        itemMeta.dot === 'green' && 'bg-green-500',
                        itemMeta.dot === 'yellow' && 'bg-yellow-500'
                      )}
                    />
                  )}
                  <span className="truncate">{page.name}</span>
                  {itemMeta.badge && (
                    <span
                      className={cn(
                        'ml-auto shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase',
                        itemMeta.badge === 'new' &&
                          'bg-blue-500/20 text-blue-400',
                        itemMeta.badge === 'updated' &&
                          'bg-orange-500/20 text-orange-400'
                      )}
                    >
                      {itemMeta.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
          <div className="border-border ml-4 h-3 border-l-2" />
        </>
      )}
    </div>
  )
}

type SidebarSectionProps = {
  folder: PageTree.Folder
  defaultOpen?: boolean
  meta?: Record<string, SidebarItemMeta>
}

/**
 * Renders a section with items.
 * - If the section has nested folders (like Components with UI/Games), 
 *   renders them as collapsible sub-sections without a parent header.
 * - If the section has only direct pages (like Toolbox/Logs),
 *   renders as a collapsible section with header.
 */
export function SidebarSection({
  folder,
  defaultOpen = true,
  meta = {},
}: SidebarSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)
  const pathname = usePathname()

  const folderName =
    typeof folder.name === 'string' ? folder.name : String(folder.name)
  const sectionId =
    folder.$id?.split(':')[1]?.toLowerCase() ?? folderName.toLowerCase()
  const Icon = sectionIcons[sectionId] ?? CubeIcon

  const isActive = pathname.startsWith(`/${sectionId}`)

  // Collect all pages including from nested folders
  const allPages = collectPagesFromFolder(folder)

  // Group pages by their group name
  const groupedPages = allPages.reduce(
    (acc, { page, groupName }) => {
      const key = groupName ?? '__root__'
      if (!acc[key]) acc[key] = []
      acc[key].push(page)
      return acc
    },
    {} as Record<string, PageTree.Item[]>
  )

  const groupNames = Object.keys(groupedPages).filter((k) => k !== '__root__')
  const rootPages = groupedPages['__root__'] ?? []

  // If we have nested folders (like UI/Games), render them as top-level collapsible sections
  // without a parent "Components" header
  const hasNestedFolders = groupNames.length > 0

  if (hasNestedFolders) {
    return (
      <div className="flex flex-col">
        {/* Render nested folders as top-level collapsible sections */}
        {groupNames.map((groupName) => (
          <CollapsibleSubSection
            key={groupName}
            name={groupName}
            pages={groupedPages[groupName]}
            meta={meta}
            defaultOpen
          />
        ))}
      </div>
    )
  }

  // For sections without nested folders (Toolbox, Logs), render with collapsible header
  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-4 py-5 text-left transition-colors',
          'hover:bg-accent',
          isActive && 'text-foreground/70'
        )}
      >
        <Icon className="size-4" />
        <span className="font-mono text-sm font-medium tracking-wide uppercase">
          {folder.name}
        </span>
        <span className="ml-auto">
          {isOpen ? (
            <Minus className="text-muted-foreground size-3" />
          ) : (
            <Plus className="text-muted-foreground size-3" />
          )}
        </span>
      </button>

      {isOpen && (
        <>
          {/* Root pages */}
          <div className="border-border ml-4 flex flex-col border-l-2">
            {rootPages.map((page) => {
              const itemMeta = meta[page.url] ?? {}
              const isItemActive = pathname === page.url

              return (
                <Link
                  key={page.url}
                  href={page.url}
                  className={cn(
                    '-ml-[2px] flex items-center gap-2 px-4 py-1.5 font-mono text-sm tracking-wide uppercase transition-colors',
                    isItemActive
                      ? 'text-foreground border-foreground bg-accent border-l-4 pl-6 font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:border-foreground/50 border-l-2'
                  )}
                >
                  {itemMeta.dot && (
                    <span
                      className={cn(
                        'size-2 shrink-0 rounded-full',
                        itemMeta.dot === 'red' && 'bg-red-500',
                        itemMeta.dot === 'blue' && 'bg-blue-500',
                        itemMeta.dot === 'green' && 'bg-green-500',
                        itemMeta.dot === 'yellow' && 'bg-yellow-500'
                      )}
                    />
                  )}
                  <span className="truncate">{page.name}</span>
                  {itemMeta.badge && (
                    <span
                      className={cn(
                        'ml-auto shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase',
                        itemMeta.badge === 'new' &&
                          'bg-blue-500/20 text-blue-400',
                        itemMeta.badge === 'updated' &&
                          'bg-orange-500/20 text-orange-400'
                      )}
                    >
                      {itemMeta.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
          <div className="border-border ml-4 h-3 border-l-2" />
        </>
      )}
    </div>
  )
}
