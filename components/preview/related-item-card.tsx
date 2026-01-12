'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { ComponentPreviewImage } from './component-preview-image'
import FileIcon from '@/components/icons/file'
import CubeIcon from '@/components/icons/3d-cube'

type ItemType = 'component' | 'toolbox' | 'log'

interface RelatedItemCardProps extends React.ComponentProps<'a'> {
  name: string
  title: string
  type: ItemType
  href: string
}

const typeConfig: Record<
  ItemType,
  { label: string; Icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }
> = {
  component: { label: 'COMPONENT', Icon: CubeIcon },
  toolbox: { label: 'TOOLBOX', Icon: CubeIcon },
  log: { label: 'LOG', Icon: FileIcon },
}

export function RelatedItemCard({
  name,
  title,
  type,
  href,
  className,
  ...props
}: RelatedItemCardProps) {
  const { label, Icon } = typeConfig[type]
  const isComponent = type === 'component'

  return (
    <Link
      href={href}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:bg-accent/50',
        className
      )}
      {...props}
    >
      {/* Preview Area */}
      <div className="relative h-[200px] w-full overflow-hidden">
        {/* Type Badge */}
        <span className="absolute left-3 top-3 z-10 rounded bg-foreground/90 px-2 py-1 font-mono text-xs font-medium tracking-wide text-background">
          {label}
        </span>

        {isComponent ? (
          <ComponentPreviewImage
            name={name}
            width={300}
            height={200}
            className="h-full w-full border-0 rounded-none"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-blue-600">
            <Icon className="h-12 w-12 text-white" />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border bg-muted/50 px-4 py-3">
        <span className="font-mono text-sm font-medium uppercase tracking-wide">
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
