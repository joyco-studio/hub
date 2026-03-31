import type { MetadataRoute } from 'next'
import { APP_BASE_URL } from '@/lib/constants'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/'],
    },
    sitemap: `${APP_BASE_URL}/sitemap.xml`,
  }
}
