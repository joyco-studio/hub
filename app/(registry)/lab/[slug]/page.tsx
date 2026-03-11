import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import {
  getExperiments,
  getExperimentBySlug,
  getRepoContributors,
} from '@/lib/lab'
import { getRegistryCounts } from '@/lib/source'
import { RegistryMetaProvider } from '@/components/registry-meta'
import { ExperimentIframe } from '@/components/lab/experiment-iframe'
import { ExperimentTOC } from '@/components/lab/experiment-toc'

export const revalidate = 30

type PageProps = {
  params: Promise<{ slug: string }>
}

export default async function ExperimentPage({ params }: PageProps) {
  const { slug } = await params
  const experiment = await getExperimentBySlug(slug)

  if (!experiment) notFound()

  const counts = getRegistryCounts()
  const authors = await getRepoContributors(experiment.repo)

  return (
    <RegistryMetaProvider counts={counts}>
      <div className="h-[calc(100dvh-var(--mobile-header-height))] w-full [grid-area:main] md:h-screen">
        <ExperimentIframe src={experiment.href} title={experiment.title} />
      </div>
      <ExperimentTOC
        title={experiment.title}
        description={experiment.description}
        href={experiment.href}
        tags={experiment.tags}
        repo={experiment.repo}
        authors={authors}
      />
    </RegistryMetaProvider>
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
    openGraph: {
      images: [`/og/lab/${slug}`],
    },
  }
}
