import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

export interface ExternalComponent {
  slug: string
  title: string
  description: string
  registry: string
  externalUrl: string
  /**
   * Full URL to the component's registry JSON file.
   * This enables installation via your registry domain:
   * `npx shadcn@latest add https://registry.joyco.studio/r/{slug}.json`
   * which redirects to this URL.
   */
  externalRegistryUrl: string
}

interface Frontmatter {
  title: string
  description?: string
  externalRegistry?: {
    name: string
    url: string
    registryUrl: string
  }
}

/**
 * Get all external component redirects for Next.js config
 * Reads MDX frontmatter directly (works at config time)
 */
export function getExternalComponentRedirects() {
  const contentDir = path.join(process.cwd(), 'content', 'components')

  if (!fs.existsSync(contentDir)) {
    return []
  }

  const files = fs.readdirSync(contentDir).filter((f) => f.endsWith('.mdx'))
  const redirects: { source: string; destination: string; permanent: boolean }[] = []

  for (const file of files) {
    const content = fs.readFileSync(path.join(contentDir, file), 'utf-8')
    const { data } = matter(content)
    const frontmatter = data as Frontmatter

    if (frontmatter.externalRegistry?.registryUrl) {
      const slug = file.replace('.mdx', '')
      redirects.push({
        source: `/r/${slug}.json`,
        destination: frontmatter.externalRegistry.registryUrl,
        permanent: false,
      })
    }
  }

  return redirects
}

/**
 * Get external component by slug
 */
export function getExternalComponentBySlug(
  slug: string
): ExternalComponent | undefined {
  const filePath = path.join(process.cwd(), 'content', 'components', `${slug}.mdx`)

  if (!fs.existsSync(filePath)) {
    return undefined
  }

  const content = fs.readFileSync(filePath, 'utf-8')
  const { data } = matter(content)
  const frontmatter = data as Frontmatter

  if (!frontmatter.externalRegistry) {
    return undefined
  }

  return {
    slug,
    title: frontmatter.title,
    description: frontmatter.description ?? '',
    externalUrl: frontmatter.externalRegistry.url,
    externalRegistryUrl: frontmatter.externalRegistry.registryUrl,
    registry: frontmatter.externalRegistry.name,
  }
}
