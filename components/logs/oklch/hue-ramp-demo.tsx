'use client'

import { useState } from 'react'

import { createHueGradient, toSafeCssColor } from './color-utils'
import { ColorDemoFrame, DemoSlider } from './demo-primitives'

const RAMP_STEPS = 8

export function HueRampDemo() {
  const [hue, setHue] = useState(255)
  const oklchRamp = Array.from({ length: RAMP_STEPS }, (_, index) => {
    const lightness = 0.28 + (index / (RAMP_STEPS - 1)) * 0.62
    return toSafeCssColor({ l: lightness, c: 0.16, h: hue })
  })
  const hslRamp = Array.from({ length: RAMP_STEPS }, (_, index) => {
    const lightness = 22 + (index / (RAMP_STEPS - 1)) * 66
    return `hsl(${hue} 75% ${lightness}%)`
  })

  return (
    <ColorDemoFrame>
      <div className="grid gap-5 p-4 min-[42rem]:p-6">
        <RampRow
          label="OKLCH"
          description={`OKLCH ramp at hue ${Math.round(hue)} degrees`}
          colors={oklchRamp}
        />
        <RampRow
          label="HSL"
          description={`HSL ramp at hue ${Math.round(hue)} degrees`}
          colors={hslRamp}
        />
      </div>
      <div className="border-border border-t p-4 min-[42rem]:p-6">
        <DemoSlider
          id="hue-ramp"
          label="Hue"
          value={hue}
          min={0}
          max={360}
          step={1}
          onValueChange={setHue}
          valueLabel={`${Math.round(hue)}°`}
          track={createHueGradient()}
        />
      </div>
    </ColorDemoFrame>
  )
}

function RampRow({
  label,
  description,
  colors,
}: {
  label: string
  description: string
  colors: string[]
}) {
  return (
    <div className="grid gap-2 min-[32rem]:grid-cols-[4rem_1fr] min-[32rem]:items-center min-[32rem]:gap-4">
      <span className="text-muted-foreground font-mono text-xs">{label}</span>
      <div
        role="img"
        aria-label={description}
        className="flex overflow-hidden border border-black/10 dark:border-white/10"
      >
        {colors.map((color, index) => (
          <span
            key={`${color}-${index}`}
            aria-hidden="true"
            className="h-14 min-w-0 flex-1 motion-safe:transition-[background-color] motion-safe:duration-150"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </div>
  )
}
