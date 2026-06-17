import { source } from '@/lib/source'

export type RegistryComponentResult = {
  name: string
  title: string
  description: string
  href: string
}

const DEFAULT_LIMIT = 12

// Component docs live under the `components` section. Their fumadocs `page.url`
// is the canonical href; the last slug segment is the component name.
function componentPages() {
  return source
    .getPages()
    .filter((page) => page.slugs[0] === 'components' && page.slugs.length > 1)
}

type ComponentPage = ReturnType<typeof componentPages>[number]

function toResult(page: ComponentPage): RegistryComponentResult {
  const name = page.slugs[page.slugs.length - 1]
  return {
    name,
    title: page.data.title ?? name,
    description: page.data.description ?? '',
    href: page.url,
  }
}

export function searchRegistryComponents(
  query: string,
  limit: number = DEFAULT_LIMIT
): RegistryComponentResult[] {
  const pages = componentPages()
  const normalized = query.trim().toLowerCase()

  // Generic / empty queries ("list the components") return the full set.
  if (!normalized) return pages.slice(0, limit).map(toResult)

  const terms = normalized.split(/\s+/)
  const scored = pages
    .map((page) => {
      const name = page.slugs[page.slugs.length - 1]
      const haystack =
        `${name} ${page.data.title ?? ''} ${page.data.description ?? ''}`.toLowerCase()
      const score = terms.reduce(
        (acc, term) => acc + (haystack.includes(term) ? 1 : 0),
        0
      )
      return { page, score }
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)

  // Fall back to the full set so the UI always has cards to render.
  const top = scored.length
    ? scored.slice(0, limit).map((entry) => entry.page)
    : pages.slice(0, limit)

  return top.map(toResult)
}
