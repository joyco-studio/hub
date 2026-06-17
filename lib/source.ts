import { readFile } from 'fs/promises'
import path from 'path'
import { docs } from 'fumadocs-mdx:collections/server'
import { type InferPageType, loader } from 'fumadocs-core/source'
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons'
import { getLibraryReadme } from './libraries'
import { processMdxForLLMs } from './llm'
import { getLogNumber, stripLogPrefixFromTitle } from './log-utils'

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  baseUrl: '/',
  source: docs.toFumadocsSource(),
  plugins: [lucideIconsPlugin()],
})

// Order each section's pages by creation date, newest first. The `created` date
// is baked into page data at build time by the `created` plugin (see
// `source.config.ts`). The `logs` section keeps its own filename-based order.
sortPageTreeByCreated()

function sortPageTreeByCreated() {
  const createdByUrl = new Map<string, number>()
  for (const page of source.getPages()) {
    const created = (page.data as { created?: Date | string }).created
    if (created) createdByUrl.set(page.url, new Date(created).getTime())
  }

  const createdRank = (node: PageTreeNode) =>
    node.type === 'page' && node.url
      ? (createdByUrl.get(node.url) ?? -Infinity)
      : -Infinity

  const sortChildren = (node: PageTreeNode) => {
    if (!node.children) return
    // Logs keep their numeric-filename order (reversed in the sidebar).
    if (node.type === 'folder' && node.$id?.split(':')[1] === 'logs') return

    node.children.sort((a, b) => createdRank(b) - createdRank(a))
    node.children.forEach(sortChildren)
  }

  source.pageTree.children.forEach((child) =>
    sortChildren(child as PageTreeNode)
  )
}

export function getPageImage(page: InferPageType<typeof source>) {
  const segments = [...page.slugs]

  return {
    segments,
    url: `/og/docs/${segments.join('/')}`,
  }
}

/**
 * Resolve a category's pages in the same order the `CategoryIndex` component
 * renders them, so the LLM/raw markdown matches what a browser sees.
 */
function getCategoryPages(category: string) {
  const pages = source
    .getPages()
    .filter((page) => page.slugs[0] === category && page.slugs.length > 1)

  // Match the page-tree (meta.json / creation-date) order used in the sidebar.
  const folder = getTopLevelFolder(category)
  const order = (folder?.children ?? [])
    .filter((child) => child.type === 'page' && child.url)
    .map((child) => child.url!)

  if (order.length > 0) {
    const orderMap = new Map(order.map((url, i) => [url, i]))
    pages.sort(
      (a, b) =>
        (orderMap.get(a.url) ?? Infinity) - (orderMap.get(b.url) ?? Infinity)
    )
  }

  if (category === 'logs') pages.reverse()

  return pages
}

/**
 * Render a `<CategoryIndex category="..." />` MDX tag as a plain markdown list,
 * one line per entry, so non-browser consumers (LLMs, curl, scripts) can scan
 * titles and links without executing the React component.
 */
function renderCategoryIndexAsMarkdown(category: string): string {
  const pages = getCategoryPages(category)

  return pages
    .map((page) => {
      const logNumber = getLogNumber(page.slugs)
      const title = logNumber
        ? stripLogPrefixFromTitle(page.data.title, logNumber)
        : page.data.title
      const description = page.data.description
        ? ` — ${page.data.description}`
        : ''
      return `- [${title}](${page.url})${description}`
    })
    .join('\n')
}

const categoryIndexRegex =
  /<CategoryIndex[\s\S]*?category="([^"]+)"[\s\S]*?(?:\/>|<\/CategoryIndex>)/g

