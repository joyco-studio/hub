import type { DownloadStats } from '@/components/layout/weekly-downloads'

const JOYCO_WORKER_SECRET = process.env.JOYCO_WORKER_SECRET || ''
const BASE_URL = 'https://workers.joyco.studio'

export async function getDownloadStats(
  slug: string
): Promise<DownloadStats | null> {
  if (!JOYCO_WORKER_SECRET) return null

  const headers = { Authorization: `Bearer ${JOYCO_WORKER_SECRET}` }
  const now = new Date()
  const from = new Date(now)
  from.setDate(from.getDate() - 6)

  const params = new URLSearchParams({
    event_type: 'download',
    event_name: slug,
  })

  try {
    const [countRes, timeseriesRes] = await Promise.all([
      fetch(`${BASE_URL}/analytics/events/count?${params}`, { headers }),
      fetch(
        `${BASE_URL}/analytics/events/timeseries?${params}&interval=day&from=${from.toISOString().split('T')[0]}&to=${now.toISOString().split('T')[0]}`,
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
        (t: { bucket: string; count: number }) => ({
          day: t.bucket,
          count: t.count,
        })
      ),
    }
  } catch {
    return null
  }
}
