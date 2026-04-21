import Link from 'next/link'
import { source } from '@/lib/source'
import { CategoryIndexBadge } from './category-index-badge'
import { PreviewCard } from '@/components/cards'
import { ItemType } from '@/lib/item-types'
import { RegistryCounts } from './registry-meta'
import { getLogNumber, stripLogPrefixFromTitle } from '@/lib/log-utils'
import { getPageViews } from '@/lib/stats'
import { Badge } from './ui/badge'
import { EyeIcon } from 'lucide-react'
import { Fragment } from 'react'

type PageTreeNode = {
  type?: string
  $id?: string
  url?: string
  children?: PageTreeNode[]
}

function getPageTreeOrder(category: string): string[] {
  const children = source.pageTree.children as unknown as PageTreeNode[]
  const folder = children.find(
    (child) => child.type === 'folder' && child.$id?.split(':')[1] === category
  )
  if (!folder?.children) return []
  return folder.children
    .filter((child) => child.type === 'page' && child.url)
    .map((child) => child.url!)
}

export async function CategoryIndex({
  category,
}: {
  category: keyof RegistryCounts
}) {
  const pages = source
    .getPages()
    .filter((page) => page.slugs[0] === category && page.slugs.length > 1)

  // Sort pages based on meta.json order (reflected in the page tree)
  const pageTreeOrder = getPageTreeOrder(category)
  if (pageTreeOrder.length > 0) {
    const orderMap = new Map(pageTreeOrder.map((url, i) => [url, i]))
    pages.sort((a, b) => {
      const aIndex = orderMap.get(a.url) ?? Infinity
      const bIndex = orderMap.get(b.url) ?? Infinity
      return aIndex - bIndex
    })
  }

  if (category === 'logs') pages.reverse()
  const typeMap: Record<keyof RegistryCounts, ItemType> = {
    components: 'component',
    toolbox: 'toolbox',
    logs: 'log',
  }
  const label =
    category === 'components'
      ? 'Components'
      : category === 'toolbox'
        ? 'Toolbox'
        : 'Logs'
  const type = typeMap[category]
  const useGrid = category === 'components'

  const viewsMap =
    category === 'logs'
      ? new Map(
          await Promise.all(
            pages.map(async (page) => {
              const slug = page.slugs[page.slugs.length - 1]
              const views = await getPageViews(`/logs/${slug}`)
              return [page.url, views] as const
            })
          )
        )
      : null

  return (
    <div className="not-prose">
      {category === 'components' && (
        <h3 className="mb-6 flex items-center gap-4 text-2xl font-semibold">
          All {label}{' '}
          <CategoryIndexBadge
            variant="secondary"
            className="h-7 py-0 text-base"
            category={category}
          />
        </h3>
      )}
      {useGrid ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pages.map((page) => (
            <PreviewCard
              key={page.url}
              name={page.slugs[page.slugs.length - 1]}
              title={page.data.title}
              type={type}
              href={page.url}
              showBadge={type === 'log'}
            />
          ))}
        </div>
      ) : (
        <div className="-mx-3 flex w-[calc(100%+1.5rem)] flex-col">
          {pages.map((page) => {
            const logNumber = getLogNumber(page.slugs)
            const displayTitle =
              type === 'log'
                ? stripLogPrefixFromTitle(page.data.title, logNumber)
                : page.data.title

            return (
              <Fragment key={page.url}>
                <Link
                  href={page.url}
                  className="group hover:bg-accent/50 flex flex-col gap-1.5 rounded-md px-3 py-4 pr-4 transition-colors sm:flex-row sm:items-baseline sm:gap-3"
                >
                  <div className="flex min-w-0 flex-1 items-baseline gap-3">
                    {logNumber && (
                      <Badge variant="secondary" className="tabular-nums">
                        {logNumber}
                      </Badge>
                    )}
                    <span className="text-foreground min-w-0 truncate text-sm font-medium">
                      {displayTitle}
                    </span>
                    {viewsMap?.get(page.url) != null && (
                      <span className="text-muted-foreground flex shrink-0 items-center gap-1 self-center text-xs tabular-nums">
                        <EyeIcon className="size-3" />
                        {viewsMap.get(page.url)!.toLocaleString()}
                      </span>
                    )}
                  </div>
                  {page.data.description && (
                    <span className="text-muted-foreground line-clamp-2 text-sm sm:line-clamp-1 sm:max-w-[50%] sm:text-right">
                      {page.data.description}
                    </span>
                  )}
                </Link>
                <div className="bg-accent/50 h-px w-full" />
              </Fragment>
            )
          })}
        </div>
      )}
    </div>
  )
}
