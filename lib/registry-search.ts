import { source } from '@/lib/source'
import { getExperiments } from '@/lib/lab'

export type RegistryResultType = 'component' | 'toolbox' | 'log' | 'experiment'

export type RegistrySearchResult = {
  name: string
  title: string
  description: string
  href: string
  type: RegistryResultType
}

const SECTION_TYPE: Record<string, RegistryResultType> = {
  components: 'component',
  toolbox: 'toolbox',
  logs: 'log',
}

const TYPE_SYNONYMS: Record<RegistryResultType, string> = {
  component: 'component',
  toolbox: 'toolbox tool tooling utility',
  log: 'log article blog post writeup',
  experiment: 'lab experiment demo',
}

const DEFAULT_LIMIT = 8

type IndexedItem = { result: RegistrySearchResult; haystack: string }

function docItems(): IndexedItem[] {
  return source
    .getPages()
    .filter((page) => page.slugs.length > 1 && SECTION_TYPE[page.slugs[0]])
    .map((page) => {
      const type = SECTION_TYPE[page.slugs[0]]
      const name = page.slugs[page.slugs.length - 1]
      const title = page.data.title ?? name
      const description = page.data.description ?? ''
      return {
        result: { name, title, description, href: page.url, type },
        haystack:
          `${name} ${title} ${description} ${TYPE_SYNONYMS[type]}`.toLowerCase(),
      }
    })
}

async function labItems(): Promise<IndexedItem[]> {
  const { experiments } = await getExperiments()
  return experiments.map((experiment) => ({
    result: {
      name: experiment.slug,
      title: experiment.title,
      description: experiment.description,
      href: `/lab/${experiment.slug}`,
      type: 'experiment' as const,
    },
    haystack:
      `${experiment.slug} ${experiment.title} ${experiment.description} ${(experiment.tags ?? []).join(' ')} ${TYPE_SYNONYMS.experiment}`.toLowerCase(),
  }))
}

export async function searchRegistry(
  query: string,
  limit: number = DEFAULT_LIMIT
): Promise<RegistrySearchResult[]> {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return []

  const items = [...docItems(), ...(await labItems())]
  const terms = normalized.split(/\s+/)

  return items
    .map((item) => ({
      item,
      score: terms.reduce(
        (acc, term) => acc + (item.haystack.includes(term) ? 1 : 0),
        0
      ),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.item.result)
}
