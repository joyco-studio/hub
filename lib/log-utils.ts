const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export const getLogNumber = (slugs: string[]) => {
  if (slugs[0] !== 'logs') return null
  const last = slugs[slugs.length - 1] ?? ''
  const match = last.match(/^(\d+)(?:[-_]|$)/)
  return match?.[1] ?? null
}

export const stripLogPrefixFromTitle = (title: string, logNumber: string | null) => {
  if (!logNumber) return title
  const pattern = new RegExp(`^${escapeRegExp(logNumber)}\\s*[-–—]\\s+`, 'u')
  return title.replace(pattern, '')
}
