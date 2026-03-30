import { getExperimentBySlug, getExperiments } from '@/lib/lab'
import { notFound } from 'next/navigation'
import { ImageResponse } from 'next/og'
import { LabOgImage, getFonts } from '@/components/og'

export const revalidate = 30

export async function GET(
  _req: Request,
  { params }: RouteContext<'/og/lab/[slug]'>
) {
  const { slug } = await params
  const experiment = await getExperimentBySlug(slug)

  if (!experiment) notFound()

  return new ImageResponse(
    LabOgImage({
      title: experiment.title,
      description: experiment.description,
      tags: experiment.tags,
      date: experiment.date,
    }),
    {
      width: 1200,
      height: 630,
      fonts: await getFonts(),
    }
  )
}

export async function generateStaticParams() {
  const { experiments } = await getExperiments()
  return experiments.map((e) => ({ slug: e.slug }))
}
