import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createRelativeLink } from 'fumadocs-ui/mdx'
import { readFile } from 'fs/promises'
import path from 'path'

import { getPageImage, getLLMText, source } from '@/lib/source'
import { getDownloadStats } from '@/lib/stats'
import { getMDXComponents } from '@/mdx-components'
import { Author } from '@/components/layout/author'
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
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { RegistryMetaProvider } from '@/components/registry-meta'
import { PageGithubLinkButton } from '@/components/page-github-link-button'

const getComponentSlug = (page: InferPageType<typeof source>) => {
  if (page.slugs[0] !== 'components') return undefined
  return page.slugs[page.slugs.length - 1]
}

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const getCategoryLabel = (slugs: string[]) => {
  const category = slugs[0]
  const labels: Record<string, string> = {
    components: 'Component',
    toolbox: 'Toolbox',
    logs: 'Log',
  }
  return labels[category] || category
}

const getLogNumber = (slugs: string[]) => {
  if (slugs[0] !== 'logs') return null
  const last = slugs[slugs.length - 1] ?? ''
  const match = last.match(/^(\d+)(?:[-_]|$)/)
  return match?.[1] ?? null
}

const stripLogPrefixFromTitle = (title: string, logNumber: string | null) => {
  if (!logNumber) return title
  const pattern = new RegExp(`^${escapeRegExp(logNumber)}\\s*[-–—]\\s+`, 'u')
  return title.replace(pattern, '')
}

type PageTreeNode = {
  type?: string
  $id?: string
  children?: PageTreeNode[]
}

const countPages = (node: PageTreeNode | undefined): number => {
  if (!node) return 0
  if (node.type === 'page') return 1
  return (node.children ?? []).reduce(
    (sum, child) => sum + countPages(child),
    0
  )
}

const getTopLevelFolder = (segment: string) => {
  const children = source.pageTree.children as unknown as PageTreeNode[]
  return children.find(
    (child) => child.type === 'folder' && child.$id?.split(':')[1] === segment
  )
}

async function getComponentSource(
  componentSlug: string | undefined
): Promise<string | null> {
  if (!componentSlug) return null

  try {
    const filePath = path.join(
      process.cwd(),
      'registry/joyco/blocks',
      `${componentSlug}.tsx`
    )
    const source = await readFile(filePath, 'utf-8')
    return source
  } catch {
    return null
  }
}

export default async function Page(props: PageProps<'/[[...slug]]'>) {
  const params = await props.params
  const page = source.getPage(params.slug)
  if (!page) notFound()

  const MDX = page.data.body

  const isLog = page.slugs[0] === 'logs'
  const isHome = page.slugs.length === 0

  const logNumber = getLogNumber(page.slugs)
  const displayTitle = isLog
    ? stripLogPrefixFromTitle(page.data.title, logNumber)
    : page.data.title
  const categoryLabel = getCategoryLabel(page.slugs)
  const badgeLabel = (() => {
    if (isHome) return 'Registry'
    if (isLog && logNumber) return `${categoryLabel} ${logNumber}`
    return categoryLabel
  })()

  const componentSlug = getComponentSlug(page)
  const downloadStats = componentSlug
    ? await getDownloadStats(componentSlug)
    : null
  const componentSource = await getComponentSource(componentSlug)
  const docLinks = [...page.data.docLinks]
  const llmText = await getLLMText(page)
  const llmUrl = page.slugs.length === 0 ? null : `/${page.slugs.join('/')}.md`

  const toc = page.data.toc
  const hasToc = toc.length > 0
  const counts = {
    components: countPages(getTopLevelFolder('components')),
    toolbox: countPages(getTopLevelFolder('toolbox')),
    logs: countPages(getTopLevelFolder('logs')),
  }

  return (
    <RegistryMetaProvider counts={counts}>
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
            'px-content-sides mx-auto w-full max-w-[900px] py-6 [grid-area:main] md:pt-8 xl:pt-14',
            'xl:layout:[--fd-toc-width:268px]'
          )}
        >
          {/* Category badge */}
          <Badge variant="accent" className="mb-4">
            {badgeLabel}
          </Badge>

          <div className="p-3">
            {/* Title and actions row */}
            <div className="mb-4 flex items-start justify-between gap-4">
              <h1 className="min-w-0 text-3xl leading-tight font-semibold">
                {displayTitle}
              </h1>
              <div className="flex items-center gap-2 max-sm:hidden">
                <PageGithubLinkButton
                  className="max-lg:hidden"
                  path={page.path}
                />
                <PageActions
                  content={llmText}
                  llmUrl={llmUrl}
                  componentSource={componentSource}
                />
              </div>
            </div>

            {/* Description */}
            {page.data.description && (
              <p className="text-foreground/70 mb-2 text-lg">
                {page.data.description}
              </p>
            )}
          </div>
          {/* Separator */}
          <Separator brackets align="bottom" className="mb-4" />

          {/* Doc links */}
          <div
            className={cn('flex items-start justify-between gap-8', {
              'lg:hidden': docLinks.length === 0,
            })}
          >
            <DocLinks links={docLinks}>
              <PageGithubLinkButton className="lg:hidden" path={page.path} />
            </DocLinks>
            <PageActions
              className="sm:hidden"
              content={llmText}
              llmUrl={llmUrl}
              componentSource={componentSource}
              showShortcuts={false}
            />
          </div>

          <div className="prose mt-10 flex-1">
            <MDX
              components={getMDXComponents({
                a: createRelativeLink(source, page),
              })}
            />
          </div>
          <PageFooter />
        </article>

        {/* Desktop TOC */}
        {hasToc && (
          <TOC
            footer={
              <>
                {isLog && <Author author={page.data.author} />}
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
    </RegistryMetaProvider>
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

  const isLog = page.slugs[0] === 'logs'
  const logNumber = getLogNumber(page.slugs)
  const displayTitle = isLog
    ? stripLogPrefixFromTitle(page.data.title, logNumber)
    : page.data.title

  const ogImage = getPageImage(page).url

  return {
    title: displayTitle,
    description: page.data.description,
    openGraph: {
      images: ogImage,
    },
  }
}
