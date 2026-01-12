import { cn } from '@/lib/utils'
import { RelatedItemCard } from './related-item-card'

type ItemType = 'component' | 'toolbox' | 'log'

interface RelatedItem {
  name: string
  title: string
  type: ItemType
  href: string
}

interface RelatedItemsProps extends React.ComponentProps<'section'> {
  title?: string
  items: RelatedItem[]
}

export function RelatedItems({
  title = 'Related Components',
  items,
  className,
  ...props
}: RelatedItemsProps) {
  if (items.length === 0) return null

  return (
    <section className={cn('not-prose', className)} {...props}>
      <h2 className="mb-6 text-2xl font-semibold tracking-tight">{title}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <RelatedItemCard
            key={item.name}
            name={item.name}
            title={item.title}
            type={item.type}
            href={item.href}
          />
        ))}
      </div>
    </section>
  )
}
