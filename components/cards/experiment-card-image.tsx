'use client'

import { cn } from '@/lib/utils'
import Image from 'next/image'
import { useState } from 'react'
import FlaskIcon from '../icons/flask'

interface ExperimentCardImageProps extends React.ComponentProps<'div'> {
  slug: string
  alt?: string
}

export function ExperimentCardImage({
  slug,
  alt,
  className,
  ...props
}: ExperimentCardImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const screenshotUrl = `/api/screenshot?experiment=${encodeURIComponent(slug)}`

  return (
    <div
      className={cn(
        'border-border bg-muted dark relative overflow-hidden rounded-md border',
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
          <FlaskIcon className="text-primary-foreground size-8" />
        </div>
      ) : (
        <Image
          src={screenshotUrl}
          alt={alt || `Preview of ${slug}`}
          width={800}
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
