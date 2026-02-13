import { cn } from '@/lib/utils'
import type { SidebarItemMeta } from './sidebar/section'

type MetaBadgeProps = {
  type: NonNullable<SidebarItemMeta['badge']>
  className?: string
}

export function MetaBadge({ type, className }: MetaBadgeProps) {
  return (
    <span
      className={cn(
        'shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase',
        type === 'new' && 'bg-primary text-primary-foreground',
        type === 'updated' && 'bg-card text-card-foreground',
        className
      )}
    >
      {type}
    </span>
  )
}
