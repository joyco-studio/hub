import { docs } from 'fumadocs-mdx:collections/server'
import { type InferPageType, loader } from 'fumadocs-core/source'
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons'

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  baseUrl: '/',
  source: docs.toFumadocsSource(),
  plugins: [lucideIconsPlugin()],
})

export function getPageImage(page: InferPageType<typeof source>) {
  const segments = [...page.slugs, 'image.png']

  return {
    segments,
    url: `/og/${segments.join('/')}`,
  }
}

export async function getLLMText(page: InferPageType<typeof source>) {
  const processed = await page.data.getText('processed')

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