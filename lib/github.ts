import { normalize } from './urls'

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

