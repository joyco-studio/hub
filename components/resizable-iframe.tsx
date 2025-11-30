'use client'

import * as React from 'react'
import { useState, useRef, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { GripVertical } from 'lucide-react'

interface ResizableIframeProps {
  /** The URL for the iframe */
  src?: string
  /** The HTML content for the iframe (srcdoc) - use src OR srcDoc */
  srcDoc?: string
  /** Initial width in pixels */
  defaultWidth?: number
  /** Minimum width in pixels */
  minWidth?: number
  /** Maximum width in pixels (defaults to container width) */
  maxWidth?: number
  /** Height of the iframe */
  height?: number | string
  /** Callback when width changes */
  onWidthChange?: (width: number) => void
  /** Whether to show the width indicator bar */
  showIndicator?: boolean
  /** Custom breakpoints for the indicator label */
  breakpoints?: { label: string; minWidth: number }[]
  /** Title for the iframe (accessibility) */
  title?: string
  /** Additional className for the container */
  className?: string
  /** Additional className for the iframe */
  iframeClassName?: string
}

const DEFAULT_BREAKPOINTS = [
  { label: 'xs', minWidth: 0 },
  { label: 'sm', minWidth: 640 },
  { label: 'md', minWidth: 768 },
  { label: 'lg', minWidth: 1024 },
  { label: 'xl', minWidth: 1280 },
]

export function ResizableIframe({
  src,
  srcDoc,
  defaultWidth = 400,
  minWidth = 280,
  maxWidth,
  height = 400,
  onWidthChange,
  showIndicator = true,
  breakpoints = DEFAULT_BREAKPOINTS,
  title = 'Resizable iframe preview',
  className,
  iframeClassName,
}: ResizableIframeProps) {
  const [width, setWidth] = useState(defaultWidth)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const updateWidth = useCallback(
    (newWidth: number) => {
      const containerWidth = containerRef.current?.offsetWidth ?? Infinity
      const clampedWidth = Math.max(
        minWidth,
        Math.min(newWidth, maxWidth ?? containerWidth)
      )
      setWidth(clampedWidth)
      onWidthChange?.(clampedWidth)
    },
    [minWidth, maxWidth, onWidthChange]
  )

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      const containerRect = containerRef.current.getBoundingClientRect()
      const containerCenter = containerRect.left + containerRect.width / 2
      // Width is 2x the distance from center to cursor (symmetric resize)
      const newWidth = (e.clientX - containerCenter) * 2
      updateWidth(newWidth)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!containerRef.current || !e.touches[0]) return
      const containerRect = containerRef.current.getBoundingClientRect()
      const containerCenter = containerRect.left + containerRect.width / 2
      // Width is 2x the distance from center to touch point (symmetric resize)
      const newWidth = (e.touches[0].clientX - containerCenter) * 2
      updateWidth(newWidth)
    }

    const handleEnd = () => {
      setIsDragging(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleEnd)
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleEnd)
    document.body.style.cursor = 'ew-resize'
    document.body.style.userSelect = 'none'

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleEnd)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleEnd)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isDragging, updateWidth])

  const getBreakpointLabel = useCallback(
    (w: number) => {
      const sorted = [...breakpoints].sort((a, b) => b.minWidth - a.minWidth)
      return sorted.find((bp) => w >= bp.minWidth)?.label ?? 'xs'
    },
    [breakpoints]
  )

  const heightStyle = typeof height === 'number' ? `${height}px` : height
  // absolute inset-0
  return (
    <div className={cn('flex flex-col', className)}>
      <div
        ref={containerRef}
        className="relative flex w-full justify-center overflow-hidden"
      >
        {/* Background fill for space on both sides */}
        <div
          className="bg-card pointer-events-none absolute inset-0"
          style={
            {
              '--pattern-fg':
                'color-mix(in oklab, var(--border) 30%, transparent)',
              backgroundImage:
                'repeating-linear-gradient(315deg,var(--pattern-fg) 0,var(--pattern-fg) 1px,transparent 0,transparent 50%)',
              backgroundAttachment: 'fixed',
              backgroundSize: '10px 10px',
            } as React.CSSProperties
          }
        />

        {/* Resizable content area - centered */}
        <div
          className="border-border relative z-10 border-l"
          style={{ width: `${width}px`, maxWidth: '100%' }}
        >
          <iframe
            ref={iframeRef}
            src={src}
            srcDoc={srcDoc}
            className={cn('bg-background border-0', iframeClassName)}
            style={{
              width: 'calc(100% - 20px)', // Account for resize handle width
              height: heightStyle,
              pointerEvents: isDragging ? 'none' : 'auto',
            }}
            title={title}
          />

          {/* Resize handle */}
          <div
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            className={cn(
              'absolute top-0 right-0 flex h-full w-5 cursor-ew-resize items-center justify-center',
              'bg-border hover:bg-border/80 border-border border-l transition-colors',
              isDragging && 'bg-border'
            )}
          >
            <GripVertical className="h-3.5 w-3.5 text-neutral-400" />
          </div>
        </div>
      </div>

      {/* Width indicator */}
      {showIndicator && (
        <div className="border-border bg-card flex items-center justify-between border-t px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-mono text-xs uppercase">
              Width:
            </span>
            <span className="text-foreground font-mono text-sm font-medium">
              {Math.round(width)}px
            </span>
            <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 font-mono text-xs">
              {getBreakpointLabel(width)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export type { ResizableIframeProps }
