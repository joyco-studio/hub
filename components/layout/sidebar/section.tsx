'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type * as PageTree from 'fumadocs-core/page-tree'
import { cn } from '@/lib/utils'
import CubeIcon from '@/components/icons/3d-cube'
import TerminalWithCursorIcon from '@/components/icons/terminal-w-cursor'
import FileIcon from '@/components/icons/file'
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
                <span className="truncate">{child.name}</span>
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
          }
          return null
        })}
      </div>
    </div>
  )
}

type SidebarSectionProps = {
  folder: PageTree.Folder
  defaultOpen?: boolean
  meta?: Record<string, SidebarItemMeta>
}

/**
 * Renders a collapsible section with header and items.
 * Kept for backwards compatibility.
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
          <div className="border-border ml-4 flex flex-col border-l-2">
            {folder.children.map((child) => {
              if (child.type === 'page') {
                const itemMeta = meta[child.url] ?? {}
                const isItemActive = pathname === child.url

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
                    <span className="truncate">{child.name}</span>
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
