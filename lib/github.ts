import { normalize } from './urls'

function githubAuthHeader(): Record<string, string> {
  const token = process.env.GITHUB_TOKEN
  if (!token) return {}
  // Classic PATs (ghp_) use "token" scheme, fine-grained PATs (github_pat_) use "Bearer"
  const scheme = token.startsWith('github_pat_') ? 'Bearer' : 'token'
  return { Authorization: `${scheme} ${token}` }
}

export async function getRepoReadme(
  repo: string
): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${repo}/contents/README.md`,
      {
        headers: {
          Accept: 'application/vnd.github.raw+json',
          ...githubAuthHeader(),
        },
        next: { revalidate: 3600 },
      }
    )
    if (!res.ok) return null
    return res.text()
  } catch {
    return null
  }
}

const DEFAULT_REPO_URL = 'https://github.com/joyco-studio/registry'

function encodePath(path: string) {
  return path
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/')
}

export function getGitHubRepoUrl() {
  return normalize(process.env.NEXT_PUBLIC_GITHUB_REPO_URL || DEFAULT_REPO_URL)
}

export function getGitHubRef() {
  // Prefer Vercel’s branch in preview deployments, fall back to main.
  return process.env.VERCEL_GIT_COMMIT_REF || 'main'
}

export function getGitHubBlobUrl(pathInRepo: string) {
  const repoUrl = getGitHubRepoUrl()
  const ref = encodeURIComponent(getGitHubRef())
  const path = encodePath(pathInRepo)
  return `${repoUrl}/blob/${ref}/${path}`
}

