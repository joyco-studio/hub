#!/usr/bin/env node
// Enforces the numbering convention for log entries in content/logs/.
//
// Every log entry must:
//   1. Have a filename that starts with a two-plus-digit number prefix: `NN-slug.mdx`
//   2. Carry that same number at the start of its `title` frontmatter: `title: NN - …`
//   3. Own a unique number — no two entries may share a prefix.
//
// `index.mdx` is the section landing page, not an entry, so it is exempt.
// Run locally with `node scripts/check-log-numbers.mjs`; CI runs the same command.

import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const LOGS_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'content',
  'logs'
)

const IGNORED_FILES = new Set(['index.mdx'])
const FILENAME_PREFIX = /^(\d{2,})-/
const FRONTMATTER = /^---\r?\n(.*?)\r?\n---/s
const TITLE_NUMBER = /^title:\s*['"]?(\d{2,})\s*-\s/m

/**
 * Pull the number out of the `title:` line, but only from the leading `---`
 * frontmatter block — never from body prose or a code fence that happens to
 * contain a `title:` line.
 */
function readTitleNumber(contents) {
  const frontmatter = contents.match(FRONTMATTER)
  if (!frontmatter) return null
  const match = frontmatter[1].match(TITLE_NUMBER)
  return match ? match[1] : null
}

const entries = readdirSync(LOGS_DIR, { withFileTypes: true })
  .filter((entry) => entry.isFile() && !IGNORED_FILES.has(entry.name))
  .map((entry) => entry.name)

const errors = []
const numberToFiles = new Map()

for (const name of entries) {
  const filenameMatch = name.match(FILENAME_PREFIX)

  if (!filenameMatch) {
    errors.push(
      `${name}: filename must start with a number prefix, e.g. "18-${name}".`
    )
    continue
  }

  const fileNumber = filenameMatch[1]

  if (!numberToFiles.has(fileNumber)) numberToFiles.set(fileNumber, [])
  numberToFiles.get(fileNumber).push(name)

  if (!name.endsWith('.mdx')) {
    errors.push(
      `${name}: log entries must use the .mdx extension (got "${name.replace(/^.*(\.[^.]+)$/, '$1')}").`
    )
    continue
  }

  const contents = readFileSync(join(LOGS_DIR, name), 'utf8')
  const titleNumber = readTitleNumber(contents)

  if (titleNumber === null) {
    errors.push(
      `${name}: title frontmatter must start with its number, e.g. "title: ${fileNumber} - …".`
    )
  } else if (titleNumber !== fileNumber) {
    errors.push(
      `${name}: title number (${titleNumber}) does not match filename number (${fileNumber}).`
    )
  }
}

for (const [number, files] of numberToFiles) {
  if (files.length > 1) {
    errors.push(
      `Duplicate log number ${number} used by: ${files.join(', ')}.`
    )
  }
}

if (errors.length > 0) {
  console.error('✗ Log numbering check failed:\n')
  for (const error of errors) console.error(`  • ${error}`)
  console.error(
    `\n${errors.length} problem(s) found in content/logs/. Fix them before merging.`
  )
  process.exit(1)
}

console.log(`✓ All ${entries.length} log entries are correctly numbered.`)
