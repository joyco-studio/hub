import { source } from '@/lib/source'
import { CategoryIndexBadge } from './category-index-badge'
import { PreviewCard } from '@/components/cards'
import { ItemType } from '@/lib/item-types'
import { RegistryCounts } from './registry-meta'

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
      <div className="grid grid-cols-1 gap-4 pb-16 sm:grid-cols-2 lg:grid-cols-3">
        {pages.map((page) => (
          <PreviewCard
            key={page.url}
            name={page.slugs[page.slugs.length - 1]}
            title={page.data.title}
            type={type}
            href={page.url}
            showBadge={false}
          />
        ))}
      </div>
    </div>
  )
}
