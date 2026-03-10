'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

type ExperimentIframeProps = {
  src: string
  title: string
  className?: string
}

export function ExperimentIframe({
  src,
  title,
  className,
}: ExperimentIframeProps) {
  const [isLoading, setIsLoading] = React.useState(true)

  return (
    <div
      className={cn('relative h-full w-full', className)}
      style={{ touchAction: 'manipulation', overscrollBehavior: 'contain' }}
    >
      {isLoading && (
        <div className="bg-muted absolute inset-0 flex items-center justify-center">
          <div className="text-muted-foreground flex flex-col items-center gap-3">
            <div className="border-muted-foreground/30 border-t-foreground size-6 animate-spin rounded-full border-2" />
            <span className="font-mono text-xs tracking-wide uppercase">
              Loading experiment…
            </span>
          </div>
        </div>
      )}
      <iframe
        src={src}
        title={title}
        className="h-full w-full border-0"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        allow="accelerometer; camera; gyroscope; microphone"
        onLoad={() => setIsLoading(false)}
      />
    </div>
  )
}
