import { docs } from 'fumadocs-mdx:collections/server'
import { type InferPageType, loader } from 'fumadocs-core/source'
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons'
import { processMdxForLLMs } from './llm'

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  baseUrl: '/',
  source: docs.toFumadocsSource(),
  plugins: [lucideIconsPlugin()],
})

export function getPageImage(page: InferPageType<typeof source>) {
  const segments = [...page.slugs]

  return {
    segments,
    url: `/og/docs/${segments.join('/')}`,
  }
}

export async function getLLMText(page: InferPageType<typeof source>) {
  const raw = await page.data.getText('raw')
  const processed = processMdxForLLMs(raw)

  return `# ${page.data.title}

${processed}`
}

export type RelatedItem = {
  name: string
  title: string
  type: 'component' | 'toolbox' | 'log'
  href: string
}

export function getRelatedPages(
  currentPage: InferPageType<typeof source>,
  limit = 3
): RelatedItem[] {
  const category = currentPage.slugs[0]
  if (!category) return []

  const typeMap: Record<string, 'component' | 'toolbox' | 'log'> = {
    components: 'component',
    toolbox: 'toolbox',
    logs: 'log',
  }

  const itemType = typeMap[category]
  if (!itemType) return []

  const allPages = source.getPages()
  const sameCategoryPages = allPages.filter(
    (page) => page.slugs[0] === category && page.slugs.length > 1
  )

  const currentPageIndex = sameCategoryPages.findIndex(
    (page) => page.url === currentPage.url
  )

  // If page not found, return first `limit` pages
  if (currentPageIndex === -1) {
    return sameCategoryPages.slice(0, limit).map((page) => ({
      name: page.slugs[page.slugs.length - 1],
      title: page.data.title,
      type: itemType,
      href: page.url,
    }))
  }

  const before = sameCategoryPages.slice(
    Math.max(0, currentPageIndex - 1),
    currentPageIndex
  )
  const after = sameCategoryPages.slice(
    currentPageIndex + 1,
    currentPageIndex + 1 + limit - before.length
  )
  const selected = [...before, ...after]

  // If we don't have enough items, wrap around to the beginning
  if (selected.length < limit) {
    const remaining = limit - selected.length
    const selectedUrls = new Set([
      ...selected.map((p) => p.url),
      currentPage.url,
    ])
    const fromStart = sameCategoryPages
      .filter((page) => !selectedUrls.has(page.url))
      .slice(0, remaining)
    selected.push(...fromStart)
  }

  return selected.map((page) => ({
    name: page.slugs[page.slugs.length - 1],
    title: page.data.title,
    type: itemType,
    href: page.url,
  }))
}
