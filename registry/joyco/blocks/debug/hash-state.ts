function encodeState(state: object): string {
  return btoa(encodeURIComponent(JSON.stringify(state)))
}

export function parseHashState(): Record<string, unknown> | null {
  if (typeof window === 'undefined') return null
  const hash = window.location.hash
  if (!hash.startsWith('#tp=')) return null
  try {
    const encoded = hash.slice(4)
    return JSON.parse(decodeURIComponent(atob(encoded)))
  } catch {
    console.warn('[debug] Failed to parse tweakpane state from URL')
    return null
  }
}

export function writeHashState(state: object): void {
  const encoded = encodeState(state)
  const url = new URL(window.location.href)
  url.hash = `tp=${encoded}`
  window.history.replaceState(null, '', url.toString())
}
