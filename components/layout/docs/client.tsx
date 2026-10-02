'use client'

import {
  type ComponentProps,
  createContext,
  type ReactNode,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Maximize, Minimize } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/ui/kbd'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { usePathname } from 'fumadocs-core/framework'
import Link from 'fumadocs-core/link'
import type { SidebarTab } from '../sidebar/tabs'
import { isTabActive } from '../sidebar/tabs/dropdown'
import { useIsScrollTop } from 'fumadocs-ui/utils/use-is-scroll-top'

export const LayoutContext = createContext<{
  isNavTransparent: boolean
  isZenMode: boolean
  toggleZenMode: () => void
} | null>(null)

export function LayoutContextProvider({
  navTransparentMode = 'none',
  children,
}: {
  navTransparentMode?: 'always' | 'top' | 'none'
  children: ReactNode
}) {
  const [isZenMode, setIsZenMode] = useState(false)
  const toggleZenMode = useCallback(() => {
    if (window.matchMedia('(min-width: 768px)').matches) {
      setIsZenMode((value) => !value)
    }
  }, [])

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 768px)')
    const handleResize = () => {
      if (!desktop.matches) setIsZenMode(false)
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.repeat ||
        !event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.shiftKey ||
        event.key !== '.' ||
        !desktop.matches
      )
        return

      event.preventDefault()
      toggleZenMode()
    }

    desktop.addEventListener('change', handleResize)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      desktop.removeEventListener('change', handleResize)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [toggleZenMode])
  const isTop =
    useIsScrollTop({ enabled: navTransparentMode === 'top' }) ?? true
  const isNavTransparent =
    navTransparentMode === 'top' ? isTop : navTransparentMode === 'always'

  return (
    <LayoutContext
      value={useMemo(
        () => ({
          isNavTransparent,
          isZenMode,
          toggleZenMode,
        }),
        [isNavTransparent, isZenMode, toggleZenMode]
      )}
    >
      {children}
    </LayoutContext>
  )
}

export function ZenModeToggle() {
  const { isZenMode, toggleZenMode } = use(LayoutContext)!
  const Icon = isZenMode ? Minimize : Maximize
  const label = isZenMode ? 'Exit Zen mode' : 'Zen mode'

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="secondary"
          size="icon-sm"
          aria-pressed={isZenMode}
          aria-label={label}
          aria-keyshortcuts="Meta+."
          onClick={toggleZenMode}
          className="aria-pressed:bg-foreground aria-pressed:text-background aria-pressed:hover:bg-foreground/90 max-md:hidden"
        >
          <Icon aria-hidden="true" />
        </Button>
      </TooltipTrigger>
      <TooltipContent
        className="flex items-center gap-2"
        side="bottom"
        sideOffset={8}
      >
        {label} <Kbd>⌘.</Kbd>
      </TooltipContent>
    </Tooltip>
  )
}

export function LayoutHeader(props: ComponentProps<'header'>) {
  const { isNavTransparent } = use(LayoutContext)!

  return (
    <header data-transparent={isNavTransparent} {...props}>
      {props.children}
    </header>
  )
}

export function LayoutBody({
  className,
  style,
  children,
  ...props
}: ComponentProps<'div'>) {
  const { isZenMode } = use(LayoutContext)!

  return (
    <div
      id="nd-docs-layout"
      data-zen={isZenMode}
      className={cn(
        'grid min-h-(--fd-docs-height) auto-cols-auto auto-rows-auto overflow-x-clip [--fd-docs-height:100dvh] [--fd-header-height:0px] [--fd-sidebar-width:0px] [--fd-toc-popover-height:0px] [--fd-toc-width:0px]',
        isZenMode &&
          '[&>#nd-toc]:hidden [&>[data-slot=experiment-toc]]:hidden [&>[data-slot=layout-sidebar]]:hidden [&>[data-toc-popover]]:hidden',
        className
      )}
      style={
        {
          gridTemplate: `"sidebar header toc"
        "sidebar toc-popover toc"
        "sidebar main toc" 1fr / minmax(var(--fd-sidebar-width), 1fr) minmax(0, calc(var(--fd-layout-width) - var(--fd-sidebar-width) - var(--fd-toc-width))) minmax(min-content, 1fr)`,
          '--fd-docs-row-1': 'var(--fd-banner-height, 0px)',
          '--fd-docs-row-2':
            'calc(var(--fd-docs-row-1) + var(--fd-header-height))',
          '--fd-docs-row-3':
            'calc(var(--fd-docs-row-2) + var(--fd-toc-popover-height))',
          ...style,
          ...(isZenMode && {
            gridTemplate: '"header" "main" 1fr / minmax(0, 1fr)',
          }),
        } as object
      }
      {...props}
    >
      {children}
    </div>
  )
}

export function LayoutTabs({
  options,
  ...props
}: ComponentProps<'div'> & {
  options: SidebarTab[]
}) {
  const pathname = usePathname()
  const selected = useMemo(() => {
    return options.findLast((option) => isTabActive(option, pathname))
  }, [options, pathname])

  return (
    <div
      {...props}
      className={cn(
        'flex flex-row items-end gap-6 overflow-auto [grid-area:main]',
        props.className
      )}
    >
      {options.map((option, i) => (
        <Link
          key={i}
          href={option.url}
          className={cn(
            'text-muted-foreground hover:text-accent-foreground inline-flex items-center gap-2 border-b-2 border-transparent pb-1.5 text-sm font-medium text-nowrap transition-colors',
            option.unlisted && selected !== option && 'hidden',
            selected === option && 'border-primary text-primary'
          )}
        >
          {option.title}
        </Link>
      ))}
    </div>
  )
}
