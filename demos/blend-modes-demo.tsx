'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'

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
  {
    name: 'hard-light',
    css: 'hard-light',
    formula: 'overlay, branch on b',
  },
  { name: 'soft-light', css: 'soft-light', formula: 'gentle overlay (W3C)' },
  { name: 'difference', css: 'difference', formula: '|a − b|' },
  { name: 'exclusion', css: 'exclusion', formula: 'a + b − 2ab' },
]

type PresetKey = 'solid' | 'bars' | 'gradient'

const BASE_GRADIENT = 'linear-gradient(90deg, #000 0%, #fff 100%)'

const PRESETS: Record<PresetKey, { label: string; image: string }> = {
  solid: {
    label: 'Solid',
    image: 'linear-gradient(0deg, #ff2d8a, #ff2d8a)',
  },
  bars: {
    label: 'RGB bars',
    image:
      'linear-gradient(180deg, #ff2d2d 0%, #ff2d2d 33.33%, #2dd96b 33.34%, #2dd96b 66.66%, #2d7dff 66.67%, #2d7dff 100%)',
  },
  gradient: {
    label: 'Gradient',
    image: 'linear-gradient(180deg, #00e5ff 0%, #ffe600 50%, #ff2d8a 100%)',
  },
}

function BlendModesDemo() {
  const [preset, setPreset] = React.useState<PresetKey>('gradient')

  const backgroundImage = `${PRESETS[preset].image}, ${BASE_GRADIENT}`

  return (
    <div
      className="flex w-full flex-col gap-6 p-6"
      style={{ isolation: 'isolate' }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground mr-2 font-mono text-xs uppercase tracking-wider">
          Top layer
        </span>
        {(Object.keys(PRESETS) as PresetKey[]).map((key) => (
          <Button
            key={key}
            type="button"
            variant={preset === key ? 'default' : 'muted'}
            size="sm"
            onClick={() => setPreset(key)}
          >
            {PRESETS[key].label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-3 lg:grid-cols-4 border-border border">
        {MODES.map((mode) => (
          <figure
            key={mode.name}
            className="bg-background flex flex-col"
            style={{ contain: 'paint' }}
          >
            <div
              aria-hidden
              className="aspect-square w-full"
              style={{
                backgroundImage,
                backgroundBlendMode: mode.css,
              }}
            />
            <figcaption className="border-border flex flex-col gap-0.5 border-t px-3 py-2">
              <span className="font-mono text-xs uppercase tracking-wider">
                {mode.name}
              </span>
              <span className="text-muted-foreground font-mono text-[10px]">
                {mode.formula}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>

      <p className="text-muted-foreground text-xs">
        Base (<code className="font-mono">a</code>) is a horizontal black→white
        gradient — each cell reads left-to-right as the formula evaluated at{' '}
        <code className="font-mono">a = 0</code> through{' '}
        <code className="font-mono">a = 1</code>. Top layer (
        <code className="font-mono">b</code>) is the toggle above.
      </p>
    </div>
  )
}

export default BlendModesDemo
