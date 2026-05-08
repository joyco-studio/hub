'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

type Mode = {
  name: string
  css: React.CSSProperties['mixBlendMode']
  formula: string
}

const MODES: Mode[] = [
  { name: 'normal', css: 'normal', formula: 'b' },
  { name: 'multiply', css: 'multiply', formula: 'a · b' },
  { name: 'screen', css: 'screen', formula: '1 − (1−a)(1−b)' },
  { name: 'overlay', css: 'overlay', formula: 'multiply / screen on a' },
  { name: 'darken', css: 'darken', formula: 'min(a, b)' },
  { name: 'lighten', css: 'lighten', formula: 'max(a, b)' },
  { name: 'color-dodge', css: 'color-dodge', formula: 'a / (1 − b)' },
  { name: 'color-burn', css: 'color-burn', formula: '1 − (1−a) / b' },
  { name: 'hard-light', css: 'hard-light', formula: 'overlay with a, b swapped' },
  { name: 'soft-light', css: 'soft-light', formula: 'gentle overlay (W3C)' },
  { name: 'difference', css: 'difference', formula: '|a − b|' },
  { name: 'exclusion', css: 'exclusion', formula: 'a + b − 2ab' },
]

type PresetKey = 'solid' | 'bars' | 'gradient'

const PRESETS: Record<
  PresetKey,
  { label: string; render: () => React.ReactNode }
> = {
  solid: {
    label: 'Solid',
    render: () => (
      <div
        className="absolute inset-[18%] rounded-full"
        style={{ background: '#ff2d8a' }}
      />
    ),
  },
  bars: {
    label: 'RGB bars',
    render: () => (
      <div className="absolute inset-0 grid grid-cols-3">
        <div style={{ background: '#ff2d2d' }} />
        <div style={{ background: '#2dd96b' }} />
        <div style={{ background: '#2d7dff' }} />
      </div>
    ),
  },
  gradient: {
    label: 'Gradient',
    render: () => (
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, #00e5ff 0%, #ffe600 50%, #ff2d8a 100%)',
        }}
      />
    ),
  },
}

function BlendModesDemo() {
  const [preset, setPreset] = React.useState<PresetKey>('gradient')

  return (
    <div className="flex w-full flex-col gap-4 p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground mr-1 text-xs tracking-wider uppercase">
          Top layer
        </span>
        {(Object.keys(PRESETS) as PresetKey[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setPreset(key)}
            className={cn(
              'rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
              preset === key
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            {PRESETS[key].label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {MODES.map((mode) => (
          <figure
            key={mode.name}
            className="border-border bg-background flex flex-col overflow-hidden rounded-md border"
          >
            <div className="relative aspect-square">
              {/* base layer: horizontal grayscale ramp (a = 0 → 1) */}
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(90deg, #000 0%, #fff 100%)',
                }}
              />
              {/* blend layer */}
              <div
                className="absolute inset-0"
                style={{ mixBlendMode: mode.css }}
              >
                {PRESETS[preset].render()}
              </div>
            </div>
            <figcaption className="border-border flex flex-col gap-0.5 border-t px-3 py-2">
              <span className="font-mono text-xs">{mode.name}</span>
              <span className="text-muted-foreground font-mono text-[10px]">
                {mode.formula}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>

      <p className="text-muted-foreground text-xs">
        Base (<code className="font-mono">a</code>) is a horizontal black→white
        gradient, so each row reads left-to-right as the formula evaluated at{' '}
        <code className="font-mono">a = 0</code> through{' '}
        <code className="font-mono">a = 1</code>. Top layer is{' '}
        <code className="font-mono">b</code>.
      </p>
    </div>
  )
}

export default BlendModesDemo
