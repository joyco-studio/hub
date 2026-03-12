import type { Metadata } from 'next'
import { getExperiments } from '@/lib/lab'
import { getRegistryCounts } from '@/lib/source'
import { RegistryMetaProvider } from '@/components/registry-meta'
import FlaskIcon from '@/components/icons/flask'
import { Badge } from '@/components/ui/badge'
import { ExperimentCard } from '@/components/cards/experiment-card'

export const revalidate = 30

export const metadata: Metadata = {
  title: 'Lab',
  description:
    'Experimental projects and creative explorations from JOYCO Studio.',
}

export default async function LabPage() {
  const { experiments } = await getExperiments()
  const counts = getRegistryCounts()

  return (
    <RegistryMetaProvider counts={counts}>
      <article className="px-content-sides xl:layout:[--fd-toc-width:268px] mx-auto w-full max-w-[900px] py-6 [grid-area:main] md:pt-8 xl:pt-14">
        <Badge variant="accent" className="mb-6">
          Lab
        </Badge>

        <h1 className="mb-4 text-3xl leading-tight font-semibold">
          Experiments
        </h1>
        <p className="text-foreground/70 mb-10 text-lg">
          Creative explorations and experimental projects from the studio.
        </p>

        {experiments.length === 0 ? (
          <div className="text-muted-foreground flex flex-col items-center gap-3 py-20">
            <FlaskIcon className="size-8" />
            <p className="font-mono text-sm tracking-wide uppercase">
              No experiments yet
            </p>
          </div>
        ) : (
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
        )}
      </article>
    </RegistryMetaProvider>
  )
}
