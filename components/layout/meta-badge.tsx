import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { SidebarItemMeta } from './sidebar/section'

const variantMap = {
  new: 'default',
  updated: 'secondary',
  internal: 'muted',
} as const

type MetaBadgeProps = {
  type: NonNullable<SidebarItemMeta['badge']>
  className?: string
}

export function MetaBadge({ type, className }: MetaBadgeProps) {
  return (
    <Badge variant={variantMap[type]} size="sm" className={className}>
      {type}
    </Badge>
  )
}
