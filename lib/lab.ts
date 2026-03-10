const EXPERIMENTS_URL =
  'https://raw.githubusercontent.com/joyco-studio/lab/main/experiments.json'

export type Experiment = {
  slug: string
  title: string
  description: string
  href: string
  date?: string
  tags?: string[]
}

type ExperimentsResponse = {
  experiments: Experiment[]
}

export async function getExperiments(): Promise<ExperimentsResponse> {
  const res = await fetch(EXPERIMENTS_URL, { next: { revalidate: 3600 } })

  if (!res.ok) return { experiments: [] }

  return res.json()
}

export async function getExperimentBySlug(
  slug: string
): Promise<Experiment | undefined> {
  const { experiments } = await getExperiments()
  return experiments.find((e) => e.slug === slug)
}
