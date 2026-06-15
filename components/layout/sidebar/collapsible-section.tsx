'use client'

import * as React from 'react'
import { Collapsible } from 'radix-ui'
import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Plus/minus indicator that cross-fades between the two icons on toggle, so
 * the swap isn't abrupt. Pure `opacity` (compositor-friendly).
 */
function PlusMinus({ open }: { open: boolean }) {
  return (
    <span className="text-muted-foreground relative block size-3">
      <Plus
        className={cn(
          'absolute inset-0 size-3 transition-opacity duration-200 ease-out',
          open ? 'opacity-0' : 'opacity-100'
        )}
      />
      <Minus
        className={cn(
          'absolute inset-0 size-3 transition-opacity duration-200 ease-out',
          open ? 'opacity-100' : 'opacity-0'
        )}
      />
    </span>
  )
}

type CollapsibleSectionProps = {
  name: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  defaultOpen?: boolean
  isActive?: boolean
  children: React.ReactNode
}

/**
 * Shared collapsible panel used across the sidebar (Components, Toolbox, Logs,
 * Lab). Built on Radix `Collapsible` for accessibility (aria-expanded,
 * keyboard handling, managed mount/unmount).
 *
 * The reveal animates off Radix's `data-state` via the `collapsible-open` /
 * `collapsible-close` keyframes (see globals.css): height (using Radix's
 * measured `--radix-collapsible-content-height`) plus an opacity fade, so
 * sibling panels reflow smoothly. Radix keeps the content mounted for the
 * duration of the close keyframe, then unmounts it.
 *
 * The animation is gated behind `animate` so panels that start open don't
 * replay the keyframe on initial mount (which would flash on every reload).
 */
export function CollapsibleSection({
  name,
  icon: Icon,
  defaultOpen = true,
  isActive = false,
  children,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)
  // Skip the reveal animation on initial mount (otherwise panels that start
  // open replay the open keyframe on every page load — a flash). Only animate
  // once the user has actually toggled.
  const [animate, setAnimate] = React.useState(false)

  const handleOpenChange = (open: boolean) => {
    setAnimate(true)
    setIsOpen(open)
  }

  return (
    <Collapsible.Root
      open={isOpen}
      onOpenChange={handleOpenChange}
      className="flex flex-col"
    >
      <Collapsible.Trigger
        className={cn(
          'min-h-aside-width flex items-center gap-2 ps-4 py-5 text-left transition-colors',
          'hover:bg-accent',
          // The scroll container reserves a 12px scrollbar gutter (see
          // `scrollbar-gutter: stable` on the sidebar <nav>). Bleed the header
          // back over that gutter so its full-width background reaches the real
          // edge, while the list items below keep the reserved padding.
          '-me-3 pe-[calc(1rem+12px)]',
          isActive && 'text-foreground/70'
        )}
      >
        <Icon className="size-4" />
        <span className="font-mono text-sm font-medium tracking-wide uppercase">
          {name}
        </span>
        <span className="ml-auto">
          <PlusMinus open={isOpen} />
        </span>
      </Collapsible.Trigger>

      <Collapsible.Content
        className={cn(
          'overflow-hidden',
          animate && 'data-[state=open]:animate-collapsible-open',
          animate && 'data-[state=closed]:animate-collapsible-close'
        )}
      >
        {children}
        <div className="border-border ml-4 h-3 border-l-2" />
      </Collapsible.Content>
    </Collapsible.Root>
  )
}
