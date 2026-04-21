import type { MetadataRoute } from 'next'
import { source } from '@/lib/source'
import { getExperiments } from '@/lib/lab'
import { APP_BASE_URL } from '@/lib/constants'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { experiments } = await getExperiments()

  const staticPages: MetadataRoute.Sitemap = [
    { url: APP_BASE_URL, priority: 1 },
    { url: `${APP_BASE_URL}/lab`, priority: 0.8 },
  ]

  const docPages: MetadataRoute.Sitemap = source.getPages().map((page) => ({
    url: `${APP_BASE_URL}${page.url}`,
    priority: 0.7,
  }))

  const experimentPages: MetadataRoute.Sitemap = experiments.map((e) => ({
    url: `${APP_BASE_URL}/lab/${e.slug}`,
    priority: 0.6,
  }))

  return [...staticPages, ...docPages, ...experimentPages]
}
