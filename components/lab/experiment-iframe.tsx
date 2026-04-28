'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useLocalStorage } from '@/registry/hooks/use-local-storage'

type ExperimentIframeProps = {
  src: string
  title: string
  className?: string
  hasControls: boolean
}

export function ExperimentIframe({
  src,
  title,
  className,
  hasControls,
}: ExperimentIframeProps) {
  const [isLoading, setIsLoading] = React.useState(true)
  const [debug, setDebug] = useLocalStorage('lab-debug', false)

  const iframeSrc = React.useMemo(() => {
    try {
      const url = new URL(src)
      url.searchParams.set('lab', 'true')
      url.searchParams.set('debug', String(debug)) // 'true'/'false' string
      return url.toString()
    } catch {
      return src
    }
  }, [src, debug])

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
        src={iframeSrc}
        title={title}
        className="h-full w-full border-0"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        allow="accelerometer; camera; gyroscope; microphone"
        onLoad={() => setIsLoading(false)}
      />
      {hasControls && (
        <Button
          variant={debug ? 'default' : 'outline'}
          size="sm"
          aria-label={debug ? 'Hide controls' : 'Show controls'}
          onClick={() => setDebug((prev) => !prev)}
          className="absolute right-4 bottom-4 z-31"
        >
          {debug ? 'Hide controls' : 'Show controls'}
        </Button>
      )}
    </div>
  )
}
