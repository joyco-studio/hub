'use client'
import { RegistryCounts, useRegistryMeta } from './registry-meta'
import { Badge, type BadgeProps } from './ui/badge'

export function CategoryIndexBadge({
  category,
  ...props
}: {
  category: keyof RegistryCounts
} & BadgeProps) {
  const { counts } = useRegistryMeta()

  const count = counts[category] ?? 0

  return count ? <Badge {...props}>{count}</Badge> : null
}
