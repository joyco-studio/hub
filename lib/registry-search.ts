import { source } from '@/lib/source'

export type RegistryComponentResult = {
  name: string
  title: string
  description: string
  href: string
}

const DEFAULT_LIMIT = 6

// Component docs live under the `components` section. Their fumadocs `page.url`
// is the canonical href; the last slug segment is the component name.
function componentPages() {
  return source
    .getPages()
    .filter((page) => page.slugs[0] === 'components' && page.slugs.length > 1)
}

export function searchRegistryComponents(
  query: string,
  limit: number = DEFAULT_LIMIT
): RegistryComponentResult[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return []

  const terms = normalized.split(/\s+/)

  return componentPages()
    .map((page) => {
      const name = page.slugs[page.slugs.length - 1]
      const title = page.data.title ?? name
      const description = page.data.description ?? ''
      const haystack = `${name} ${title} ${description}`.toLowerCase()
      const score = terms.reduce(
        (acc, term) => acc + (haystack.includes(term) ? 1 : 0),
        0
      )
      return { name, title, description, href: page.url, score }
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ name, title, description, href }) => ({
      name,
      title,
      description,
      href,
    }))
}
