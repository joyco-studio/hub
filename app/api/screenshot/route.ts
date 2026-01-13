import { APP_BASE_URL } from '@/lib/constants'
import { NextRequest, NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import { baseScreenshStyle, DemoConfig, getDemoConfig } from './config'

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN

const MAX_RETRIES = 5
const INITIAL_BACKOFF_MS = 2000

async function fetchScreenshotFromCloudflare(
  targetUrl: string,
  config: DemoConfig
): Promise<string> {
  let lastError: Error | null = null
  console.log('fetchScreenshotFromCloudflare', config)
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
            viewport: config.viewport,
            gotoOptions: {
              waitUntil: 'networkidle0',
              timeout: 30000,
            },
            ...(config.timeout ? { waitForTimeout: config.timeout } : {}),
            addStyleTag: [
              {
                content: `
                  ${baseScreenshStyle}
                  ${config.styles}
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

// Demo pages must follow the `{name}-demo` naming convention (e.g., `demos/chat-demo.tsx`)
const getCachedScreenshot = unstable_cache(
  async (name: string) => {
    const demoConfig = getDemoConfig(name)
    const targetUrl = `${APP_BASE_URL}/view/${name}-demo`
    return fetchScreenshotFromCloudflare(targetUrl, demoConfig)
  },
  ['screenshot'],
  { revalidate: false }
)

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const name = searchParams.get('name')

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
    const base64Image = await getCachedScreenshot(name)
    const imageBuffer = Buffer.from(base64Image, 'base64')

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, s-maxage=31536000',
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
