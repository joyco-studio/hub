import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const articleSource = await readFile(
  new URL(
    '../../../content/logs/19-when-color-becomes-runtime-data.mdx',
    import.meta.url
  ),
  'utf8'
)

const gamutDiagramSource = await readFile(
  new URL('./srgb-gamut-diagram.tsx', import.meta.url),
  'utf8'
)

test('introduces the sRGB gamut before comparing perceptual lightness', () => {
  const gamutDiagramPosition = articleSource.indexOf('<SrgbGamutDiagram />')
  const lightnessDemoPosition = articleSource.indexOf(
    '<PerceptualLightnessDemo />'
  )

  assert.match(articleSource, /A gamut is the range of colors/)
  assert.ok(gamutDiagramPosition >= 0)
  assert.ok(gamutDiagramPosition < lightnessDemoPosition)
})

test('explains gamut and palette ramps without compressed spatial language', () => {
  assert.doesNotMatch(articleSource, /fixed-chroma samples can leave/)
  assert.doesNotMatch(articleSource, /Palettes also fail vertically/)
})

test('renders the gamut as a square spectrum with only the sRGB boundary', () => {
  assert.match(gamutDiagramSource, /viewBox="0 0 600 600"/)
  assert.doesNotMatch(gamutDiagramSource, /LegendItem/)
  assert.doesNotMatch(gamutDiagramSource, /rgba\(0, 0, 0, 0\.54\)/)
})
