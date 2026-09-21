'use client'

import { useMemo, useState, type CSSProperties } from 'react'
import { LockKeyhole } from 'lucide-react'

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import {
  buildSurfaceThemeVariants,
  createChromaGradient,
  createHueGradient,
  formatOklch,
  getMaximumChroma,
  toSafeCssColor,
} from './color-utils'
import { ColorDemoFrame, DemoSlider } from './demo-primitives'

interface ThemeDemoStyle extends CSSProperties {
  '--demo-background-light': string
  '--demo-background-dark': string
  '--demo-card-light': string
  '--demo-card-dark': string
  '--demo-border-light': string
  '--demo-border-dark': string
  '--demo-muted-light': string
  '--demo-muted-dark': string
  '--demo-foreground-light': string
  '--demo-foreground-dark': string
  '--demo-accent': string
}

export function RuntimeThemeDemo() {
  const [hue, setHue] = useState(255)
  const [vividness, setVividness] = useState(0.18)
  const surfaces = useMemo(
    () => buildSurfaceThemeVariants({ hue, vividness }),
    [hue, vividness]
  )
  const accent = useMemo(
    () => ({ l: 0.62, c: getMaximumChroma(0.62, hue) * 0.72, h: hue }),
    [hue]
  )
  const stageStyle: ThemeDemoStyle = {
    '--demo-background-light': toSafeCssColor(surfaces.light.background),
    '--demo-background-dark': toSafeCssColor(surfaces.dark.background),
    '--demo-card-light': toSafeCssColor(surfaces.light.card),
    '--demo-card-dark': toSafeCssColor(surfaces.dark.card),
    '--demo-border-light': toSafeCssColor(surfaces.light.border),
    '--demo-border-dark': toSafeCssColor(surfaces.dark.border),
    '--demo-muted-light': toSafeCssColor(surfaces.light.muted),
    '--demo-muted-dark': toSafeCssColor(surfaces.dark.muted),
    '--demo-foreground-light': toSafeCssColor(surfaces.light.foreground),
    '--demo-foreground-dark': toSafeCssColor(surfaces.dark.foreground),
    '--demo-accent': toSafeCssColor(accent),
  }

  return (
    <ColorDemoFrame>
      <div
        data-slot="theme-stage"
        className="terminal:bg-(--demo-background-dark) bg-(--demo-background-light) p-4 motion-safe:transition-[background-color] motion-safe:duration-150 min-[42rem]:p-6 dark:bg-(--demo-background-dark)"
        style={stageStyle}
      >
        <Card className="terminal:border-(--demo-border-dark) terminal:bg-(--demo-card-dark) terminal:text-(--demo-foreground-dark) gap-5 border-(--demo-border-light) bg-(--demo-card-light) py-5 text-(--demo-foreground-light) motion-safe:transition-[background-color,border-color,color] motion-safe:duration-150 dark:border-(--demo-border-dark) dark:bg-(--demo-card-dark) dark:text-(--demo-foreground-dark)">
          <CardHeader className="gap-2 px-5">
            <CardTitle>One input, stable hierarchy</CardTitle>
            <CardDescription className="terminal:text-(--demo-muted-dark) leading-relaxed text-(--demo-muted-light) motion-safe:transition-colors motion-safe:duration-150 dark:text-(--demo-muted-dark)">
              Hue moves through the system. Each surface keeps the lightness it
              needs for its role.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="border-border grid gap-6 border-t p-4 min-[42rem]:grid-cols-2 min-[42rem]:p-6">
        <div className="grid content-start gap-5">
          <DemoSlider
            id="runtime-theme-hue"
            label="Hue"
            value={hue}
            min={0}
            max={360}
            step={1}
            onValueChange={setHue}
            valueLabel={`${Math.round(hue)}°`}
            track={createHueGradient()}
          />
          <DemoSlider
            id="runtime-theme-vividness"
            label="Surface tint"
            value={vividness}
            min={0}
            max={0.4}
            step={0.005}
            onValueChange={setVividness}
            valueLabel={vividness.toFixed(3)}
            track={createChromaGradient(0.62, hue)}
          />
        </div>

        <div className="border-border grid content-center gap-2 border-t pt-5 min-[42rem]:border-s min-[42rem]:border-t-0 min-[42rem]:ps-6 min-[42rem]:pt-0">
          <p className="text-muted-foreground flex items-center gap-2 text-sm">
            <LockKeyhole
              aria-hidden="true"
              className="size-4"
              strokeWidth={1.5}
            />
            Lightness is locked per role
          </p>
          {[
            {
              name: 'background',
              light: surfaces.light.background,
              dark: surfaces.dark.background,
            },
            {
              name: 'card',
              light: surfaces.light.card,
              dark: surfaces.dark.card,
            },
            {
              name: 'foreground',
              light: surfaces.light.foreground,
              dark: surfaces.dark.foreground,
            },
            { name: 'accent', light: accent, dark: accent },
          ].map(({ name, light, dark }) => (
            <code
              key={name}
              className="text-muted-foreground bg-transparent p-0 font-mono text-xs [overflow-wrap:anywhere]"
            >
              --{name}:{' '}
              <span className="terminal:hidden dark:hidden">
                {formatOklch(light)}
              </span>
              <span className="terminal:inline hidden dark:inline">
                {formatOklch(dark)}
              </span>
            </code>
          ))}
        </div>
      </div>
    </ColorDemoFrame>
  )
}
