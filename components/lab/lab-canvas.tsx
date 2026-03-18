'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import useMeasure from 'react-use-measure'
import { useCanvasPan } from '@/hooks/use-canvas-pan'
import { ExperimentCard } from '@/components/cards/experiment-card'
import { Badge } from '@/components/ui/badge'
import FlaskIcon from '@/components/icons/flask'
import { LabViewToggle } from './lab-view-toggle'

const CELL_WIDTH = 380
const CELL_HEIGHT = 320
const GAP = 8
const COLUMNS = 3
const BUFFER = 1
const ARROW_PAN_STEP = 80

interface LabCanvasProps {
  experiments: Array<{
    slug: string
    title: string
    description?: string
    tags?: string[]
  }>
  onViewChange: () => void
}

interface VisibleCard {
  slug: string
  title: string
  description?: string
  tags?: string[]
  x: number
  y: number
  key: string
}

const CELL_STEP_X = CELL_WIDTH + GAP
const CELL_STEP_Y = CELL_HEIGHT + GAP

function wrapIndex(n: number, m: number) {
  return ((n % m) + m) % m
}

export function LabCanvas({ experiments, onViewChange }: LabCanvasProps) {
  const [measureRef, bounds] = useMeasure()
  const { offset, isDragging, containerRef, contentRef, handlers, resetView } =
    useCanvasPan()

  const hasInitialized = useRef(false)
  const [initialOffset, setInitialOffset] = useState({ x: 0, y: 0 })

  const blockRows = Math.ceil(experiments.length / COLUMNS)

  useEffect(() => {
    if (bounds.width > 0 && bounds.height > 0 && !hasInitialized.current) {
      hasInitialized.current = true
      const totalWidth = COLUMNS * CELL_STEP_X - GAP
      const totalHeight = blockRows * CELL_STEP_Y - GAP
      const centered = {
        x: (bounds.width - totalWidth) / 2,
        y: (bounds.height - totalHeight) / 2,
      }
      setInitialOffset(centered)
      resetView(centered)
    }
  }, [bounds.width, bounds.height, blockRows, resetView])

  const visibleCards = useMemo((): VisibleCard[] => {
    if (bounds.width === 0 || bounds.height === 0 || experiments.length === 0)
      return []

    const viewLeft = -offset.x - BUFFER * CELL_STEP_X
    const viewTop = -offset.y - BUFFER * CELL_STEP_Y
    const viewRight = -offset.x + bounds.width + BUFFER * CELL_STEP_X
    const viewBottom = -offset.y + bounds.height + BUFFER * CELL_STEP_Y

    const minCol = Math.floor(viewLeft / CELL_STEP_X)
    const maxCol = Math.floor(viewRight / CELL_STEP_X)
    const minRow = Math.floor(viewTop / CELL_STEP_Y)
    const maxRow = Math.floor(viewBottom / CELL_STEP_Y)

    const cards: VisibleCard[] = []

    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        const wrappedCol = wrapIndex(col, COLUMNS)
        const wrappedRow = wrapIndex(row, blockRows)
        const experimentIndex = wrappedRow * COLUMNS + wrappedCol

        if (experimentIndex >= experiments.length) continue

        const experiment = experiments[experimentIndex]
        cards.push({
          ...experiment,
          x: col * CELL_STEP_X,
          y: row * CELL_STEP_Y,
          key: `${col}-${row}`,
        })
      }
    }

    return cards
  }, [offset.x, offset.y, bounds.width, bounds.height, experiments, blockRows])

  const mergedRef = useCallback(
    (node: HTMLDivElement | null) => {
      measureRef(node)
      ;(containerRef as React.MutableRefObject<HTMLDivElement | null>).current =
        node
    },
    [measureRef, containerRef]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.target !== e.currentTarget) return

      const keyMap: Record<string, { x: number; y: number }> = {
        ArrowUp: { x: 0, y: ARROW_PAN_STEP },
        ArrowDown: { x: 0, y: -ARROW_PAN_STEP },
        ArrowLeft: { x: ARROW_PAN_STEP, y: 0 },
        ArrowRight: { x: -ARROW_PAN_STEP, y: 0 },
      }

      const delta = keyMap[e.key]
      if (delta) {
        e.preventDefault()
        resetView({
          x: offset.x + delta.x,
          y: offset.y + delta.y,
        })
      }
    },
    [offset, resetView]
  )

  if (experiments.length === 0) {
    return (
      <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-3 [grid-area:main]">
        <FlaskIcon className="size-8" />
        <p className="font-mono text-sm tracking-wide uppercase">
          No experiments yet
        </p>
      </div>
    )
  }

  return (
    <div
      ref={mergedRef}
      role="region"
      aria-label="Experiment canvas"
      tabIndex={0}
      className="focus-visible:ring-ring/50 relative h-[calc(100dvh-var(--mobile-header-height))] w-full overflow-hidden outline-none select-none [grid-area:main] focus-visible:ring-2 focus-visible:ring-inset md:h-screen"
      style={{
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none',
        overscrollBehavior: 'contain',
        backgroundImage:
          'radial-gradient(circle, var(--color-border) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
      onKeyDown={handleKeyDown}
      onDragStart={(e) => e.preventDefault()}
      {...handlers}
    >
      <div
        ref={contentRef}
        className="absolute"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px)`,
          willChange: 'transform',
        }}
      >
        {visibleCards.map((card) => (
          <div
            key={card.key}
            className="absolute"
            style={{
              left: card.x,
              top: card.y,
              width: CELL_WIDTH,
              height: CELL_HEIGHT,
            }}
          >
            <ExperimentCard
              slug={card.slug}
              title={card.title}
              description={card.description}
              tags={card.tags}
              className="h-full"
            />
          </div>
        ))}
      </div>

      <div className="from-background via-background/80 px-content-sides pointer-events-none absolute top-0 left-0 z-10 w-full bg-linear-to-b to-transparent py-6 pb-12 md:pt-8 lg:pr-16">
        <Badge variant="accent" className="mb-6 xl:mb-3">
          Lab
        </Badge>

        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-3xl leading-tight font-semibold">Experiments</h1>
          <LabViewToggle
            view="canvas"
            onToggle={onViewChange}
            className="top-4 right-4 lg:absolute"
          />
        </div>
      </div>

      <button
        type="button"
        aria-label="Reset canvas view"
        onClick={() => resetView(initialOffset)}
        className="bg-background/80 text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring/50 pointer-events-auto absolute right-4 bottom-4 z-10 flex size-10 items-center justify-center rounded-lg border backdrop-blur-sm transition-colors focus-visible:ring-2"
      >
        <svg
          aria-hidden="true"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <circle cx="8" cy="8" r="6" />
          <line x1="8" y1="4" x2="8" y2="6" />
          <line x1="8" y1="10" x2="8" y2="12" />
          <line x1="4" y1="8" x2="6" y2="8" />
          <line x1="10" y1="8" x2="12" y2="8" />
        </svg>
      </button>
    </div>
  )
}
