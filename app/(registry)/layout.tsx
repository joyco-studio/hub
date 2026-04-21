import type { CSSProperties } from 'react'
import {
  source,
  getGameSlugs,
  getEffectSlugs,
  getCanvasSlugs,
  getLibrarySlugs,
} from '@/lib/source'
import { TreeContextProvider } from 'fumadocs-ui/contexts/tree'
import {
  LayoutContextProvider,
  LayoutBody,
} from '@/components/layout/docs/client'
import { RegistrySidebar } from '@/components/layout/sidebar'
import { MobileNav } from '@/components/layout/mobile-nav'
import { getExperiments } from '@/lib/lab'
import { CommandPalette } from '@/components/layout/command-palette'

const itemMeta: Record<
  string,
  {
    badge?: 'new' | 'updated' | 'internal'
    dot?: 'red' | 'blue' | 'green' | 'yellow'
    hidden?: boolean
  }
> = {
  '/toolbox/skills': { badge: 'new' },
  '/toolbox/ui': { hidden: true },
}

export default async function Layout({ children }: LayoutProps<'/'>) {
  const gameSlugs = getGameSlugs()
  const effectSlugs = getEffectSlugs()
  const canvasSlugs = getCanvasSlugs()
  const librarySlugs = getLibrarySlugs()
  const { experiments } = await getExperiments()

  return (
    <TreeContextProvider tree={source.pageTree}>
      <LayoutContextProvider>
        <MobileNav
          tree={source.pageTree}
          itemMeta={itemMeta}
          experiments={experiments}
        />
        <LayoutBody
          style={
            {
              '--fd-sidebar-width':
                'calc(var(--aside-width) + var(--spacing) + var(--sidebar-width))',
            } as CSSProperties
          }
        >
          <RegistrySidebar
            tree={source.pageTree}
            itemMeta={itemMeta}
            gameSlugs={gameSlugs}
            effectSlugs={effectSlugs}
            canvasSlugs={canvasSlugs}
            librarySlugs={librarySlugs}
            experiments={experiments}
          />
          {children}
        </LayoutBody>
      </LayoutContextProvider>
      <CommandPalette />
    </TreeContextProvider>
  )
}
