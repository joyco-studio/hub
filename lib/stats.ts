import type { DownloadStats } from '@/components/layout/weekly-downloads'

const JOYCO_WORKERS_HUB_TOKEN = process.env.JOYCO_WORKERS_HUB_TOKEN || ''
const BASE_URL = 'https://workers.joyco.studio'

export async function getComponentDownloadStats(
  slug: string
): Promise<DownloadStats | null> {
  if (!JOYCO_WORKERS_HUB_TOKEN) return null

  const headers = { Authorization: `Bearer ${JOYCO_WORKERS_HUB_TOKEN}` }
  const now = new Date()
  const to = new Date(now)
  const from = new Date(now)
  to.setDate(to.getDate() + 1)
  from.setDate(from.getDate() - 6)

  const countParams = new URLSearchParams({
    event: 'download',
    event_name: `registry:${slug}`,
  })

  const timeseriesParams = new URLSearchParams({
    event: 'download',
    event_name: `registry:${slug}`,
    interval: 'day',
    from: from.toISOString().split('T')[0],
    to: to.toISOString().split('T')[0],
  })

  try {
    const [countRes, timeseriesRes] = await Promise.all([
      fetch(`${BASE_URL}/analytics/count?${countParams}`, { headers }),
      fetch(`${BASE_URL}/analytics/timeseries?${timeseriesParams}`, {
        headers,
      }),
    ])

    if (!countRes.ok || !timeseriesRes.ok) return null

    const countJson = await countRes.json()
    const timeseriesJson = await timeseriesRes.json()

    if (!countJson.success || !timeseriesJson.success) return null

    return {
      total: countJson.data.count,
      weekly: timeseriesJson.data.map((t: { key: string; count: number }) => ({
        day: t.key,
        count: t.count,
      })),
    }
  } catch (error) {
    console.error(
      `[Stats] Failed to fetch download stats for ${slug}:`,
      error instanceof Error ? error.message : String(error)
    )
    return null
  }
}

export async function getPageViews(pagePath: string): Promise<number | null> {
  if (!JOYCO_WORKERS_HUB_TOKEN) return null

  const headers = { Authorization: `Bearer ${JOYCO_WORKERS_HUB_TOKEN}` }
  const params = new URLSearchParams({
    path: pagePath,
  })

  try {
    const res = await fetch(`${BASE_URL}/analytics/count?${params}`, {
      headers,
    })

    if (!res.ok) return null

    const json = await res.json()
    if (!json.success) return null

    return json.data.count
  } catch (error) {
    console.error(
      `[Stats] Failed to fetch page views for ${pagePath}:`,
      error instanceof Error ? error.message : String(error)
    )
    return null
  }
}
