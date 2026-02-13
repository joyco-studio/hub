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
import { getLogNumber, stripLogPrefixFromTitle } from '@/lib/log-utils'
import { MetaBadge } from '@/components/layout/meta-badge'

export type SidebarItemMeta = {
  badge?: 'new' | 'updated'
  dot?: 'red' | 'blue' | 'green' | 'yellow'
}

// Helper function to get display name for sidebar items
const getDisplayName = (page: PageTree.Item, sectionId: string) => {
  if (sectionId === 'logs') {
    const name = typeof page.name === 'string' ? page.name : String(page.name)
    const slugs = page.url.split('/').filter(Boolean)
    const logNumber = getLogNumber(slugs)
    return stripLogPrefixFromTitle(name, logNumber)
  }
  return page.name
}

const sectionIcons: Record<
  string,
  React.ComponentType<React.SVGProps<SVGSVGElement>>
> = {
  components: CubeIcon,
  toolbox: TerminalWithCursorIcon,
  logs: FileIcon,
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

  return (
    <div className="flex flex-col">
      {/* Section header */}
      <div className="text-foreground flex items-center gap-2 px-4 py-2.5">
        <Icon className="size-4" />
        <span className="font-mono text-sm font-medium tracking-wide uppercase">
          {folder.name}
        </span>
      </div>

      {/* Items */}
      <div className="border-border mx-4 flex flex-col border-l-2">
        {folder.children.map((child) => {
          if (child.type === 'page') {
            const itemMeta = meta[child.url] ?? {}
            const isItemActive = pathname === child.url
            const displayName = getDisplayName(child, sectionId)

            return (
              <Link
                key={child.url}
                href={child.url}
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
                <span className="truncate">{displayName}</span>
                {itemMeta.badge && (
                  <MetaBadge type={itemMeta.badge} className="ml-auto" />
                )}
              </Link>
            )
          }
          return null
        })}
      </div>
    </div>
  )
}

type CollapsibleSubSectionProps = {
  name: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  pages: PageTree.Item[]
  meta: Record<string, SidebarItemMeta>
  defaultOpen?: boolean
  sectionId?: string
}

function CollapsibleSubSection({
  name,
  icon: Icon,
  pages,
  meta,
  defaultOpen = true,
  sectionId = '',
}: CollapsibleSubSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)
  const pathname = usePathname()

  const isActive = pages.some((page) => pathname === page.url)

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'min-h-aside-width flex items-center gap-2 px-4 py-5 text-left transition-colors',
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

      {isOpen && (
        <>
          <div className="border-border ml-4 flex flex-col border-l-2">
            {pages.map((page) => {
              const itemMeta = meta[page.url] ?? {}
              const isItemActive = pathname === page.url
              const displayName = getDisplayName(page, sectionId)

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
                  <span className="truncate">{displayName}</span>
                  {itemMeta.badge && (
                    <MetaBadge type={itemMeta.badge} className="ml-auto" />
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
  gameSlugs?: string[]
}

/**
 * Renders a collapsible section with header and items.
 * For the components section, splits into UI and Games sub-sections.
 */
export function SidebarSection({
  folder,
  defaultOpen = true,
  meta = {},
  gameSlugs = [],
}: SidebarSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)
  const pathname = usePathname()

  const folderName =
    typeof folder.name === 'string' ? folder.name : String(folder.name)
  const sectionId =
    folder.$id?.split(':')[1]?.toLowerCase() ?? folderName.toLowerCase()
  const Icon = sectionIcons[sectionId] ?? CubeIcon

  const isActive = pathname.startsWith(`/${sectionId}`)

  // For components section, split into UI and Games
  if (sectionId === 'components' && gameSlugs.length > 0) {
    const isGame = (url: string) => {
      const slug = url.split('/').pop() ?? ''
      return gameSlugs.includes(slug)
    }

    const pages = folder.children.filter(
      (child): child is PageTree.Item => child.type === 'page'
    )
    const uiPages = pages.filter((page) => !isGame(page.url))
    const gamePages = pages.filter((page) => isGame(page.url))

    return (
      <div className="flex flex-col">
        <CollapsibleSubSection
          name="UI"
          icon={CubeIcon}
          pages={uiPages}
          meta={meta}
          defaultOpen
        />
        {gamePages.length > 0 && (
          <CollapsibleSubSection
            name="Games"
            icon={GamepadIcon}
            pages={gamePages}
            meta={meta}
            defaultOpen
          />
        )}
      </div>
    )
  }

  // For other sections (Toolbox, Logs), render with collapsible header
  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'min-h-aside-width flex items-center gap-2 px-4 py-5 text-left transition-colors',
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
          <div className="border-border ml-4 flex flex-col border-l-2">
            {folder.children.map((child) => {
              if (child.type === 'page') {
                const itemMeta = meta[child.url] ?? {}
                const isItemActive = pathname === child.url
                const displayName = getDisplayName(child, sectionId)

                return (
                  <Link
                    key={child.url}
                    href={child.url}
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
                    <span className="truncate">{displayName}</span>
                    {itemMeta.badge && (
                      <MetaBadge type={itemMeta.badge} className="ml-auto" />
                    )}
                  </Link>
                )
              }
              return null
            })}
          </div>
          <div className="border-border ml-4 h-3 border-l-2" />
        </>
      )}
    </div>
  )
}
