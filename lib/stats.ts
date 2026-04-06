import type { DownloadStats } from '@/components/layout/weekly-downloads'

const JOYCO_WORKER_SECRET = process.env.JOYCO_WORKER_SECRET || ''
const BASE_URL = 'https://workers.joyco.studio'

export async function getComponentDownloadStats(
  slug: string
): Promise<DownloadStats | null> {
  if (!JOYCO_WORKER_SECRET) return null

  const headers = { Authorization: `Bearer ${JOYCO_WORKER_SECRET}` }
  const now = new Date()
  const to = new Date(now)
  const from = new Date(now)
  to.setDate(to.getDate() + 1)
  from.setDate(from.getDate() - 6)

  const countParams = new URLSearchParams({
    event: 'download',
    event_name: slug,
  })

  const timeseriesParams = new URLSearchParams({
    event: 'download',
    event_name: slug,
    interval: 'day',
    from: from.toISOString().split('T')[0],
    to: to.toISOString().split('T')[0],
  })

  try {
    const [countRes, timeseriesRes] = await Promise.all([
      fetch(`${BASE_URL}/analytics/count?${countParams}`, { headers }),
      fetch(
        `${BASE_URL}/analytics/timeseries?${timeseriesParams}`,
        { headers }
      ),
    ])

    if (!countRes.ok || !timeseriesRes.ok) return null

    const countJson = await countRes.json()
    const timeseriesJson = await timeseriesRes.json()

    if (!countJson.success || !timeseriesJson.success) return null

    return {
      total: countJson.data.count,
      weekly: timeseriesJson.data.map(
        (t: { key: string; count: number }) => ({
          day: t.key,
          count: t.count,
        })
      ),
    }
  } catch {
    return null
  }
}

export async function getPageViews(
  pagePath: string
): Promise<number | null> {
  if (!JOYCO_WORKER_SECRET) return null

  const headers = { Authorization: `Bearer ${JOYCO_WORKER_SECRET}` }
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
  } catch {
    return null
  }
}