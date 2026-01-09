'use client'

import {
  type ComponentProps,
  createContext,
  Fragment,
  use,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from 'react'
import CaretDownIcon from '@/components/icons/caret-down'
import CaretLeftIcon from '@/components/icons/caret-left'
import CaretRightIcon from '@/components/icons/caret-right'
import Link from 'fumadocs-core/link'
import { cn } from '../../../../lib/cn'
import { useI18n } from 'fumadocs-ui/contexts/i18n'
import { useTreeContext, useTreePath } from 'fumadocs-ui/contexts/tree'
import type * as PageTree from 'fumadocs-core/page-tree'
import { usePathname } from 'fumadocs-core/framework'
import {
  type BreadcrumbOptions,
  getBreadcrumbItemsFromPath,
} from 'fumadocs-core/breadcrumb'
import { isActive } from '../../../../lib/urls'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../../../ui/collapsible'
import { useTOCItems } from '../../../toc'
import { useActiveAnchor } from 'fumadocs-core/toc'
import { useFooterItems } from 'fumadocs-ui/utils/use-footer-items'

const TocPopoverContext = createContext<{
  open: boolean
  setOpen: (open: boolean) => void
} | null>(null)

export function PageTOCPopover({
  className,
  children,
  ...rest
}: ComponentProps<'div'>) {
  const ref = useRef<HTMLElement>(null)
  const [open, setOpen] = useState(false)

  const onClick = useEffectEvent((e: Event) => {
    if (!open) return

    if (ref.current && !ref.current.contains(e.target as HTMLElement))
      setOpen(false)
  })

  useEffect(() => {
    window.addEventListener('click', onClick)

    return () => {
      window.removeEventListener('click', onClick)
    }
  }, [])

  return (
    <TocPopoverContext
      value={useMemo(
        () => ({
          open,
          setOpen,
        }),
        [setOpen, open]
      )}
    >
      <Collapsible
        open={open}
        onOpenChange={setOpen}
        data-toc-popover=""
        className={cn(
          'max-xl:layout:[--fd-toc-popover-height:--spacing(10)] sticky top-(--fd-docs-row-2) z-(--z-toc-popover) h-(--fd-toc-popover-height) [grid-area:toc-popover] xl:hidden',
          className
        )}
        {...rest}
      >
        <header ref={ref} className="bg-background font-mono">
          {children}
        </header>
      </Collapsible>
    </TocPopoverContext>
  )
}

export function PageTOCPopoverTrigger({
  className,
  ...props
}: ComponentProps<'button'>) {
  const { text } = useI18n()
  const { open } = use(TocPopoverContext)!
  const items = useTOCItems()
  const active = useActiveAnchor()
  const selected = useMemo(
    () => items.findIndex((item) => active === item.url.slice(1)),
    [items, active]
  )
  const path = useTreePath().at(-1)
  const showItem = selected !== -1 && !open

  return (
    <CollapsibleTrigger
      className={cn(
        'px-content-sides text-muted-foreground flex h-10 w-full items-center text-start text-xs tracking-wide uppercase focus-visible:outline-none [&_svg]:size-4',
        className
      )}
      data-toc-popover-trigger=""
      {...props}
    >
      {/* Inner container matching page content max-width */}
      <div className="mx-auto flex w-full max-w-2xl items-center gap-2.5 2xl:max-w-3xl">
        <ProgressHexagon
          value={(selected + 1) / Math.max(1, items.length)}
          max={1}
          className={cn('shrink-0', open && 'text-foreground')}
        />
        <span className="grid flex-1 *:col-start-1 *:row-start-1 *:my-auto">
          <span
            className={cn(
              'truncate transition-[opacity,translate,color]',
              open && 'text-foreground',
              showItem && 'pointer-events-none -translate-y-full opacity-0'
            )}
          >
            {path?.name ?? text.toc}
          </span>
          <span
            className={cn(
              'truncate transition-[opacity,translate]',
              !showItem && 'pointer-events-none translate-y-full opacity-0'
            )}
          >
            {items[selected]?.title}
          </span>
        </span>
        <CaretDownIcon
          className={cn(
            'mx-0.5 size-4 shrink-0 transition-transform',
            open && 'rotate-180'
          )}
        />
      </div>
    </CollapsibleTrigger>
  )
}

interface ProgressHexagonProps extends Omit<
  React.ComponentProps<'svg'>,
  'strokeWidth'
> {
  value: number
  strokeWidth?: number
  size?: number
  min?: number
  max?: number
}

function clamp(input: number, min: number, max: number): number {
  if (input < min) return min
  if (input > max) return max
  return input
}

function ProgressHexagon({
  value,
  strokeWidth = 2,
  size = 16,
  min = 0,
  max = 100,
  ...restSvgProps
}: ProgressHexagonProps) {
  const normalizedValue = clamp(value, min, max)

  // Circumradius: distance from center to vertex, accounting for stroke width
  const radius = (size - strokeWidth) / 2
  const centerX = size / 2
  const centerY = size / 2

  // Calculate the 6 vertices for a flat-top hexagon
  // Start from top vertex (90°) and go clockwise so progress fills to the right
  const points: [number, number][] = []
  for (let i = 0; i < 6; i++) {
    const angle = (90 - i * 60) * (Math.PI / 180)
    const x = centerX + radius * Math.cos(angle)
    const y = centerY - radius * Math.sin(angle)
    points.push([x, y])
  }

  // For a regular hexagon, side length = circumradius, perimeter = 6 * radius
  // Add extra segment to ensure visual closure at 100%
  const perimeter = 7 * radius
  const progress = (normalizedValue / max) * perimeter

  // Build path: 6 points + repeat first 2 points to extend past start for complete closure
  const extendedPoints = [...points, points[0], points[1]]
  const pathD = extendedPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`)
    .join(' ')

  return (
    <svg
      role="progressbar"
      viewBox={`0 0 ${size} ${size}`}
      aria-valuenow={normalizedValue}
      aria-valuemin={min}
      aria-valuemax={max}
      {...restSvgProps}
    >
      {/* Background hexagon */}
      <path
        d={pathD}
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        className="stroke-current/25"
      />
      {/* Progress hexagon */}
      <path
        d={pathD}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeDasharray={perimeter}
        strokeDashoffset={perimeter - progress}
        className="transition-all"
        style={{ transformOrigin: 'center' }}
      />
    </svg>
  )
}

export function PageTOCPopoverContent(props: ComponentProps<'div'>) {
  return (
    <CollapsibleContent
      data-toc-popover-content=""
      {...props}
      className={cn('flex max-h-[50vh] flex-col', props.className)}
    >
      {/* Inner container matching page content max-width */}
      <div className="px-content-sides mx-auto w-full max-w-2xl 2xl:max-w-3xl">
        {props.children}
      </div>
    </CollapsibleContent>
  )
}

export function PageLastUpdate({
  date: value,
  ...props
}: Omit<ComponentProps<'p'>, 'children'> & { date: Date }) {
  const { text } = useI18n()
  const [date, setDate] = useState('')

  useEffect(() => {
    // to the timezone of client
    setDate(value.toLocaleDateString())
  }, [value])

  return (
    <p
      {...props}
      className={cn('text-muted-foreground text-sm', props.className)}
    >
      {text.lastUpdate} {date}
    </p>
  )
}

type Item = Pick<PageTree.Item, 'name' | 'description' | 'url'>
export interface FooterProps extends ComponentProps<'div'> {
  /**
   * Items including information for the next and previous page
   */
  items?: {
    previous?: Item
    next?: Item
  }
}

export function PageFooter({ items, ...props }: FooterProps) {
  const footerList = useFooterItems()
  const pathname = usePathname()

  const { previous, next } = useMemo(() => {
    if (items) return items

    const idx = footerList.findIndex((item) =>
      isActive(item.url, pathname, false)
    )

    if (idx === -1) return {}
    return {
      previous: footerList[idx - 1],
      next: footerList[idx + 1],
    }
  }, [footerList, items, pathname])

  return (
    <div
      {...props}
      className={cn(
        'mt-10 grid w-full gap-4',
        previous && next ? 'grid-cols-2' : 'grid-cols-1',
        props.className
      )}
    >
      {previous ? <FooterItem item={previous} index={0} /> : null}
      {next ? <FooterItem item={next} index={1} /> : null}
    </div>
  )
}

function FooterItem({ item, index }: { item: Item; index: 0 | 1 }) {
  const { text } = useI18n()
  const Icon = index === 0 ? CaretLeftIcon : CaretRightIcon

  const arrowPanel = (
    <div className="bg-accent flex items-center justify-center px-6">
      <Icon className="size-5 shrink-0 rtl:rotate-180" />
    </div>
  )

  const contentPanel = (
    <div className="bg-muted flex flex-1 flex-col justify-center gap-1 p-4">
      <p className="font-mono text-sm font-medium tracking-wide uppercase">
        {item.name}
      </p>
      <p className="text-muted-foreground line-clamp-2 text-sm">
        {item.description ?? (index === 0 ? text.previousPage : text.nextPage)}
      </p>
    </div>
  )

  return (
    <Link
      href={item.url}
      className="group flex min-h-24 gap-1 transition-opacity hover:opacity-90 @max-lg:col-span-full"
    >
      {index === 0 ? (
        <>
          {arrowPanel}
          {contentPanel}
        </>
      ) : (
        <>
          {contentPanel}
          {arrowPanel}
        </>
      )}
    </Link>
  )
}

export type BreadcrumbProps = BreadcrumbOptions & ComponentProps<'div'>

export function PageBreadcrumb({
  includeRoot,
  includeSeparator,
  includePage,
  ...props
}: BreadcrumbProps) {
  const path = useTreePath()
  const { root } = useTreeContext()
  const items = useMemo(() => {
    return getBreadcrumbItemsFromPath(root, path, {
      includePage,
      includeSeparator,
      includeRoot,
    })
  }, [includePage, includeRoot, includeSeparator, path, root])

  if (items.length === 0) return null

  return (
    <div
      {...props}
      className={cn(
        'text-muted-foreground flex items-center gap-1.5 text-sm',
        props.className
      )}
    >
      {items.map((item, i) => {
        const className = cn(
          'truncate',
          i === items.length - 1 && 'text-primary font-medium'
        )

        return (
          <Fragment key={i}>
            {i !== 0 && <CaretRightIcon className="size-3.5 shrink-0" />}
            {item.url ? (
              <Link
                href={item.url}
                className={cn(className, 'transition-opacity hover:opacity-80')}
              >
                {item.name}
              </Link>
            ) : (
              <span className={className}>{item.name}</span>
            )}
          </Fragment>
        )
      })}
    </div>
  )
}
