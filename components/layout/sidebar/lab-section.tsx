'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import FlaskIcon from '@/components/icons/flask'
import { cn } from '@/lib/utils'
import type { Experiment } from '@/lib/lab'
import { CollapsibleSection } from './collapsible-section'

type LabSidebarSectionProps = {
  experiments: Experiment[]
}

export function LabSidebarSection({ experiments }: LabSidebarSectionProps) {
  const pathname = usePathname()

  const isActive = pathname.startsWith('/lab')

  return (
    <CollapsibleSection name="Lab" icon={FlaskIcon} defaultOpen isActive={isActive}>
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
    </CollapsibleSection>
  )
}
