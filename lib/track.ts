import type { NextRequest } from 'next/server'
import { APP_BASE_URL } from './constants';

const JOYCO_WORKER_SECRET = process.env.JOYCO_WORKER_SECRET || ''
const DEDUP_TTL = 10_000 // 10 seconds
const memoryDownloads = new Map<string, number>()

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  )
}

async function trackDownload(path: string, countryCode: string | null) {
  if (!JOYCO_WORKER_SECRET) {
    console.error(`[Registry Download] No worker secret found`)
    return
  }

  const component = path.replace(/^\/r\//, '').replace(/\.json$/, '')

  try {
    const response = await fetch('https://workers.joyco.studio/ingest/event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${JOYCO_WORKER_SECRET}`,
      },
      body: JSON.stringify({
        event_type: 'download',
        event_name: `registry:${component}`,
        origin: APP_BASE_URL,
        path,
        country: countryCode,
      }),
    })

    if (response.ok) {
      console.info(
        `[Registry Download] Tracked download for ${component}`,
        await response.text()
      )
    } else {
      console.error(
        `[Registry Download] Failed to track for ${component}:`,
        await response.text()
      )
    }

    return response.ok
  } catch (error: unknown) {
    console.error(
      `[Registry Download] Failed to track for ${component}:`,
      error instanceof Error ? error.message : String(error)
    )
    return
  }
}

export async function trackRegistryDownload(
  request: NextRequest
) {
  const ip = getClientIp(request)
  const key = `${ip}:${request.nextUrl.pathname}`
  const now = Date.now()
  const lastSeen = memoryDownloads.get(key)

  if (lastSeen && now - lastSeen <= DEDUP_TTL) return

  const countryCode = request.headers.get('x-vercel-ip-country') ?? null

  memoryDownloads.set(key, now)
  await trackDownload(request.nextUrl.pathname, countryCode)

  // Prune stale entries periodically
  if (memoryDownloads.size > 1000) {
    for (const [k, t] of memoryDownloads) {
      if (now - t > DEDUP_TTL) memoryDownloads.delete(k)
    }
  }
}
