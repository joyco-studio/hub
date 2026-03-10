'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Minus, Plus } from 'lucide-react'
import FlaskIcon from '@/components/icons/flask'
import { cn } from '@/lib/utils'
import type { Experiment } from '@/lib/lab'

type LabSidebarSectionProps = {
  experiments: Experiment[]
}

export function LabSidebarSection({ experiments }: LabSidebarSectionProps) {
  const [isOpen, setIsOpen] = React.useState(true)
  const pathname = usePathname()

  const isActive = pathname.startsWith('/lab')

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'min-h-aside-width flex items-center gap-2 px-4 py-5 text-left transition-colors',
          'hover:bg-accent',
          isActive && 'text-foreground/70'
        )}
      >
        <FlaskIcon className="size-4" />
        <span className="font-mono text-sm font-medium tracking-wide uppercase">
          Lab
        </span>
        <span className="ml-auto">
          {isOpen ? (
            <Minus className="text-muted-foreground size-3" />
          ) : (
            <Plus className="text-muted-foreground size-3" />
          )}
        </span>
      </button>

      {isOpen && (
        <>
          <div className="border-border ml-4 flex flex-col border-l-2">
            {experiments.map((experiment) => {
              const url = `/lab/${experiment.slug}`
              const isItemActive = pathname === url

              return (
                <Link
                  key={experiment.slug}
                  href={url}
                  className={cn(
                    '-ml-[2px] flex items-center gap-2 px-4 py-1.5 font-mono text-sm tracking-wide uppercase transition-colors',
                    isItemActive
                      ? 'text-foreground border-foreground bg-accent border-l-4 pl-6 font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:border-foreground/50 border-l-2'
                  )}
                >
                  <span className="truncate">{experiment.title}</span>
                </Link>
              )
            })}
          </div>
          <div className="border-border ml-4 h-3 border-l-2" />
        </>
      )}
    </div>
  )
}
