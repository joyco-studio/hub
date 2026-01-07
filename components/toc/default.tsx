'use client'
import { useI18n } from 'fumadocs-ui/contexts/i18n'
import { cn } from '../../lib/cn'
import { type ComponentProps, useRef } from 'react'
import { mergeRefs } from '../../lib/merge-refs'
import { TocThumb, useTOCItems } from './index'
import * as Primitive from 'fumadocs-core/toc'

export function TOCItems({ ref, className, ...props }: ComponentProps<'div'>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const items = useTOCItems()
  const { text } = useI18n()

  if (items.length === 0)
    return (
      <div className="bg-card text-muted-foreground rounded-lg border p-3 text-xs">
        {text.tocNoHeadings}
      </div>
    )

  return (
    <>
      <TocThumb
        containerRef={containerRef}
        className="bg-primary absolute top-(--fd-top) h-(--fd-height) w-0.5 rounded-e-sm transition-[top,height] ease-linear"
      />
      <div
        ref={mergeRefs(ref, containerRef)}
        className={cn(
          'border-foreground/10 flex flex-col border-s-2',
          className
        )}
        {...props}
      >
        {items.map((item) => (
          <TOCItem key={item.url} item={item} />
        ))}
      </div>
    </>
  )
}

function TOCItem({ item }: { item: Primitive.TOCItemType }) {
  return (
    <Primitive.TOCItem
      href={item.url}
      className={cn(
        'prose text-muted-foreground data-[active=true]:text-primary py-1.5 text-sm wrap-anywhere transition-colors first:pt-0 last:pb-0',
        item.depth <= 2 && 'ps-3',
        item.depth === 3 && 'ps-6',
        item.depth >= 4 && 'ps-8'
      )}
    >
      {item.title}
    </Primitive.TOCItem>
  )
}
