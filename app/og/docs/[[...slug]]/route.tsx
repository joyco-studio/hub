import { getPageImage, source } from '@/lib/source'
import { notFound } from 'next/navigation'
import { ImageResponse } from 'next/og'

import { readFile } from 'fs/promises'
import { join } from 'path'
import { DocsOgImage, getFonts, isTypeLogo } from '@/components/og'

export const revalidate = false

export async function GET(
  _req: Request,
  { params }: RouteContext<'/og/docs/[[...slug]]'>
) {
  const { slug } = await params

  const pageSlug = slug ?? []
  const type = pageSlug[0]
  const page = source.getPage(pageSlug)
  const isTopLevelCategoryPage = pageSlug.length === 1
  if (!page) notFound()

  // Return static opengraph image for home page and top category pages
  if (pageSlug.length === 0 || isTopLevelCategoryPage || !isTypeLogo(type)) {
    // Map category slugs to their specific OG images
    const categoryOgImages: Record<string, string> = {
      components: 'components-opengraph-image.png',
      logs: 'logs-opengraph-image.png',
      toolbox: 'toolbox-opengraph-image.png',
    }

    const ogImageFile =
      isTopLevelCategoryPage && type in categoryOgImages
        ? categoryOgImages[type]
        : 'opengraph-image.png'

    const imagePath = join(process.cwd(), 'public', ogImageFile)
    const imageBuffer = await readFile(imagePath)
    return new Response(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  }

  // Mantainer \ Author
  const [mainMaintainer] = page.data.maintainers
  const ogProfile = mainMaintainer ?? page.data.author

  return new ImageResponse(
    DocsOgImage({
      title: page.data.title,
      description: page.data.description,
      type,
      author: ogProfile,
      date: page.data.lastModified?.toISOString(),
    }),
    {
      width: 1200,
      height: 630,
      fonts: await getFonts(),
    }
  )
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    lang: page.locale,
    slug: getPageImage(page).segments,
  }))
}
