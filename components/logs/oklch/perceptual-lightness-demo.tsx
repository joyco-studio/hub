'use client'

import { useState } from 'react'

import { createLightnessGradient, formatOklch } from './color-utils'
import { ColorDemoFrame, DemoSlider } from './demo-primitives'

const HUES = [30, 150, 250, 320]

export function PerceptualLightnessDemo() {
  const [lightness, setLightness] = useState(0.62)
  const hslLightness = Math.round(lightness * 100)

  return (
    <ColorDemoFrame>
      <div className="grid gap-5 p-4 min-[42rem]:p-6">
        <SwatchRow
          label="OKLCH"
          description={`Four hues at lightness ${lightness.toFixed(2)}`}
          colors={HUES.map((hue) =>
            formatOklch({ l: lightness, c: 0.15, h: hue })
          )}
        />
        <SwatchRow
          label="HSL"
          description={`Four hues at lightness ${hslLightness}%`}
          colors={HUES.map((hue) => `hsl(${hue} 70% ${hslLightness}%)`)}
        />
      </div>
      <div className="border-border border-t p-4 min-[42rem]:p-6">
        <DemoSlider
          id="perceptual-lightness"
          label="Lightness"
          value={lightness}
          min={0.1}
          max={1}
          step={0.01}
          onValueChange={setLightness}
          valueLabel={lightness.toFixed(2)}
          track={createLightnessGradient(0, 0)}
        />
      </div>
    </ColorDemoFrame>
  )
}

function SwatchRow({
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
        className="grid grid-cols-4 gap-2"
      >
        {colors.map((color, index) => (
          <span
            key={`${color}-${index}`}
            aria-hidden="true"
            className="h-14 border border-black/10 motion-safe:transition-[background-color] motion-safe:duration-150 dark:border-white/10"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </div>
  )
}
