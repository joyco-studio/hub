import { cn } from '@/lib/utils'
import { PreviewCard } from '@/components/cards'
import { Separator } from '../ui/separator'
import { ItemType } from '@/lib/item-types'

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
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <Separator
        brackets
        align="top"
        className="relative -mx-7 mt-2 mb-6 w-[calc(100%+--spacing(14))]"
        title="Related Items"
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <PreviewCard
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
