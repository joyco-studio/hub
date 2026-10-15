function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

// experiments.json is edited by hand, so anything that isn't a valid https URL
// falls back to the Cloudflare screenshot instead of rendering a broken image
export function getExperimentThumbnailUrl(
  slug: string,
  thumbnail: string | undefined
): string {
  if (thumbnail && isHttpsUrl(thumbnail)) return thumbnail
  return `/api/screenshot?experiment=${encodeURIComponent(slug)}`
}
