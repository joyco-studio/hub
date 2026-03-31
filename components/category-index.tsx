import Link from 'next/link'
import { source } from '@/lib/source'
import { CategoryIndexBadge } from './category-index-badge'
import { PreviewCard } from '@/components/cards'
import { ItemType } from '@/lib/item-types'
import { RegistryCounts } from './registry-meta'
import { getLogNumber, stripLogPrefixFromTitle } from '@/lib/log-utils'
import { Badge } from './ui/badge'
import { Fragment } from 'react'
export function CategoryIndex({
  category,
}: {
  category: keyof RegistryCounts
}) {
  const pages = source
    .getPages()
    .filter((page) => page.slugs[0] === category && page.slugs.length > 1)
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

  return (
    <div className="not-prose">
      <h3 className="mb-6 flex items-center gap-4 text-2xl font-semibold">
        All {label}{' '}
        <CategoryIndexBadge
          variant="secondary"
          className="h-7 py-0 text-base"
          category={category}
        />
      </h3>
      {useGrid ? (
        <div className="grid grid-cols-1 gap-4 pb-16 sm:grid-cols-2 lg:grid-cols-3">
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
        <div className="-mx-3 flex w-[calc(100%+1.5rem)] flex-col pb-16">
          {pages.map((page) => {
            const logNumber = getLogNumber(page.slugs)
            const displayTitle =
              type === 'log'
                ? stripLogPrefixFromTitle(page.data.title, logNumber)
                : page.data.title

            return (
              <Fragment key={page.url}>
                <Link
                  key={page.url}
                  href={page.url}
                  className="group hover:bg-accent/50 flex items-baseline gap-3 rounded-md px-3 py-4 pr-4 transition-colors"
                >
                  {logNumber && (
                    <Badge variant="secondary" className="tabular-nums">
                      {logNumber}
                    </Badge>
                  )}
                  <span className="text-foreground min-w-0 flex-1 truncate text-sm font-medium">
                    {displayTitle}
                  </span>
                  {page.data.description && (
                    <span className="text-muted-foreground hidden truncate text-sm sm:block sm:max-w-[50%]">
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
