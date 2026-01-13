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

export function getTopLevelPathsRedirects(source: ReturnType<typeof loader>) {
  const topLevelPaths: [string, string][] = []
  source.pageTree.children.forEach((child) => {
    if (child.type === 'folder' && child.$id) {
      const segment = child.$id.split(':')[1]
      const firstEntry = child.children.find((child) => child.type === 'page')
      if (segment && firstEntry) {
        topLevelPaths.push([`/${segment}`, firstEntry.url])
      }
    }
  })
  return topLevelPaths
}