export async function getLLMText(page: InferPageType<typeof source>) {
  const llmCompanion = path.join(
    process.cwd(),
    'llm-overrides',
    `${page.slugs.join('--')}.md`
  )
  try {
    return await readFile(llmCompanion, 'utf-8')
  } catch {
    // No override file — fall through to auto-generated text
  }

  const raw = await page.data.getText('raw')
  let processed = processMdxForLLMs(raw)

  // Expand `<CategoryIndex category="..." />` into a real markdown list so the
  // raw/.md representation lists every entry instead of an opaque JSX tag.
  processed = processed.replace(categoryIndexRegex, (_match, category) =>
    renderCategoryIndexAsMarkdown(category)
  )

  let libraryBody = ''
  if (page.data.type === 'library' && page.data.repo) {
    const readme = await getLibraryReadme(page.data.repo)
    if (readme) libraryBody = `\n${readme.cleaned}`
  }

  return `# ${page.data.title}

${processed}${libraryBody}`
}

export type RelatedItem = {
  name: string
  title: string
  type: 'component' | 'toolbox' | 'log'
  href: string
  logNumber?: string | null
}

type PageTreeNode = {
  type?: string
  $id?: string
  url?: string
  children?: PageTreeNode[]
}

const countPages = (node: PageTreeNode | undefined): number => {
  if (!node) return 0
  if (node.type === 'page') return 1
  return (node.children ?? []).reduce(
    (sum, child) => sum + countPages(child),
    0
  )
}

const getTopLevelFolder = (segment: string) => {
  const children = source.pageTree.children as unknown as PageTreeNode[]
  return children.find(
    (child) => child.type === 'folder' && child.$id?.split(':')[1] === segment
  )
}

export function getRegistryCounts() {
  return {
    components: countPages(getTopLevelFolder('components')),
    toolbox: countPages(getTopLevelFolder('toolbox')),
    logs: countPages(getTopLevelFolder('logs')),
  }
}

/**
 * Get all game slugs based on frontmatter type: 'game'
 */
export function getGameSlugs(): string[] {
  const allPages = source.getPages()
  return allPages
    .filter((page) => page.data.type === 'game')
    .map((page) => page.slugs[page.slugs.length - 1])
}

/**
 * Get all effect slugs based on frontmatter type: 'effect'
 */
export function getEffectSlugs(): string[] {
  const allPages = source.getPages()
  return allPages
    .filter((page) => page.data.type === 'effect')
    .map((page) => page.slugs[page.slugs.length - 1])
}

/**
 * Get all canvas slugs based on frontmatter type: 'canvas'
 */
export function getCanvasSlugs(): string[] {
  const allPages = source.getPages()
  return allPages
    .filter((page) => page.data.type === 'canvas')
    .map((page) => page.slugs[page.slugs.length - 1])
}

/**
 * Get all library slugs based on frontmatter type: 'library'
 */
export function getLibrarySlugs(): string[] {
  const allPages = source.getPages()
  return allPages
    .filter((page) => page.data.type === 'library')
    .map((page) => page.slugs[page.slugs.length - 1])
}

/**
 * Get all lib slugs based on frontmatter type: 'lib'
 */
export function getLibSlugs(): string[] {
  const allPages = source.getPages()
  return allPages
    .filter((page) => page.data.type === 'lib')
    .map((page) => page.slugs[page.slugs.length - 1])
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

  // Helper to convert page to RelatedItem
  const pageToRelatedItem = (
    page: InferPageType<typeof source>
  ): RelatedItem => {
    const logNumber = itemType === 'log' ? getLogNumber(page.slugs) : null
    const displayTitle =
      itemType === 'log' && logNumber
        ? stripLogPrefixFromTitle(page.data.title, logNumber)
        : page.data.title

    return {
      name: page.slugs[page.slugs.length - 1],
      title: displayTitle,
      type: itemType,
      href: page.url,
      logNumber,
    }
  }

  const allPages = source.getPages()
  const sameCategoryPages = allPages.filter(
    (page) => page.slugs[0] === category && page.slugs.length > 1
  )

  const currentPageIndex = sameCategoryPages.findIndex(
    (page) => page.url === currentPage.url
  )

  // If page not found, return first `limit` pages
  if (currentPageIndex === -1) {
    return sameCategoryPages.slice(0, limit).map(pageToRelatedItem)
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

  return selected.map(pageToRelatedItem)
}
