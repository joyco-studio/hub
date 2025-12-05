'use client'

import * as React from 'react'
import { useState, useRef, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { GripVertical, Tablet, Smartphone } from 'lucide-react'
import { PatternOverlay } from './pattern-overlay'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

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

type DevicePreset = 'tablet' | 'mobile'

const DEVICE_PRESETS: Record<DevicePreset, number> = {
  tablet: 768,
  mobile: 375,
}

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
  // Detect which device preset matches the current width
  const detectDeviceFromWidth = useCallback((w: number): DevicePreset => {
    const tabletDiff = Math.abs(w - DEVICE_PRESETS.tablet)
    const mobileDiff = Math.abs(w - DEVICE_PRESETS.mobile)

    if (tabletDiff <= mobileDiff) {
      return 'tablet'
    } else {
      return 'mobile'
    }
  }, [])

  // Initialize width - use desktop preset if defaultWidth is the default value
  const initialWidth =
    defaultWidth === 400 ? DEVICE_PRESETS.tablet : defaultWidth
  const [width, setWidth] = useState(initialWidth)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<DevicePreset>(() =>
    detectDeviceFromWidth(initialWidth)
  )
  const containerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const updateWidth = useCallback(
    (newWidth: number, updateDevice = true) => {
      const containerWidth = containerRef.current?.offsetWidth ?? Infinity
      const clampedWidth = Math.max(
        minWidth,
        Math.min(newWidth, maxWidth ?? containerWidth)
      )
      setWidth(clampedWidth)
      if (updateDevice) {
        setSelectedDevice(detectDeviceFromWidth(clampedWidth))
      }
      onWidthChange?.(clampedWidth)
    },
    [minWidth, maxWidth, onWidthChange, detectDeviceFromWidth]
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

  const handleDeviceSelect = useCallback(
    (device: DevicePreset) => {
      setSelectedDevice(device)
      updateWidth(DEVICE_PRESETS[device], false)
    },
    [updateWidth]
  )

  const heightStyle = typeof height === 'number' ? `${height}px` : height
  // absolute inset-0
  return (
    <div className="flex flex-col">
      <div className="bg-card border-border z-10 flex items-center justify-between border-b">
        {showIndicator && (
          <div className="text-foreground z-10 flex items-center gap-2 px-4 py-2">
            <span className="text-foreground font-mono text-sm font-medium">
              {Math.round(width)}px
            </span>
            <span className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 font-mono text-xs">
              {getBreakpointLabel(width)}
            </span>
          </div>
        )}
        <div className="ml-auto flex items-center gap-1 px-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => handleDeviceSelect('mobile')}
                className={cn(
                  'flex items-center justify-center rounded-md p-1.5 transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  selectedDevice === 'mobile'
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground'
                )}
                aria-label="Mobile view"
              >
                <Smartphone className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              Mobile View
            </TooltipContent>
          </Tooltip>

          
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => handleDeviceSelect('tablet')}
                className={cn(
                  'flex items-center justify-center rounded-md p-1.5 transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  selectedDevice === 'tablet'
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground'
                )}
                aria-label="Tablet view"
              >
                <Tablet className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              Tablet View
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      <div className={cn('relative flex flex-col', className)}>
        <PatternOverlay className="bg-card pointer-events-none absolute inset-0" />

        <div
          ref={containerRef}
          className="relative flex w-full justify-center overflow-hidden"
        >
          {/* Resizable content area - centered */}
          <div
            className="relative z-10 border-l"
            style={{ width: `${width}px`, maxWidth: '100%' }}
          >
            <iframe
              ref={iframeRef}
              src={src}
              srcDoc={srcDoc}
              className={cn('border-0', iframeClassName)}
              style={{
                width: 'calc(100% - 20px)', // Account for resize handle width
                height: `calc(${heightStyle} - 80px)`,
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
                'bg-border hover:bg-border/80 transition-colors',
                isDragging && 'bg-border'
              )}
            >
              <GripVertical className="h-3.5 w-3.5 text-neutral-400" />
            </div>
          </div>
        </div>
        {/* Width indicator */}
      </div>
    </div>
  )
}

export type { ResizableIframeProps }
