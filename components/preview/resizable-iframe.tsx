'use client'

import * as React from 'react'
import { useState, useRef, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { GripVertical } from 'lucide-react'
import PhoneIcon from '@/components/icons/phone'
import TabletIcon from '@/components/icons/tablet'
import { PatternOverlay } from './pattern-overlay'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'

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
      <div className="border-background z-10 flex justify-between gap-1 border-b-4">
        {showIndicator && (
          <div className="bg-muted text-foreground z-10 flex items-center gap-2 py-2 pr-6 pl-4">
            <span className="text-foreground font-mono text-sm font-medium">
              {Math.round(width)}px
            </span>
            <Badge variant="accent" className="h-4 font-mono text-[10px]">
              {getBreakpointLabel(width)}
            </Badge>
          </div>
        )}
        <div className="bg-muted/50 flex-1 self-stretch" />
        <div className="ml-auto flex items-center gap-1">
          {[
            {
              device: 'mobile',
              label: 'Mobile View',
              icon: PhoneIcon,
            },
            {
              device: 'tablet',
              label: 'Tablet View',
              icon: TabletIcon,
            },
          ].map(({ device, label, icon: Icon }) => (
            <Tooltip key={device}>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant={selectedDevice === device ? 'accent' : 'muted'}
                  onClick={() => handleDeviceSelect(device as DevicePreset)}
                  aria-label={`${label}`}
                >
                  <Icon className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{label}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
      <div className={cn('relative flex flex-col', className)}>
        <PatternOverlay className="bg-preview pointer-events-none absolute inset-0" />

        <div
          ref={containerRef}
          style={
            {
              '--handle-width': 'calc(var(--spacing) * 5)',
            } as React.CSSProperties
          }
          className="relative flex w-full justify-center overflow-hidden"
        >
          {/* Resizable content area - centered */}
          <div
            className="relative z-10 border-l"
            style={{
              width: `calc(${width}px + var(--handle-width) + 1px)`,
              maxWidth: '100%',
            }}
          >
            <iframe
              ref={iframeRef}
              src={src}
              srcDoc={srcDoc}
              className={cn('border-0', iframeClassName)}
              style={{
                width: `calc(100% - var(--handle-width))`, // Account for resize handle width
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
                'absolute top-0 right-0 flex h-full w-(--handle-width) cursor-ew-resize items-center justify-center',
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
