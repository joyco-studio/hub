'use client'

import * as React from 'react'
import { Presence } from '@radix-ui/react-presence'
import { cn } from '@/lib/utils'

interface ScrollAreaContextValue {
  scrollRef: React.RefObject<HTMLDivElement | null>
  hasScroll: boolean
  orientation: 'vertical' | 'horizontal'
}

const ScrollAreaContext = React.createContext<ScrollAreaContextValue | null>(
  null
)

function useScrollAreaContext() {
  const ctx = React.useContext(ScrollAreaContext)
  if (!ctx) {
    throw new Error('ScrollArea components must be used within ScrollArea Root')
  }
  return ctx
}

interface ScrollAreaRootProps extends React.ComponentProps<'div'> {
  orientation?: 'vertical' | 'horizontal'
  topShadowGradient?: string
  bottomShadowGradient?: string
  leftShadowGradient?: string
  rightShadowGradient?: string
}

/**
 * Root component for the ScrollArea component. (Basic layout that adds a wrapper and shadows handlers)
 * Supports vertical or horizontal scroll directions.
 * @example
 * ```tsx
 * import ScrollArea from '@/registry/joyco/blocks/scroll-area';
 * ```
 * @example
 * ```tsx
 * <ScrollArea.Root orientation="vertical">
 *   <ScrollArea.Content>
 *     <div>Content here</div>
 *   </ScrollArea.Content>
 * </ScrollArea.Root>
 *
 * <ScrollArea.Root orientation="horizontal">
 *   <ScrollArea.Content>
 *     <div className="flex gap-4">
 *       <div>Item 1</div>
 *       <div>Item 2</div>
 *     </div>
 *   </ScrollArea.Content>
 * </ScrollArea.Root>
 * ```
 */
export const Root = React.forwardRef<
  HTMLDivElement,
  ScrollAreaRootProps
