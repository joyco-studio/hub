const EXPERIMENTS_URL =
  'https://raw.githubusercontent.com/joyco-studio/lab/main/experiments.json'

export type Experiment = {
  slug: string
  title: string
  description: string
  href: string
  date?: string
  tags?: string[]
  repo?: string
}

export type RepoContributor = {
  login: string
  avatar_url: string
  html_url: string
}

const GITHUB_HOST_RE = /^github\.com$/i
const GITLAB_HOST_RE = /^gitlab\.com$/i

function parseRepoOwnerAndName(
  repoUrl: string
): { host: 'github' | 'gitlab'; owner: string; repo: string } | null {
  try {
    const url = new URL(repoUrl)

    let host: 'github' | 'gitlab' | null = null
    if (GITHUB_HOST_RE.test(url.hostname)) host = 'github'
    else if (GITLAB_HOST_RE.test(url.hostname)) host = 'gitlab'

    if (!host) return null

    const segments = url.pathname.split('/').filter(Boolean)
    if (segments.length < 2) return null

    return { host, owner: segments[0], repo: segments[1] }
  } catch {
    return null
  }
}

function githubHeaders() {
  return {
    Accept: 'application/vnd.github.v3+json',
    ...(process.env.GITHUB_TOKEN && {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    }),
  }
}

export async function isRepoPublic(
  repoUrl: string | undefined
): Promise<boolean> {
  if (!repoUrl) return false

  const parsed = parseRepoOwnerAndName(repoUrl)
  if (!parsed || parsed.host !== 'github') return false

  try {
    const res = await fetch(
      `https://api.github.com/repos/${parsed.owner}/${parsed.repo}`,
      {
        headers: githubHeaders(),
        next: { revalidate: 3600 },
      }
    )
    if (!res.ok) return false

    const data: { private: boolean } = await res.json()
    return !data.private
  } catch {
    return false
  }
}

export async function getRepoContributors(
  repoUrl: string | undefined
): Promise<RepoContributor[]> {
  if (!repoUrl) return []

  const parsed = parseRepoOwnerAndName(repoUrl)
  if (!parsed) return []

  if (parsed.host === 'github') {
    try {
      const res = await fetch(
        `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/contributors?per_page=10`,
        {
          headers: githubHeaders(),
          next: { revalidate: 3600 },
        }
      )
      if (!res.ok) return []

      const data: Array<{
        login: string
        avatar_url: string
        html_url: string
        type: string
      }> = await res.json()

      return data
        .filter((c) => c.type === 'User')
        .map(({ login, avatar_url, html_url }) => ({
          login,
          avatar_url,
          html_url,
        }))
    } catch {
      return []
    }
  }

  return []
}

type ExperimentsResponse = {
  experiments: Experiment[]
}

export async function getExperiments(): Promise<ExperimentsResponse> {
  const res = await fetch(EXPERIMENTS_URL, { next: { revalidate: 30 } })

  if (!res.ok) return { experiments: [] }

  const data: ExperimentsResponse = await res.json()

  data.experiments.sort((a, b) => {
    if (!a.date) return 1
    if (!b.date) return -1
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  return data
}

export async function getExperimentBySlug(
  slug: string
): Promise<Experiment | undefined> {
  const { experiments } = await getExperiments()
  return experiments.find((e) => e.slug === slug)
}
