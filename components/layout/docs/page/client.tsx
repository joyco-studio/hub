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
        'px-content-sides text-fd-muted-foreground flex h-10 w-full items-center text-start text-xs tracking-wide uppercase focus-visible:outline-none [&_svg]:size-4',
        className
      )}
      data-toc-popover-trigger=""
      {...props}
    >
      {/* Inner container matching page content max-width */}
      <div className="mx-auto flex w-full max-w-2xl items-center gap-2.5 2xl:max-w-3xl">
        <ProgressSquare
          value={(selected + 1) / Math.max(1, items.length)}
          max={1}
          className={cn('shrink-0', open && 'text-primary')}
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

interface ProgressSquareProps extends Omit<
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

function ProgressSquare({
  value,
  strokeWidth = 2,
  size = 16,
  min = 0,
  max = 100,
  ...restSvgProps
}: ProgressSquareProps) {
  const normalizedValue = clamp(value, min, max)
  // Square perimeter = 4 * side, but we draw from inside so side = size - strokeWidth
  const innerSize = size - strokeWidth
  const perimeter = 4 * innerSize
  const progress = (normalizedValue / max) * perimeter
  const offset = strokeWidth / 2

  return (
    <svg
      role="progressbar"
      viewBox={`0 0 ${size} ${size}`}
      aria-valuenow={normalizedValue}
      aria-valuemin={min}
      aria-valuemax={max}
      {...restSvgProps}
    >
      {/* Background square */}
      <rect
        x={offset}
        y={offset}
        width={innerSize}
        height={innerSize}
        fill="none"
        strokeWidth={strokeWidth}
        className="stroke-current/25"
      />
      {/* Progress square */}
      <rect
        x={offset}
        y={offset}
        width={innerSize}
        height={innerSize}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
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
      className={cn('text-fd-muted-foreground text-sm', props.className)}
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
        '@container mx-auto grid w-full max-w-2xl gap-4 2xl:max-w-3xl',
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

  return (
    <Link
      href={item.url}
      className={cn(
        'hover:bg-fd-accent/80 hover:text-fd-accent-foreground flex flex-col gap-2 rounded-lg border p-4 text-sm transition-colors @max-lg:col-span-full',
        index === 1 && 'text-end'
      )}
    >
      <div
        className={cn(
          'inline-flex items-center gap-1.5 font-medium',
          index === 1 && 'flex-row-reverse'
        )}
      >
        <Icon className="-mx-1 size-4 shrink-0 rtl:rotate-180" />
        <p>{item.name}</p>
      </div>
      <p className="text-fd-muted-foreground truncate">
        {item.description ?? (index === 0 ? text.previousPage : text.nextPage)}
      </p>
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
        'text-fd-muted-foreground flex items-center gap-1.5 text-sm',
        props.className
      )}
    >
      {items.map((item, i) => {
        const className = cn(
          'truncate',
          i === items.length - 1 && 'text-fd-primary font-medium'
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
