import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const componentSource = await readFile(
  new URL('./runtime-theme-demo.tsx', import.meta.url),
  'utf8'
)

test('does not render an in-page navigation action', () => {
  assert.doesNotMatch(componentSource, /Read gamut notes/)
  assert.doesNotMatch(
    componentSource,
    /href=["']#gamut-mapping-is-part-of-the-algorithm["']/
  )
})
