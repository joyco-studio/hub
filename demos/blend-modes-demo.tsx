'use client'

import * as React from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

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
  { name: 'hard-light', css: 'hard-light', formula: 'overlay, branch on b' },
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

const PRESET_KEYS = Object.keys(PRESETS) as PresetKey[]

function BlendModesDemo() {
  const [preset, setPreset] = React.useState<PresetKey>('gradient')

  const backgroundImage = `${PRESETS[preset].image}, ${BASE_GRADIENT}`

  return (
    <div
      className="flex w-full flex-col gap-8 p-6 sm:p-8"
      style={{ isolation: 'isolate' }}
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-muted-foreground font-mono text-xs uppercase tracking-wider">
          Top layer
        </span>
        <Tabs
          value={preset}
          onValueChange={(v) => setPreset(v as PresetKey)}
        >
          <TabsList>
            {PRESET_KEYS.map((key) => (
              <TabsTrigger key={key} value={key}>
                {PRESETS[key].label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-2 gap-x-5 gap-y-7 sm:grid-cols-3 lg:grid-cols-4">
        {MODES.map((mode) => (
          <figure
            key={mode.name}
            className="flex flex-col gap-3"
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
            <figcaption className="flex flex-col gap-1">
              <span className="font-mono text-xs uppercase tracking-wider">
                {mode.name}
              </span>
              <span className="text-muted-foreground font-mono text-[10px] leading-tight">
                {mode.formula}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>

      <p className="text-muted-foreground text-xs leading-relaxed">
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
