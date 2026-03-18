import type { CSSProperties } from 'react'
import { source, getGameSlugs, getEffectSlugs, getCanvasSlugs } from '@/lib/source'
import { TreeContextProvider } from 'fumadocs-ui/contexts/tree'
import {
  LayoutContextProvider,
  LayoutBody,
} from '@/components/layout/docs/client'
import { RegistrySidebar } from '@/components/layout/sidebar'
import { MobileNav } from '@/components/layout/mobile-nav'
import { getExperiments } from '@/lib/lab'
import { CommandPalette } from '@/components/layout/command-palette'

// Optional: Define item metadata for badges/dots
const itemMeta: Record<
  string,
  { badge?: 'new' | 'updated'; dot?: 'red' | 'blue' | 'green' | 'yellow' }
> = {
  '/toolbox/skills': { badge: 'new' },
}

export default async function Layout({ children }: LayoutProps<'/'>) {
  const gameSlugs = getGameSlugs()
  const effectSlugs = getEffectSlugs()
  const canvasSlugs = getCanvasSlugs()
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
            experiments={experiments}
          />
          {children}
        </LayoutBody>
      </LayoutContextProvider>
      <CommandPalette />
    </TreeContextProvider>
  )
}
