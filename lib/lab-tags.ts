export const LAB_TAG_PARAM = 'tag'

export function normalizeLabTag(tag: string) {
  return tag.trim().toLowerCase().replace(/\s+/g, '-')
}

// Accepts both `?tag=a&tag=b` and `?tag=a,b` so external links can use either form.
export function parseLabTagParam(value: string | string[] | undefined | null) {
  const rawValues = Array.isArray(value) ? value : value ? [value] : []
  const tags = rawValues
    .flatMap((rawValue) => rawValue.split(','))
    .map(normalizeLabTag)
    .filter(Boolean)
  return Array.from(new Set(tags))
}

export function filterExperimentsByTags<T extends { tags?: string[] }>(
  experiments: T[],
  activeTags: string[]
) {
  if (activeTags.length === 0) return experiments
  return experiments.filter((experiment) =>
    experiment.tags?.some((tag) => activeTags.includes(normalizeLabTag(tag)))
  )
}

export function buildLabTagSearch(
  currentSearch: URLSearchParams,
  nextTags: string[]
) {
  const nextSearch = new URLSearchParams(currentSearch)
  nextSearch.delete(LAB_TAG_PARAM)
  for (const tag of nextTags) nextSearch.append(LAB_TAG_PARAM, tag)
  const serialized = nextSearch.toString()
  return serialized ? `?${serialized}` : ''
}
