import Link from 'next/link'
import type { Metadata } from 'next'
import { getExperiments } from '@/lib/lab'
import { getRegistryCounts } from '@/lib/source'
import { RegistryMetaProvider } from '@/components/registry-meta'
import FlaskIcon from '@/components/icons/flask'
import { Badge } from '@/components/ui/badge'

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
      <article className="px-content-sides mx-auto w-full max-w-[900px] py-6 [grid-area:main] md:pt-8 xl:pt-14 xl:layout:[--fd-toc-width:268px]">
        <Badge variant="accent" className="mb-6">
          Lab
        </Badge>

        <h1 className="mb-4 text-3xl leading-tight font-semibold">Experiments</h1>
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
              <Link
                key={experiment.slug}
                href={`/lab/${experiment.slug}`}
                className="bg-muted hover:bg-accent group flex flex-col gap-2 p-5 transition-colors"
              >
                <span className="font-mono text-sm font-medium tracking-wide uppercase">
                  {experiment.title}
                </span>
                <span className="text-muted-foreground text-sm leading-relaxed">
                  {experiment.description}
                </span>
                {experiment.tags && experiment.tags.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {experiment.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-accent text-muted-foreground px-2 py-0.5 font-mono text-xs tracking-wide uppercase"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </article>
    </RegistryMetaProvider>
  )
}
