import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  PageLastUpdate,
} from 'fumadocs-ui/page'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createRelativeLink } from 'fumadocs-ui/mdx'

import { getPageImage, source } from '@/lib/source'
import { getDownloadStats } from '@/lib/stats'
import { getMDXComponents } from '@/mdx-components'
import { Maintainers } from '@/components/layout/maintainers'
import { WeeklyDownloads } from '@/components/layout/weekly-downloads'
import { InferPageType } from 'fumadocs-core/source'
import { DocLinks } from '@/components/layout/doc-links'
import { PageActions } from '@/components/layout/page-actions'

const getComponentSlug = (page: InferPageType<typeof source>) => {
  if (page.slugs[0] !== 'components') return undefined
  return page.slugs[page.slugs.length - 1]
}

export default async function Page(props: PageProps<'/[[...slug]]'>) {
  const params = await props.params
  const page = source.getPage(params.slug)
  if (!page) notFound()

  const MDX = page.data.body

  const componentSlug = getComponentSlug(page)
  const downloadStats = componentSlug
    ? await getDownloadStats(componentSlug)
    : null
  const docLinks = page.data.docLinks

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      tableOfContent={{
        style: 'clerk',
        footer: (
          <div className="flex flex-col gap-4 py-2">
            <Maintainers maintainers={page.data.maintainers} />
            {downloadStats && <WeeklyDownloads data={downloadStats} />}
            {page.data.lastModified && (
              <PageLastUpdate
                className="opacity-50"
                date={new Date(page.data.lastModified)}
              />
            )}
          </div>
        ),
      }}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className="mb-1">
        {page.data.description}
      </DocsDescription>
      <DocLinks links={docLinks} className="mb-4" />
      <PageActions slugs={page.slugs} className="mb-4" />
      <DocsBody>
        <MDX
          components={getMDXComponents({
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  )
}

export async function generateStaticParams() {
  return source.generateParams()
}

export async function generateMetadata(
  props: PageProps<'/[[...slug]]'>
): Promise<Metadata> {
  const params = await props.params
  const page = source.getPage(params.slug)
  if (!page) notFound()

  return {
    title: page.data.title,
    description: page.data.description,
    openGraph: {
      images: getPageImage(page).url,
    },
  }
}
