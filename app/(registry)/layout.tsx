import type { CSSProperties } from 'react'
import { source } from '@/lib/source'
import { TreeContextProvider } from 'fumadocs-ui/contexts/tree'
import {
  LayoutContextProvider,
  LayoutBody,
} from '@/components/layout/docs/client'
import { LayoutProvider } from '@/hooks/use-layout'
import { RegistrySidebar } from '@/components/layout/sidebar'
import { MobileNav } from '@/components/layout/mobile-nav'

// Optional: Define item metadata for badges/dots
const itemMeta: Record<
  string,
  { badge?: 'new' | 'updated'; dot?: 'red' | 'blue' | 'green' | 'yellow' }
> = {
  // Example:
  // '/components/scroll-area': { badge: 'new' },
  // '/components/infinite-list': { badge: 'updated' },
}

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <LayoutProvider defaultLayout="fixed" storageKey="layout">
      <TreeContextProvider tree={source.pageTree}>
        <LayoutContextProvider>
          <MobileNav tree={source.pageTree} itemMeta={itemMeta} />
          <LayoutBody
            style={
              {
                '--fd-sidebar-width':
                  'calc(var(--aside-width) + var(--spacing) + var(--sidebar-width))',
              } as CSSProperties
            }
          >
            <RegistrySidebar tree={source.pageTree} itemMeta={itemMeta} />
            {children}
          </LayoutBody>
        </LayoutContextProvider>
      </TreeContextProvider>
    </LayoutProvider>
  )
}
