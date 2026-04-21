'use client'

import * as React from 'react'
import Link from 'next/link'
import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

type MobileNavSectionProps = {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  label: string
  href?: string
  isActive?: boolean
  defaultOpen?: boolean
  children: React.ReactNode
}

export function MobileNavSection({
  icon: Icon,
  label,
  href,
  isActive = false,
  defaultOpen = false,
  children,
}: MobileNavSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)

  const headerContent = (
    <>
      <Icon className="size-5" />
      <span className="font-mono text-xs font-medium tracking-wide uppercase">
        {label}
      </span>
    </>
  )

  const toggleIcon = isOpen ? (
    <Minus className="text-muted-foreground size-4" />
  ) : (
    <Plus className="text-muted-foreground size-4" />
  )

  return (
    <div className="group relative" data-active={isActive}>
      {href ? (
        <div
          className={cn(
            'flex w-full items-stretch gap-1 text-left transition-colors'
          )}
        >
          <Link
            href={href}
            className="h-mobile-header group-data-[active='true']:text-foreground group-data-[active='true']:bg-accent bg-secondary flex flex-1 items-center gap-3 pl-4 text-left transition-colors"
          >
            {headerContent}
          </Link>
          <button
            type="button"
            aria-expanded={isOpen}
            aria-label={isOpen ? `Collapse ${label}` : `Expand ${label}`}
            className="size-mobile-header bg-secondary group-data-[active='true']:bg-accent flex aspect-square items-center self-stretch px-4"
            onClick={() => setIsOpen(!isOpen)}
          >
            {toggleIcon}
          </button>
        </div>
      ) : (
        <button
          type="button"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "bg-secondary group-data-[active='true']:bg-accent flex h-full w-full items-center gap-3 px-4 text-left transition-colors"
          )}
        >
          {headerContent}
          <span className="ml-auto">{toggleIcon}</span>
        </button>
      )}

      {isOpen && <div className="bg-accent/50 flex flex-col">{children}</div>}
    </div>
  )
}
