import {
  clampChroma,
  converter,
  formatHex,
  formatHsl,
  formatRgb,
  inGamut,
  parse,
  type Oklch,
} from 'culori'

export interface OklchColor {
  l: number
  c: number
  h: number
}

export type SurfaceTheme = Record<
  'background' | 'card' | 'border' | 'muted' | 'foreground',
  OklchColor
>

type ColorMode = 'light' | 'dark'
type SurfaceName = keyof SurfaceTheme

interface SurfaceThemeOptions {
  hue: number
  vividness: number
  mode?: ColorMode
}

type SurfaceThemeVariantOptions = Omit<SurfaceThemeOptions, 'mode'>

const toOklch = converter('oklch')
const isInRgbGamut = inGamut('rgb')

const SURFACE_CONFIG = {
  background: { lightness: { light: 0.97, dark: 0.17 }, budget: 0.35 },
  card: { lightness: { light: 0.93, dark: 0.21 }, budget: 0.5 },
  border: { lightness: { light: 0.83, dark: 0.32 }, budget: 0.7 },
  muted: { lightness: { light: 0.47, dark: 0.68 }, budget: 1 },
  foreground: { lightness: { light: 0.17, dark: 0.96 }, budget: 0.25 },
} satisfies Record<
  SurfaceName,
  { lightness: Record<ColorMode, number>; budget: number }
>

function toCuloriColor({ l, c, h }: OklchColor): Oklch {
  return { mode: 'oklch', l, c, h }
}

function roundChannel(value: number, precision: number): string {
  return Number(value.toFixed(precision)).toString()
}

export function parseColor(input: string): OklchColor | null {
  const parsed = parse(input.trim())
  if (!parsed) return null

  const converted = toOklch(parsed)
  if (!converted) return null

  return {
    l: converted.l,
    c: converted.c,
    h: converted.h ?? 0,
  }
}

export function formatOklch(color: OklchColor): string {
  return `oklch(${roundChannel(color.l, 3)} ${roundChannel(color.c, 3)} ${roundChannel(color.h, 1)})`
}

export function formatHexColor(color: OklchColor): string {
  return formatHex(toCuloriColor(color)) ?? '#000000'
}

export function formatRgbColor(color: OklchColor): string {
  return formatRgb(toCuloriColor(color)) ?? 'rgb(0, 0, 0)'
}

export function formatHslColor(color: OklchColor): string {
  return formatHsl(toCuloriColor(color)) ?? 'hsl(0, 0%, 0%)'
}

export function isColorInSrgb(color: OklchColor): boolean {
  return isInRgbGamut(toCuloriColor(color))
}

export function clampToSrgb(color: OklchColor): OklchColor {
  const clamped = clampChroma(toCuloriColor(color), 'oklch', 'rgb')

  return {
    l: clamped.l,
    c: clamped.c,
    h: clamped.h ?? color.h,
  }
}

export function getMaximumChroma(lightness: number, hue: number): number {
  return clampToSrgb({ l: lightness, c: 0.4, h: hue }).c
}

export function toSafeCssColor(color: OklchColor): string {
  return formatOklch(clampToSrgb(color))
}

export function getContrastingNeutral(color: OklchColor): OklchColor {
  return color.l > 0.6 ? { l: 0.18, c: 0, h: 0 } : { l: 0.98, c: 0, h: 0 }
}

export function createHueGradient(
  lightness = 0.65,
  chroma = 0.18,
  steps = 12
): string {
  const stops = Array.from({ length: steps + 1 }, (_, index) => {
    const progress = index / steps
    const hue = progress * 360
    return `${toSafeCssColor({ l: lightness, c: chroma, h: hue })} ${progress * 100}%`
  })

  return `linear-gradient(90deg in oklab, ${stops.join(', ')})`
}

export function createLightnessGradient(
  chroma: number,
  hue: number,
  steps = 8
): string {
  const stops = Array.from({ length: steps + 1 }, (_, index) => {
    const lightness = index / steps
    return `${toSafeCssColor({ l: lightness, c: chroma, h: hue })} ${(index / steps) * 100}%`
  })

  return `linear-gradient(90deg in oklab, ${stops.join(', ')})`
}

export function createChromaGradient(
  lightness: number,
  hue: number,
  steps = 8
): string {
  const maximumChroma = getMaximumChroma(lightness, hue)
  const stops = Array.from({ length: steps + 1 }, (_, index) => {
    const progress = index / steps
    const chroma = progress * maximumChroma
    return `${toSafeCssColor({ l: lightness, c: chroma, h: hue })} ${progress * 100}%`
  })

  return `linear-gradient(90deg in oklab, ${stops.join(', ')})`
}

export function buildSurfaceTheme({
  hue,
  vividness,
  mode = 'light',
}: SurfaceThemeOptions): SurfaceTheme {
  function createSurface(name: SurfaceName): OklchColor {
    const config = SURFACE_CONFIG[name]
    const lightness = config.lightness[mode]
    const chroma = vividness * config.budget * getMaximumChroma(lightness, hue)
    return clampToSrgb({ l: lightness, c: chroma, h: hue })
  }

  return {
    background: createSurface('background'),
    card: createSurface('card'),
    border: createSurface('border'),
    muted: createSurface('muted'),
    foreground: createSurface('foreground'),
  }
}

export function buildSurfaceThemeVariants(
  options: SurfaceThemeVariantOptions
): { light: SurfaceTheme; dark: SurfaceTheme } {
  return {
    light: buildSurfaceTheme({ ...options, mode: 'light' }),
    dark: buildSurfaceTheme({ ...options, mode: 'dark' }),
  }
}
