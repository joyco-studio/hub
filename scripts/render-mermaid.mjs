/**
 * Pre-renders Mermaid diagrams from MDX files into static SVGs.
 *
 * Usage: node scripts/render-mermaid.mjs
 *
 * Scans all MDX files in content/ for ```mermaid code blocks, renders both
 * light and dark theme SVGs using Playwright/Chromium, and writes them to
 * generated/mermaid/{hash}-{theme}.svg.
 *
 * These SVGs are committed to the repo so the production build does NOT
 * need Playwright — the rehype plugin reads the pre-rendered files directly.
 */

import { createHash } from 'node:crypto'
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { createMermaidRenderer } from 'mermaid-isomorphic'

const CONTENT_DIR = 'content'
const OUTPUT_DIR = 'generated/mermaid'
const MERMAID_BLOCK_RE = /```mermaid\n([\s\S]*?)```/g

/** Short content hash used as the SVG filename. */
function hashDiagram(source) {
  return createHash('sha256').update(source.trim()).digest('hex').slice(0, 12)
}

/** Recursively collect all .mdx files under a directory. */
async function collectMdxFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await collectMdxFiles(full)))
    } else if (entry.name.endsWith('.mdx')) {
      files.push(full)
    }
  }
  return files
}

/** Extract mermaid diagram sources from an MDX file. */
async function extractDiagrams(filePath) {
  const content = await readFile(filePath, 'utf-8')
  const diagrams = []
  let match
  while ((match = MERMAID_BLOCK_RE.exec(content)) !== null) {
    diagrams.push(match[1])
  }
  return diagrams
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true })

  // 1. Collect all mermaid diagrams across the codebase
  const mdxFiles = await collectMdxFiles(CONTENT_DIR)
  const allDiagrams = new Map() // hash → source

  for (const file of mdxFiles) {
    const diagrams = await extractDiagrams(file)
    for (const source of diagrams) {
      const hash = hashDiagram(source)
      if (!allDiagrams.has(hash)) {
        allDiagrams.set(hash, { source, file: relative('.', file) })
      }
    }
  }

  if (allDiagrams.size === 0) {
    console.log('No mermaid diagrams found.')
    return
  }

  console.log(`Found ${allDiagrams.size} unique mermaid diagram(s).`)

  // 2. Render with mermaid-isomorphic (uses Playwright)
  const renderer = createMermaidRenderer()
  const entries = [...allDiagrams.entries()]
  const sources = entries.map(([, { source }]) => source)

  const [lightResults, darkResults] = await Promise.all([
    renderer(sources, {
      mermaidConfig: { theme: 'default' },
      prefix: 'mermaid-light',
    }),
    renderer(sources, {
      mermaidConfig: { theme: 'dark' },
      prefix: 'mermaid-dark',
    }),
  ])

  // 3. Write SVG files
  let written = 0
  for (let i = 0; i < entries.length; i++) {
    const [hash, { file }] = entries[i]
    const light = lightResults[i]
    const dark = darkResults[i]

    if (light.status !== 'fulfilled') {
      console.error(`✗ Failed to render light SVG for ${hash} (${file}):`, light.reason?.message)
      continue
    }
    if (dark.status !== 'fulfilled') {
      console.error(`✗ Failed to render dark SVG for ${hash} (${file}):`, dark.reason?.message)
      continue
    }

    await writeFile(join(OUTPUT_DIR, `${hash}-light.svg`), light.value.svg)
    await writeFile(join(OUTPUT_DIR, `${hash}-dark.svg`), dark.value.svg)
    written++
    console.log(`  ✓ ${hash} (${file})`)
  }

  console.log(`\nRendered ${written}/${entries.length} diagram(s) → ${OUTPUT_DIR}/`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
