import { getTableOfContents } from 'fumadocs-core/content/toc'
import type { TOCItemType } from 'fumadocs-core/toc'
import { getRepoReadme } from '@/lib/github'
import { stripFrontmatter } from '@/lib/mdx'

function cleanReadme(raw: string): string {
  return stripFrontmatter(raw).replace(/^#\s+.+\n*/m, '')
}

export async function getLibraryReadme(
  repo: string
): Promise<{ cleaned: string; toc: TOCItemType[] } | null> {
  const readme = await getRepoReadme(repo)
  if (!readme) return null

  const cleaned = cleanReadme(readme)
  const toc = await getTableOfContents(cleaned)

  return {
    cleaned,
    toc: toc.filter((item) => item.depth <= 3),
  }
}
