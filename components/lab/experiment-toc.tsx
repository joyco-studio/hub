'use client'

import { ArrowUpRight } from 'lucide-react'
import FlaskIcon from '@/components/icons/flask'
import { useLayout } from '@/hooks/use-layout'
import { cn } from '@/lib/utils'

type ExperimentTOCProps = {
  title: string
  description: string
  href: string
  tags?: string[]
}

export function ExperimentTOC({
  title,
  description,
  href,
  tags,
}: ExperimentTOCProps) {
  const { layout } = useLayout()

  return (
    <div
      className={cn(
        'sticky top-0 flex h-screen gap-1 [grid-area:toc] max-xl:hidden'
      )}
    >
      <div className="flex h-full w-(--fd-toc-width) flex-col gap-1">
        <div className="bg-muted flex flex-1 flex-col gap-4 px-6 py-4">
          <div className="flex items-center gap-1.5">
            <FlaskIcon
              className="text-muted-foreground size-4"
              aria-hidden="true"
            />
            <span className="text-muted-foreground font-mono text-xs font-medium tracking-wide uppercase">
              Experiment
            </span>
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <h3 className="text-sm font-semibold">{title}</h3>
            <p className="text-muted-foreground text-xs leading-relaxed">
              {description}
            </p>
          </div>
        </div>
        {tags && tags.length > 0 && (
          <div className="bg-muted flex flex-wrap gap-1 px-6 py-4">
            {tags.map((tag) => (
              <span
                key={tag}
                className="bg-accent text-muted-foreground px-2 py-0.5 font-mono text-xs tracking-wide uppercase"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-muted text-foreground hover:text-foreground/80 focus-visible:ring-ring inline-flex items-center gap-1.5 px-6 py-4 font-mono text-xs font-medium tracking-wide uppercase transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          Open externally
          <ArrowUpRight className="size-3" aria-hidden="true" />
        </a>
      </div>
      <div
        className={cn(
          'bg-muted/50 min-w-aside-width hidden 2xl:block',
          layout === 'full' ? '' : 'flex-1'
        )}
      />
    </div>
  )
}
