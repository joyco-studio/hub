import 'server-only'

/** Resolve repository and file URLs; profile and organization URLs are not repositories. */
export function getGitHubRepository(href: string): string | null {
  try {
    const url = new URL(href)
    if (url.hostname.toLowerCase() !== 'github.com') return null
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
    const [owner, name] = url.pathname.split('/').filter(Boolean)
    if (!owner || !name) return null
    const repo = name.replace(/\.git$/i, '')
    if (!repo) return null
    return `${owner}/${repo}`.toLowerCase()
  } catch {
    return null
  }
}

export async function isRepoPublic(
  repoUrl: string | undefined
): Promise<boolean> {
  if (!repoUrl) return false
  const repo = getGitHubRepository(repoUrl)
  if (!repo) return false

  try {
    const res = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        ...(process.env.GITHUB_TOKEN && {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        }),
      },
      next: { revalidate: 3600 },
    })
    if (!res.ok) return false
    const data: unknown = await res.json()
    return (
      typeof data === 'object' &&
      data !== null &&
      'private' in data &&
      data.private === false
    )
  } catch {
    return false
  }
}

export async function filterPublicRepoLinks<T extends { href: string }>(
  links: T[]
): Promise<T[]> {
  const checks = new Map<string, Promise<boolean>>()
  const visible = await Promise.all(
    links.map((link) => {
      const repo = getGitHubRepository(link.href)
      if (!repo) return true
      let check = checks.get(repo)
      if (!check) {
        check = isRepoPublic(`https://github.com/${repo}`)
        checks.set(repo, check)
      }
      return check
    })
  )
  return links.filter((_, index) => visible[index])
}
