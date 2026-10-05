'use client'

import {
  type ComponentProps,
  createContext,
  type ReactNode,
  use,
  useCallback,
  type SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { flushSync } from 'react-dom'
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

const ZEN_DESKTOP_QUERY = '(min-width: 768px)'

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Hands the state flip to the View Transitions API, which snapshots the layout
 * before and after and animates between the two. The grid swap itself stays
 * instant — `::view-transition-*` in globals.css owns the motion.
 */
const runZenTransition = (update: () => void) => {
  if (!document.startViewTransition || prefersReducedMotion()) {
    update()
    return
  }

  // The callback has to leave the DOM in its final state synchronously,
  // otherwise the API snapshots a half-updated layout.
  document.startViewTransition(() => flushSync(update))
}

/** Regions Zen mode collapses — focus must never be left inside them. */
const ZEN_COLLAPSED_REGIONS =
  '[data-slot="layout-sidebar"], #nd-toc, [data-slot="experiment-toc"]'

const isModalOpen = () =>
  document.querySelector('[role="dialog"][aria-modal="true"]') !== null

/** `display: none` elements cannot take focus, so skip them. */
const isRendered = (element: Element | null): element is HTMLElement =>
  element instanceof HTMLElement && element.getClientRects().length > 0

/**
 * Preferred landing spot first. The toggle is hidden on top-category pages and
 * absent on lab routes, so fall back to the article and then to the layout.
 */
const ZEN_FOCUS_FALLBACKS = [
  '[data-slot="zen-toggle"]',
  '#nd-page',
  '#nd-docs-layout',
]

const hasNoModifiers = (event: KeyboardEvent) =>
  !event.metaKey && !event.ctrlKey && !event.altKey && !event.shiftKey

export function LayoutContextProvider({
  navTransparentMode = 'none',
  children,
}: {
  navTransparentMode?: 'always' | 'top' | 'none'
  children: ReactNode
}) {
  const [isZenMode, setIsZenMode] = useState(false)

  const setZenMode = useCallback((next: SetStateAction<boolean>) => {
    runZenTransition(() => setIsZenMode(next))
  }, [])

  const toggleZenMode = useCallback(() => {
    if (!window.matchMedia(ZEN_DESKTOP_QUERY).matches) return
    setZenMode((value) => !value)
  }, [setZenMode])

  useEffect(() => {
    const desktop = window.matchMedia(ZEN_DESKTOP_QUERY)
    const handleResize = () => {
      if (!desktop.matches) setIsZenMode(false)
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat || !desktop.matches) return

      // Escape leaves Zen mode, unless a modal is up and owns the key.
      if (
        event.key === 'Escape' &&
        isZenMode &&
        hasNoModifiers(event) &&
        !isModalOpen()
      ) {
        event.preventDefault()
        setZenMode(false)
        return
      }

      if (
        event.key === '.' &&
        event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        !event.shiftKey
      ) {
        event.preventDefault()
        toggleZenMode()
      }
    }

    desktop.addEventListener('change', handleResize)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      desktop.removeEventListener('change', handleResize)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isZenMode, setZenMode, toggleZenMode])

  // Entering Zen mode hides the sidebar and TOC. If focus was inside one of
  // them the browser would drop it on <body>, so hand it to the toggle.
  useEffect(() => {
    if (!isZenMode) return
    const active = document.activeElement
    if (
      !(active instanceof HTMLElement) ||
      !active.closest(ZEN_COLLAPSED_REGIONS)
    )
      return

    for (const selector of ZEN_FOCUS_FALLBACKS) {
      const target = document.querySelector(selector)
      if (isRendered(target)) {
        target.focus()
        return
      }
    }
  }, [isZenMode])
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
          data-slot="zen-toggle"
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
      tabIndex={-1}
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
          // The swap is instant; the View Transitions API animates between the
          // two snapshots. See `::view-transition-*` in globals.css.
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
