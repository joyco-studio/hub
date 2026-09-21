'use client'

import { useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

import {
  clampToSrgb,
  createChromaGradient,
  createHueGradient,
  createLightnessGradient,
  formatHexColor,
  formatHslColor,
  formatOklch,
  formatRgbColor,
  getContrastingNeutral,
  getMaximumChroma,
  isColorInSrgb,
  parseColor,
  toSafeCssColor,
  type OklchColor,
} from './color-utils'
import { ColorDemoFrame, ColorValue, DemoSlider } from './demo-primitives'

const INITIAL_COLOR = 'oklch(0.62 0.19 255)'
const DEFAULT_COLOR: OklchColor = { l: 0.62, c: 0.19, h: 255 }

export function ColorConverter() {
  const [color, setColor] = useState<OklchColor>(
    () => parseColor(INITIAL_COLOR) ?? DEFAULT_COLOR
  )
  const [inputValue, setInputValue] = useState(INITIAL_COLOR)
  const [errorMessage, setErrorMessage] = useState('')

  const maximumChroma = useMemo(
    () => getMaximumChroma(color.l, color.h),
    [color.l, color.h]
  )
  const isInGamut = useMemo(() => isColorInSrgb(color), [color])
  const previewColor = useMemo(() => toSafeCssColor(color), [color])
  const previewForeground = useMemo(() => getContrastingNeutral(color), [color])
  const usesDarkPreviewForeground = previewForeground.l < 0.5

  function updateColor(patch: Partial<OklchColor>) {
    const nextColor = { ...color, ...patch }
    setColor(nextColor)
    setInputValue(formatOklch(nextColor))
    setErrorMessage('')
  }

  function updateInput(value: string) {
    setInputValue(value)
    const parsed = parseColor(value)

    if (!parsed) {
      setErrorMessage('Use hex, rgb(), hsl(), or oklch().')
      return
    }

    setColor(parsed)
    setErrorMessage('')
  }

  return (
    <ColorDemoFrame>
      <div
        data-slot="color-preview"
        className="flex min-h-32 items-end p-4 motion-safe:transition-[background-color] motion-safe:duration-150"
        style={{
          backgroundColor: previewColor,
          color: formatOklch(previewForeground),
        }}
      >
        <div className="w-full">
          <label
            htmlFor="oklch-color-input"
            className="mb-2 block text-sm font-medium"
          >
            CSS color
          </label>
          <Input
            id="oklch-color-input"
            value={inputValue}
            onChange={(event) => updateInput(event.target.value)}
            spellCheck={false}
            aria-invalid={errorMessage ? true : undefined}
            aria-describedby={
              errorMessage ? 'oklch-color-input-error' : undefined
            }
            className={cn(
              'font-mono text-base shadow-none backdrop-blur-sm md:text-sm',
              usesDarkPreviewForeground
                ? 'border-black/25 bg-white/65 text-black placeholder:text-black/55 focus-visible:border-black/45 focus-visible:ring-black/20 dark:bg-white/65'
                : 'border-white/30 bg-black/45 text-white placeholder:text-white/60 focus-visible:border-white/70 focus-visible:ring-white/30 dark:bg-black/45'
            )}
            placeholder="#7c3aed or oklch(0.62 0.2 285)"
          />
          {errorMessage ? (
            <p
              id="oklch-color-input-error"
              className="mt-2 text-sm font-medium"
            >
              {errorMessage}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 p-4 min-[42rem]:grid-cols-2 min-[42rem]:p-6">
        <div className="grid content-start gap-5">
          <DemoSlider
            id="oklch-lightness"
            label="Lightness"
            value={color.l}
            min={0}
            max={1}
            step={0.001}
            onValueChange={(lightness) => updateColor({ l: lightness })}
            valueLabel={color.l.toFixed(3)}
            track={createLightnessGradient(color.c, color.h)}
          />
          <DemoSlider
            id="oklch-chroma"
            label="Chroma"
            value={color.c}
            min={0}
            max={0.4}
            step={0.001}
            onValueChange={(chroma) => updateColor({ c: chroma })}
            valueLabel={color.c.toFixed(3)}
            track={createChromaGradient(color.l, color.h)}
          />
          <DemoSlider
            id="oklch-hue"
            label="Hue"
            value={color.h}
            min={0}
            max={360}
            step={0.1}
            onValueChange={(hue) => updateColor({ h: hue })}
            valueLabel={`${color.h.toFixed(1)}°`}
            track={createHueGradient()}
          />
        </div>

        <div className="border-border -mx-1 grid content-center border-t pt-4 min-[42rem]:mx-0 min-[42rem]:border-s min-[42rem]:border-t-0 min-[42rem]:ps-3">
          <ColorValue label="oklch" value={formatOklch(color)} />
          <ColorValue label="hex" value={formatHexColor(color)} />
          <ColorValue label="rgb" value={formatRgbColor(color)} />
          <ColorValue label="hsl" value={formatHslColor(color)} />
        </div>
      </div>

      <div className="border-border flex flex-wrap items-center justify-between gap-3 border-t py-3 pr-3 pl-4 min-[42rem]:pl-6">
        <span className="text-muted-foreground text-sm">
          sRGB ceiling:{' '}
          <span className="text-foreground font-mono tabular-nums">
            {maximumChroma.toFixed(3)}
          </span>
        </span>
        {isInGamut ? (
          <Badge variant="muted" className="h-8 w-36 justify-center">
            Inside sRGB
          </Badge>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => updateColor(clampToSrgb(color))}
            className="w-36 active:scale-[0.96] motion-safe:transition-[scale,background-color,color]"
          >
            Clamp to sRGB
          </Button>
        )}
      </div>
    </ColorDemoFrame>
  )
}
