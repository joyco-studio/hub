'use client'

import { cn } from '@/lib/utils'
import { ItemType } from '@/lib/item-types'
import Image from 'next/image'
import { useState } from 'react'
import CubeIcon from '../icons/3d-cube'
import TerminalWithCursorIcon from '../icons/terminal-w-cursor'
import FileIcon from '../icons/file'

interface PreviewCardImageProps extends React.ComponentProps<'div'> {
  name: string
  type: ItemType
  alt?: string
}

const typeIcons: Record<
  ItemType,
  React.ComponentType<React.SVGProps<SVGSVGElement>>
> = {
  component: CubeIcon,
  toolbox: TerminalWithCursorIcon,
  log: FileIcon,
}

export function PreviewCardImage({
  name,
  type,
  alt,
  className,
  ...props
}: PreviewCardImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const screenshotUrl = `/api/screenshot?name=${encodeURIComponent(name)}&width=1200&height=600`
  const Icon = typeIcons[type]

  return (
    <div
      className={cn(
        'border-border bg-muted relative overflow-hidden rounded-md border',
        className
      )}
      {...props}
    >
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="border-muted-foreground size-12 animate-spin rounded-full border-2 border-t-transparent" />
        </div>
      )}

      {hasError ? (
        <div className="bg-primary absolute inset-0 flex items-center justify-center">
          <Icon className="text-foreground size-8" />
        </div>
      ) : (
        <Image
          src={screenshotUrl}
          alt={alt || `Preview of ${name}`}
          width={600}
          height={400}
          sizes="(max-width: 768px) 100vw, 600px"
          style={{ width: '100%', height: '100%' }}
          unoptimized
          className={cn(
            'h-full w-full object-cover transition-opacity duration-300',
            isLoading ? 'opacity-0' : 'opacity-100'
          )}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false)
            setHasError(true)
          }}
        />
      )}
    </div>
  )
}
