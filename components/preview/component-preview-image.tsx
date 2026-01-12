'use client'

import { cn } from '@/lib/utils'
import Image from 'next/image'
import { useState } from 'react'

interface ComponentPreviewImageProps extends React.ComponentProps<'div'> {
  name: string
  width?: number
  height?: number
  alt?: string
}

export function ComponentPreviewImage({
  name,

  alt,
  className,
  ...props
}: ComponentPreviewImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const screenshotUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/screenshot?name=${encodeURIComponent(name)}&width=1200&height=600`

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
          <div className="border-muted-foreground h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
        </div>
      )}

      {hasError ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-muted-foreground text-xs">
            Preview unavailable
          </span>
        </div>
      ) : (
        <Image
          src={screenshotUrl}
          alt={alt || `Preview of ${name} component`}
          width={600}
          height={400}
          sizes="(max-width: 768px) 100vw, 600px"
          style={{ width: '100%', height: '100%' }}
          priority
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
