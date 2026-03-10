import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getExperiments, getExperimentBySlug } from '@/lib/lab'
import { ExperimentIframe } from '@/components/lab/experiment-iframe'

type PageProps = {
  params: Promise<{ slug: string }>
}

export default async function ExperimentPage({ params }: PageProps) {
  const { slug } = await params
  const experiment = await getExperimentBySlug(slug)

  if (!experiment) notFound()

  return (
    <div className="h-[calc(100dvh-var(--mobile-header-height))] w-full [grid-area:main] md:h-screen">
      <ExperimentIframe src={experiment.href} title={experiment.title} />
    </div>
  )
}

export async function generateStaticParams() {
  const { experiments } = await getExperiments()
  return experiments.map((e) => ({ slug: e.slug }))
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const experiment = await getExperimentBySlug(slug)

  if (!experiment) return {}

  return {
    title: experiment.title,
    description: experiment.description,
  }
}
