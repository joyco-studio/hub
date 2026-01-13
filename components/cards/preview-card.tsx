'use client'

import { cn } from '@/lib/utils'
import { ItemType, itemTypeConfig } from '@/lib/item-types'
import Link from 'next/link'
import { PreviewCardImage } from './preview-card-image'
import { Badge } from '../ui/badge'

interface PreviewCardProps extends React.ComponentProps<'a'> {
  name: string
  title: string
  type: ItemType
  href: string
  showBadge?: boolean
}

export function PreviewCard({
  name,
  title,
  type,
  href,
  showBadge = true,
  className,
  ...props
}: PreviewCardProps) {
  const { label, Icon } = itemTypeConfig[type]
  const hasPreview = type === 'component'

  return (
    <Link
      href={href}
      className={cn(
        'group relative flex flex-col gap-1 overflow-hidden rounded-lg transition-[colors,scale]',
        className
      )}
      {...props}
    >
      {/* Preview Area */}
      <div className="relative h-[200px] w-full overflow-hidden">
        {/* Type Badge */}
        {showBadge && (
          <Badge
            variant="key"
            className="absolute top-3 left-3 z-10 border-none shadow-none"
          >
            {label}
          </Badge>
        )}

        {hasPreview ? (
          <PreviewCardImage
            type={type}
            name={name}
            className="h-full w-full rounded-none border-0"
          />
        ) : (
          <div className="bg-primary flex h-full w-full items-center justify-center">
            <Icon className="text-foreground size-8" />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-card group-hover:bg-accent/50 flex items-center justify-between px-4 py-3 transition-colors">
        <span className="font-mono text-sm font-medium tracking-wide uppercase">
          {title}
        </span>
        <svg
          className="h-4 w-4 -rotate-45 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  )
}
