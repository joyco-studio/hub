import { APP_BASE_URL } from '@/lib/constants'
import { NextRequest, NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN

const SCREENSHOT_WIDTH = 1200
const SCREENSHOT_HEIGHT = 600

const MAX_RETRIES = 5
const INITIAL_BACKOFF_MS = 2000

// Request queue to serialize Cloudflare API calls
const requestQueue: Array<{
  resolve: (value: string) => void
  reject: (error: Error) => void
  targetUrl: string
  width: number
  height: number
}> = []
let isProcessing = false

// In-flight request deduplication
const inFlightRequests = new Map<string, Promise<string>>()

function getRequestKey(targetUrl: string, width: number, height: number) {
  return `${targetUrl}:${width}x${height}`
}

async function processQueue() {
  if (isProcessing || requestQueue.length === 0) return
  isProcessing = true

  while (requestQueue.length > 0) {
    const request = requestQueue.shift()!
    try {
      const result = await fetchScreenshotFromCloudflare(
        request.targetUrl,
        request.width,
        request.height
      )
      request.resolve(result)
    } catch (error) {
      request.reject(error as Error)
    }
    // Small delay between requests to avoid rate limits
    if (requestQueue.length > 0) {
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  }

  isProcessing = false
}

function queueScreenshotRequest(
  targetUrl: string,
  width: number,
  height: number
): Promise<string> {
  const key = getRequestKey(targetUrl, width, height)

  // Return existing in-flight request if one exists
  const existing = inFlightRequests.get(key)
  if (existing) {
    console.log(`Reusing in-flight request for ${key}`)
    return existing
  }

  const promise = new Promise<string>((resolve, reject) => {
    requestQueue.push({ resolve, reject, targetUrl, width, height })
    processQueue()
  }).finally(() => {
    inFlightRequests.delete(key)
  })

  inFlightRequests.set(key, promise)
  return promise
}

async function fetchScreenshotFromCloudflare(
  targetUrl: string,
  width: number,
  height: number
): Promise<string> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/browser-rendering/screenshot`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: targetUrl,
            viewport: { width, height },
            gotoOptions: {
              waitUntil: 'networkidle0',
              timeout: 30000,
            },
            addStyleTag: [
              {
                content: `
                  html, body {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                  }
                  body > * {
                    flex-shrink: 0;
                  }
                  /* Hide scrollbars */
                  ::-webkit-scrollbar {
                    display: none;
                  }
                  * {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                  }
                `,
              },
            ],
          }),
        }
      )

      if (response.status === 429) {
        const backoffMs = INITIAL_BACKOFF_MS * Math.pow(2, attempt)
        console.log(
          `Rate limited, retrying in ${backoffMs}ms (attempt ${attempt + 1}/${MAX_RETRIES})`
        )
        await new Promise((resolve) => setTimeout(resolve, backoffMs))
        continue
      }

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Cloudflare error: ${errorText}`)
      }

      const imageBuffer = await response.arrayBuffer()
      return Buffer.from(imageBuffer).toString('base64')
    } catch (error) {
      lastError = error as Error
      if (attempt < MAX_RETRIES - 1) {
        const backoffMs = INITIAL_BACKOFF_MS * Math.pow(2, attempt)
        console.log(
          `Request failed, retrying in ${backoffMs}ms (attempt ${attempt + 1}/${MAX_RETRIES})`
        )
        await new Promise((resolve) => setTimeout(resolve, backoffMs))
      }
    }
  }

  throw lastError || new Error('Max retries exceeded')
}

const getCachedScreenshot = unstable_cache(
  async (name: string, width: number, height: number) => {
    const targetUrl = `${APP_BASE_URL}/view/${name}-demo`
    return queueScreenshotRequest(targetUrl, width, height)
  },
  ['screenshot'],
  {
    revalidate: 86400, // 24 hours
    tags: ['screenshot'],
  }
)

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const name = searchParams.get('name')
  const width = parseInt(searchParams.get('width') || String(SCREENSHOT_WIDTH))
  const height = parseInt(
    searchParams.get('height') || String(SCREENSHOT_HEIGHT)
  )

  if (!name) {
    return NextResponse.json(
      { error: 'Missing required parameter: name' },
      { status: 400 }
    )
  }

  if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
    return NextResponse.json(
      { error: 'Cloudflare credentials not configured' },
      { status: 500 }
    )
  }

  try {
    const base64Image = await getCachedScreenshot(name, width, height)
    const imageBuffer = Buffer.from(base64Image, 'base64')

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    })
  } catch (error) {
    console.error('Screenshot generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
