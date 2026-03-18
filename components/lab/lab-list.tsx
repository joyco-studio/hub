'use client'

import { ExperimentCard } from '@/components/cards/experiment-card'
import { Badge } from '@/components/ui/badge'
import FlaskIcon from '@/components/icons/flask'
import { LabViewToggle } from './lab-view-toggle'

interface LabListProps {
  experiments: Array<{
    slug: string
    title: string
    description?: string
    tags?: string[]
  }>
  onViewChange: () => void
}

export function LabList({ experiments, onViewChange }: LabListProps) {
  if (experiments.length === 0) {
    return (
      <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-3 [grid-area:main]">
        <FlaskIcon className="size-8" />
        <p className="font-mono text-sm tracking-wide uppercase">
          No experiments yet
        </p>
      </div>
    )
  }

  return (
    <article className="px-content-sides mx-auto w-full max-w-[900px] py-6 [grid-area:main] md:pt-8 xl:pt-14">
      <Badge variant="accent" className="mb-6">
        Lab
      </Badge>

      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl leading-tight font-semibold">Experiments</h1>
        <LabViewToggle view="list" onToggle={onViewChange} />
      </div>

      <p className="text-foreground/70 mb-10 text-lg">
        Creative explorations and experimental projects from the studio.
      </p>

      <div className="grid gap-2 sm:grid-cols-2">
        {experiments.map((experiment) => (
          <ExperimentCard
            key={experiment.slug}
            slug={experiment.slug}
            title={experiment.title}
            description={experiment.description}
            tags={experiment.tags}
          />
        ))}
      </div>
    </article>
  )
}
