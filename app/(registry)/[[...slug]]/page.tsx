import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createRelativeLink } from 'fumadocs-ui/mdx'

import { getPageImage, getLLMText, source } from '@/lib/source'
import { getDownloadStats } from '@/lib/stats'
import { getMDXComponents } from '@/mdx-components'
import { Maintainers } from '@/components/layout/maintainers'
import { WeeklyDownloads } from '@/components/layout/weekly-downloads'
import { TOC } from '@/components/layout/toc'
import { InferPageType } from 'fumadocs-core/source'
import { DocLinks } from '@/components/layout/doc-links'
import { PageActions } from '@/components/layout/page-actions'
import { TOCProvider } from '@/components/toc'
import {
  PageTOCPopover,
  PageTOCPopoverTrigger,
  PageTOCPopoverContent,
  PageFooter,
} from '@/components/layout/docs/page/client'
import { TOCScrollArea } from '@/components/toc'
import { TOCItems } from '@/components/toc/clerk'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/cn'

const getComponentSlug = (page: InferPageType<typeof source>) => {
  if (page.slugs[0] !== 'components') return undefined
  return page.slugs[page.slugs.length - 1]
}

const getCategoryLabel = (slugs: string[]) => {
  const category = slugs[0]
  const labels: Record<string, string> = {
    components: 'Component',
    toolbox: 'Toolbox',
    logs: 'Log',
  }
  return labels[category] || category
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
  const llmText = await getLLMText(page)
  const llmUrl = `/${page.slugs.join('/')}.md`

  const toc = page.data.toc
  const hasToc = toc.length > 0

  return (
    <TOCProvider toc={toc}>
      {/* Mobile TOC Popover */}
      {hasToc && (
        <PageTOCPopover>
          <PageTOCPopoverTrigger />
          <PageTOCPopoverContent>
            <TOCScrollArea>
              <TOCItems />
            </TOCScrollArea>
          </PageTOCPopoverContent>
        </PageTOCPopover>
      )}

      {/* Main article content */}
      <article
        id="nd-page"
        className={cn(
          'px-content-sides mx-auto flex w-full max-w-[900px] flex-col gap-4 py-6 [grid-area:main] md:pt-8 xl:pt-14',
          'xl:layout:[--fd-toc-width:268px]'
        )}
      >
        <div className="mx-auto w-full max-w-2xl 2xl:max-w-3xl">
          {/* Category badge */}
          <Badge variant="muted" className="mb-4">
            {getCategoryLabel(page.slugs)}
          </Badge>

          {/* Title and actions row */}
          <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
            <h1 className="text-[1.75em] leading-tight font-semibold">
              {page.data.title}
            </h1>
            <PageActions
              className="max-sm:hidden"
              content={llmText}
              llmUrl={llmUrl}
            />
          </div>

          {/* Description */}
          {page.data.description && (
            <p className="text-fd-muted-foreground mb-4 text-lg">
              {page.data.description}
            </p>
          )}

          {/* Separator */}
          <div className="bg-border mb-4 h-px w-full" />

          {/* Doc links */}
          <div className="mb-6 flex items-center justify-between gap-8">
            <DocLinks links={docLinks} />
            <PageActions
              className="sm:hidden"
              content={llmText}
              llmUrl={llmUrl}
            />
          </div>

          <div className="prose flex-1">
            <MDX
              components={getMDXComponents({
                a: createRelativeLink(source, page),
              })}
            />
          </div>
        </div>
        <PageFooter />
      </article>

      {/* Desktop TOC */}
      {hasToc && (
        <TOC
          footer={
            <>
              <Maintainers
                maintainers={page.data.maintainers}
                lastModified={
                  page.data.lastModified
                    ? new Date(page.data.lastModified)
                    : undefined
                }
              />
              {downloadStats && <WeeklyDownloads data={downloadStats} />}
            </>
          }
        />
      )}
    </TOCProvider>
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