>(
  (
    {
      className,
      children,
      orientation = 'vertical',
      topShadowGradient,
      bottomShadowGradient,
      leftShadowGradient,
      rightShadowGradient,
      ...props
    },
    ref
  ) => {
    const scrollRef = React.useRef<HTMLDivElement>(null)
    const [hasScrollTop, setHasScrollTop] = React.useState(false)
    const [hasScrollBottom, setHasScrollBottom] = React.useState(false)
    const [hasScrollLeft, setHasScrollLeft] = React.useState(false)
    const [hasScrollRight, setHasScrollRight] = React.useState(false)

    const update = React.useCallback(() => {
      const el = scrollRef.current
      if (!el) return

      if (orientation === 'vertical') {
        // Vertical scroll detection
        const scrollY = Math.ceil(el.scrollTop)
        const scrollHeight = el.scrollHeight
        const clientHeight = el.clientHeight

        const newHasScrollTop = scrollY > 0
        const newHasScrollBottom = scrollY + clientHeight < scrollHeight

        setHasScrollTop(newHasScrollTop)
        setHasScrollBottom(newHasScrollBottom)
      } else {
        const scrollX = Math.ceil(el.scrollLeft)
        const scrollWidth = el.scrollWidth
        const clientWidth = el.clientWidth

        const newHasScrollLeft = scrollX > 0
        const newHasScrollRight = scrollX + clientWidth < scrollWidth

        setHasScrollLeft(newHasScrollLeft)
        setHasScrollRight(newHasScrollRight)
      }
    }, [orientation])

    // scroll event, resize observer, and mutation observer
    React.useEffect(() => {
      const el = scrollRef.current
      if (!el) return

      // scroll event handler` (detects the scroll event)
      const handleScroll = () => requestAnimationFrame(update)
      el.addEventListener('scroll', handleScroll, { passive: true })

      // resize observer (detects when the container size changes)
      const ro = new ResizeObserver(update)
      ro.observe(el)

      // mutation observer (detects when the children of the container change)
      const mo = new MutationObserver(update)
      mo.observe(el, { childList: true })

      update()

      return () => {
        el.removeEventListener('scroll', handleScroll)
        ro.disconnect()
        mo.disconnect()
      }
    }, [update])

    const hasScroll =
      hasScrollTop || hasScrollBottom || hasScrollLeft || hasScrollRight

    const ctxValue = React.useMemo(
      () => ({
        scrollRef,
        hasScroll,
        orientation,
      }),
      [hasScroll, orientation]
    )

    // Common shadow classes
    const shadowBaseClasses =
      'pointer-events-none absolute z-20 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-300 ease-out'

    const shadows =
      orientation === 'vertical'
        ? [
            {
              present: hasScrollTop,
              position: 'inset-x-0 top-0 h-8',
              slide:
                'data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2',
              gradient:
                topShadowGradient ||
                'bg-linear-to-b from-background to-transparent',
            },
            {
              present: hasScrollBottom,
              position: 'inset-x-0 bottom-0 h-8',
              slide:
                'data-[state=closed]:slide-out-to-bottom-2 data-[state=open]:slide-in-from-bottom-2',
              gradient:
                bottomShadowGradient ||
                'bg-linear-to-t from-background to-transparent',
            },
          ]
        : [
            {
              present: hasScrollLeft,
              position: 'inset-y-0 left-0 w-8',
              slide:
                'data-[state=closed]:slide-out-to-left-2 data-[state=open]:slide-in-from-left-2',
              gradient:
                leftShadowGradient ||
                'bg-linear-to-r from-background to-transparent',
            },
            {
              present: hasScrollRight,
              position: 'inset-y-0 right-0 w-8',
              slide:
                'data-[state=closed]:slide-out-to-right-2 data-[state=open]:slide-in-from-right-2',
              gradient:
                rightShadowGradient ||
                'bg-linear-to-l from-background to-transparent',
            },
          ]

    const dataAttributes =
      orientation === 'vertical'
        ? {
            'data-scroll-top': hasScrollTop,
            'data-scroll-bottom': hasScrollBottom,
          }
        : {
            'data-scroll-left': hasScrollLeft,
            'data-scroll-right': hasScrollRight,
          }

    return (
      <ScrollAreaContext.Provider value={ctxValue}>
        <div
          ref={ref}
          className={cn(
            'group/scroll-area relative overflow-hidden',
            className
          )}
          data-has-scroll={hasScroll}
          data-orientation={orientation}
          {...dataAttributes}
          {...props}
        >
          {children}

          {shadows.map((shadow, index) => (
            <Presence key={index} present={shadow.present}>
              <div
                data-state={shadow.present ? 'open' : 'closed'}
                className={cn(
                  shadowBaseClasses,
                  shadow.position,
                  shadow.slide,
                  shadow.gradient
                )}
              />
            </Presence>
          ))}
        </div>
      </ScrollAreaContext.Provider>
    )
  }
)
Root.displayName = 'ScrollAreaRoot'

type ScrollAreaContentProps = React.ComponentProps<'div'>

/**
 * Content component for the ScrollArea component. (It contains the scrollable content.)
 * @example
 * ```tsx
 * import ScrollArea from '@/registry/joyco/blocks/scroll-area';
 * ```
 * @example
 * ```tsx
 * <ScrollArea.Content>
 *   <div>Content here</div>
 * </ScrollArea.Content>
 */
export const Content = React.forwardRef<
  HTMLDivElement,
  ScrollAreaContentProps
>(({ className, children, ...props }, ref) => {
  const { scrollRef, orientation } = useScrollAreaContext()

  const combinedRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      scrollRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref)
        (ref as React.RefObject<HTMLDivElement | null>).current = node
    },
    [ref, scrollRef]
  )

  const overflowClasses =
    orientation === 'horizontal'
      ? 'overflow-x-auto overflow-y-hidden'
      : 'overflow-y-auto'

  return (
    <div
      ref={combinedRef}
      className={cn(
        '[scrollbar-color:hsl(0_0%_50%)] [scrollbar-gutter:stable] [scrollbar-width:thin]',
        overflowClasses,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})

Content.displayName = 'ScrollAreaContent'
