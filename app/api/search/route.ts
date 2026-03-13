import { source } from '@/lib/source'
import { createFromSource } from 'fumadocs-core/search/server'
import { getExperiments, type Experiment } from '@/lib/lab'

const fumadocsSearch = createFromSource(source, {
  language: 'english',
})

function matchesQuery(experiment: Experiment, q: string): boolean {
  if (experiment.title.toLowerCase().includes(q)) return true
  if (experiment.description?.toLowerCase().includes(q)) return true
  if (experiment.tags?.some((tag) => tag.toLowerCase().includes(q))) return true

  return false
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const query = url.searchParams.get('query')

  const docsResponse = await fumadocsSearch.GET(request)
  const docsResults = await docsResponse.json()

  if (!query || query.length < 2) return Response.json(docsResults)

  const { experiments } = await getExperiments()
  const q = query.toLowerCase()
  const experimentResults = experiments
    .filter((e) => matchesQuery(e, q))
    .flatMap((e) => {
      const entries = [
        {
          id: `lab-${e.slug}`,
          url: `/lab/${e.slug}`,
          type: 'page' as const,
          content: e.title,
        },
      ]

      if (e.description) {
        entries.push({
          id: `lab-${e.slug}-desc`,
          url: `/lab/${e.slug}`,
          type: 'text' as const,
          content: e.description,
        })
      }

      const matchedTags = e.tags?.filter((tag) =>
        tag.toLowerCase().includes(q)
      )
      if (matchedTags?.length) {
        entries.push({
          id: `lab-${e.slug}-tags`,
          url: `/lab/${e.slug}`,
          type: 'text' as const,
          content: matchedTags.join(', '),
        })
      }

      return entries
    })

  return Response.json([...docsResults, ...experimentResults])
}
