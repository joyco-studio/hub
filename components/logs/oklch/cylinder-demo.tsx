'use client'

import { useState } from 'react'

import { cn } from '@/lib/utils'

import { createGamutRingGradient, createLightnessGradient } from './color-utils'
import { ColorDemoFrame, DemoSlider } from './demo-primitives'

const SLICE_COUNT = 7
const DARKEST_SLICE = 0.17
const SLICE_STEP = 0.13
const SLICE_WIDTH = 230
const SLICE_GAP = 38
const SLICE_FLATTEN = 0.36

// Rendered back to front: the darkest slice sits at the bottom of the stack and
// paints last, so lower slices overlap the ones behind them.
const SLICES = Array.from(
  { length: SLICE_COUNT },
  (_, index) => DARKEST_SLICE + index * SLICE_STEP
)
const LIGHTEST_SLICE = SLICES[SLICE_COUNT - 1]
const STACK_HEIGHT = (SLICE_COUNT - 1) * SLICE_GAP + SLICE_WIDTH * SLICE_FLATTEN
// scaleY shrinks each slice around its own center, so the box has to be pulled up
// by the collapsed half to make the rendered ellipse land on its gap position.
const SLICE_OFFSET = (SLICE_WIDTH * (1 - SLICE_FLATTEN)) / 2

export function CylinderDemo() {
  const [lightness, setLightness] = useState(SLICES[3])
  const selectedIndex = Math.round((lightness - DARKEST_SLICE) / SLICE_STEP)

  return (
    <ColorDemoFrame>
      <div className="grid justify-items-center gap-5 p-4 min-[42rem]:p-6">
        <div
          role="img"
          aria-label={`Seven hue wheels stacked into a cylinder, one slice per lightness step. The slice at lightness ${lightness.toFixed(2)} is highlighted.`}
          className="relative w-full max-w-[18rem]"
          style={{ height: STACK_HEIGHT }}
        >
          <span
            aria-hidden="true"
            className="bg-border absolute top-0 left-1/2 w-px"
            style={{ height: STACK_HEIGHT }}
          />

          {SLICES.map((sliceLightness, index) => {
            const isSelected = index === selectedIndex

            return (
              <div
                key={sliceLightness}
                aria-hidden="true"
                // Unselected slices need more presence on the light card: near the
                // top of the stack they are nearly white and wash out at the
                // opacity that reads fine against the dark surface.
                className={cn(
                  'absolute left-1/2 rounded-full',
                  isSelected
                    ? 'opacity-100'
                    : 'terminal:opacity-40 opacity-65 dark:opacity-40'
                )}
                style={{
                  width: SLICE_WIDTH,
                  height: SLICE_WIDTH,
                  top: (SLICE_COUNT - 1 - index) * SLICE_GAP - SLICE_OFFSET,
                  translate: '-50% 0',
                  scale: `1 ${SLICE_FLATTEN}`,
                  background: createGamutRingGradient(sliceLightness),
                  outline: isSelected
                    ? '2px solid var(--foreground)'
                    : undefined,
                  outlineOffset: 3,
                }}
              >
                <span
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `radial-gradient(circle at center, oklch(${sliceLightness} 0 0) 0%, oklch(${sliceLightness} 0 0) 12%, transparent 74%)`,
                  }}
                />
              </div>
            )
          })}
        </div>

        <dl className="text-muted-foreground grid gap-1 text-sm">
          <div className="flex items-baseline gap-3">
            <dt className="text-foreground w-4 font-mono text-xs">L</dt>
            <dd>
              up the axis, from{' '}
              <span className="tabular-nums">{DARKEST_SLICE.toFixed(2)}</span>{' '}
              at the bottom to{' '}
              <span className="tabular-nums">{LIGHTEST_SLICE.toFixed(2)}</span>{' '}
              at the top
            </dd>
          </div>
          <div className="flex items-baseline gap-3">
            <dt className="text-foreground w-4 font-mono text-xs">C</dt>
            <dd>outward, from the gray center to the rim</dd>
          </div>
          <div className="flex items-baseline gap-3">
            <dt className="text-foreground w-4 font-mono text-xs">H</dt>
            <dd>around each slice</dd>
          </div>
        </dl>
      </div>

      <div className="border-border border-t p-4 min-[42rem]:p-6">
        <DemoSlider
          id="oklch-cylinder-slice"
          label="Slice"
          value={lightness}
          min={DARKEST_SLICE}
          max={LIGHTEST_SLICE}
          step={SLICE_STEP}
          onValueChange={setLightness}
          valueLabel={`L ${lightness.toFixed(2)}`}
          track={createLightnessGradient(0, 0)}
        />
      </div>
    </ColorDemoFrame>
  )
}
