'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type * as PageTree from 'fumadocs-core/page-tree'
import { useSearchContext } from 'fumadocs-ui/contexts/search'
import { cn } from '@/lib/utils'
import SearchIcon from '@/components/icons/search'
import CubeIcon from '@/components/icons/3d-cube'
import TerminalWithCursorIcon from '@/components/icons/terminal-w-cursor'
import FileIcon from '@/components/icons/file'
import BlueskyIcon from '@/components/icons/bluesky'
import XIcon from '@/components/icons/x'
import LinkedInIcon from '@/components/icons/linkedin'
import InstagramIcon from '@/components/icons/instagram'
import { Minus, Plus } from 'lucide-react'
import { Badge } from '../ui/badge'
import { AsideButton } from './nav-aside'

/* -------------------------------------------------------------------------------------------------
 * Types
 * -------------------------------------------------------------------------------------------------*/

type BadgeType = 'new' | 'updated'

type SidebarItemMeta = {
  badge?: BadgeType
  dot?: 'red' | 'blue' | 'green' | 'yellow'
}

/* -------------------------------------------------------------------------------------------------
 * SearchTrigger
 * -------------------------------------------------------------------------------------------------*/

function SearchTrigger() {
  const search = useSearchContext()

  return (
    <button
      type="button"
      onClick={() => search.setOpenSearch(true)}
      className="h-aside-width bg-muted hover:bg-accent flex w-full items-center gap-3 px-4 py-3 text-left transition-colors"
    >
      <SearchIcon className="text-muted-foreground size-4" />
      <span className="text-muted-foreground font-mono text-sm tracking-wide uppercase">
        Search
      </span>
      <Badge variant="key" asChild>
        <kbd className="ml-auto">
          <span className="text-[10px]">⌘</span>
          <span>K</span>
        </kbd>
      </Badge>
    </button>
  )
}

/* -------------------------------------------------------------------------------------------------
 * SidebarSection
 * -------------------------------------------------------------------------------------------------*/

const sectionIcons: Record<
  string,
  React.ComponentType<React.SVGProps<SVGSVGElement>>
> = {
  components: CubeIcon,
  toolbox: TerminalWithCursorIcon,
  logs: FileIcon,
}

type SidebarSectionProps = {
  folder: PageTree.Folder
  defaultOpen?: boolean
  meta?: Record<string, SidebarItemMeta>
}

function SidebarSection({
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
          'flex items-center gap-2 px-4 py-2.5 text-left transition-colors',
          'hover:bg-accent',
          isActive && 'text-foreground'
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
        <div className="border-border ml-4 flex flex-col border-l">
          {folder.children.map((child) => {
            if (child.type === 'page') {
              const itemMeta = meta[child.url] ?? {}
              const isItemActive = pathname === child.url

              return (
                <Link
                  key={child.url}
                  href={child.url}
                  className={cn(
                    'flex items-center gap-2 py-1.5 pr-4 pl-4 font-mono text-sm tracking-wide uppercase transition-colors',
                    isItemActive
                      ? 'text-foreground font-medium'
                      : 'text-muted-foreground hover:text-foreground'
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
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------------------------------
 * SocialLinks
 * -------------------------------------------------------------------------------------------------*/

const socialLinks = [
  { name: 'X', href: 'https://x.com/joycostudio', icon: XIcon },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/company/joyco-studio',
    icon: LinkedInIcon,
  },
  {
    name: 'Instagram',
    href: 'https://instagram.com/joyco.studio',
    icon: InstagramIcon,
  },
]

function SocialLinks() {
  return (
    <div className="flex gap-1">
      {socialLinks.map((link) => (
        <AsideButton key={link.name} icon={link.icon} label={link.name} asChild>
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          />
        </AsideButton>
      ))}
    </div>
  )
}

/* -------------------------------------------------------------------------------------------------
 * RegistrySidebar
 * -------------------------------------------------------------------------------------------------*/

type RegistrySidebarProps = {
  tree: PageTree.Root
  /**
   * Optional metadata for items (badges, dots, etc.)
   * Key is the page URL, e.g. "/components/scroll-area"
   */
  itemMeta?: Record<string, SidebarItemMeta>
}

export function RegistrySidebar({ tree, itemMeta = {} }: RegistrySidebarProps) {
  const pathname = usePathname()

  // Get all folders from the tree
  const folders = tree.children.filter(
    (child): child is PageTree.Folder => child.type === 'folder'
  )

  return (
    <div className="registry-sidebar flex h-full w-full flex-col gap-1">
      {/* Search */}
      <SearchTrigger />

      {/* Sections */}
      <nav className="bg-accent fancy-scroll overflow-y-auto py-2">
        {folders.map((folder, index) => {
          const folderName =
            typeof folder.name === 'string' ? folder.name : String(folder.name)
          const sectionId =
            folder.$id?.split(':')[1]?.toLowerCase() ?? folderName.toLowerCase()
          const isCurrentSection = pathname.startsWith(`/${sectionId}`)

          return (
            <SidebarSection
              key={folder.$id ?? index}
              folder={folder}
              defaultOpen={isCurrentSection || index === 0}
              meta={itemMeta}
            />
          )
        })}
      </nav>

      <div className="bg-muted min-h-0 flex-1" />

      {/* Social Links */}
      <SocialLinks />
    </div>
  )
}
