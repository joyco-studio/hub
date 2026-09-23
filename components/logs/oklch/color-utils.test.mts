import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildSurfaceTheme,
  buildSurfaceThemeVariants,
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
} from './color-utils.ts'

test('chooses a readable neutral foreground for preview extremes', () => {
  assert.deepEqual(getContrastingNeutral({ l: 1, c: 0.15, h: 255 }), {
    l: 0.18,
    c: 0,
    h: 0,
  })
  assert.deepEqual(getContrastingNeutral({ l: 0.2, c: 0.15, h: 255 }), {
    l: 0.98,
    c: 0,
    h: 0,
  })
})

test('parses CSS colors into stable OKLCH channels', () => {
  const parsed = parseColor('#1d84f5')

  assert.ok(parsed)
  assert.ok(Math.abs(parsed.l - 0.62) < 0.01)
  assert.ok(Math.abs(parsed.c - 0.19) < 0.01)
  assert.ok(Math.abs(parsed.h - 255) < 2)
})

test('formats one OKLCH color for the converter readouts', () => {
  const color = { l: 0.62, c: 0.19, h: 255 }

  assert.equal(formatOklch(color), 'oklch(0.62 0.19 255)')
  assert.match(formatHexColor(color), /^#[0-9a-f]{6}$/i)
  assert.match(formatRgbColor(color), /^rgb\(/)
  assert.match(formatHslColor(color), /^hsl\(/)
})

test('clamps colors to the sRGB boundary without moving lightness or hue', () => {
  const outOfGamut = { l: 0.62, c: 0.4, h: 255 }
  const clamped = clampToSrgb(outOfGamut)

  assert.equal(isColorInSrgb(outOfGamut), false)
  assert.equal(isColorInSrgb(clamped), true)
  assert.equal(clamped.l, outOfGamut.l)
  assert.equal(clamped.h, outOfGamut.h)
  assert.ok(clamped.c <= getMaximumChroma(outOfGamut.l, outOfGamut.h))
  assert.equal(toSafeCssColor(outOfGamut), formatOklch(clamped))
})

test('keeps every surface lightness fixed while hue changes', () => {
  const blue = buildSurfaceTheme({ hue: 255, vividness: 0.18 })
  const orange = buildSurfaceTheme({ hue: 45, vividness: 0.18 })
  const surfaceNames: Array<keyof typeof blue> = [
    'background',
    'card',
    'border',
    'muted',
    'foreground',
  ]

  for (const surface of surfaceNames) {
    assert.equal(blue[surface].l, orange[surface].l)
    assert.notEqual(blue[surface].h, orange[surface].h)
    assert.equal(isColorInSrgb(blue[surface]), true)
    assert.equal(isColorInSrgb(orange[surface]), true)
  }
})

test('builds deterministic light and dark variants from the same input', () => {
  const variants = buildSurfaceThemeVariants({ hue: 255, vividness: 0.18 })

  assert.equal(variants.light.background.l, 0.97)
  assert.equal(variants.light.foreground.l, 0.17)
  assert.equal(variants.dark.background.l, 0.17)
  assert.equal(variants.dark.foreground.l, 0.96)
  assert.equal(variants.light.background.h, variants.dark.background.h)
})

test('builds left-to-right gradients from display-safe OKLCH stops', () => {
  const gradients = [
    createHueGradient(),
    createLightnessGradient(0.16, 255),
    createChromaGradient(0.62, 255),
  ]

  for (const gradient of gradients) {
    assert.match(gradient, /^linear-gradient\(90deg in oklab, /)
    assert.doesNotMatch(gradient, /NaN|undefined/)
  }
})
