import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { NextRequest } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const files = {
  baseline: 'artwork-full.jpg',
  preview: 'artwork-preview.jpg',
  progressive: 'artwork-progressive-960.jpg',
  interlaced: 'artwork-interlaced.png',
} as const

const speeds = new Set([12, 24, 48, 96])
const chunkSize = 4096

export async function GET(request: NextRequest) {
  const asset = request.nextUrl.searchParams.get('asset')
  const speed = Number(request.nextUrl.searchParams.get('speed'))
  if (!asset || !Object.hasOwn(files, asset) || !speeds.has(speed)) {
    return new Response('Invalid image request', { status: 400 })
  }

  const file = files[asset as keyof typeof files]
  const bytes = await readFile(
    path.join(process.cwd(), 'public/images/logs/image-delivery', file)
  )
  let offset = 0
  let cancelled = false

  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      if (offset >= bytes.length) {
        controller.close()
        return
      }
      await new Promise((resolve) =>
        setTimeout(resolve, (chunkSize / (speed * 1024)) * 1000)
      )
      if (cancelled) return
      const end = Math.min(offset + chunkSize, bytes.length)
      controller.enqueue(bytes.subarray(offset, end))
      offset = end
    },
    cancel() {
      cancelled = true
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': asset === 'interlaced' ? 'image/png' : 'image/jpeg',
      'Content-Length': String(bytes.length),
      'Cache-Control': 'private, no-store, no-transform',
      'X-Accel-Buffering': 'no',
    },
  })
}
