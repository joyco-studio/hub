import type { DownloadStats } from '@/components/layout/weekly-downloads'

export async function getDownloadStats(
  slug: string
): Promise<DownloadStats | null> {
  try {
    const response = await fetch(
      `https://workers.joyco.studio/registry/${slug}/downloads`
    )
    if (!response.ok) return null
    const json = await response.json()
    if (!json.success) return null
    return json.data
  } catch {
    return null
  }
}
