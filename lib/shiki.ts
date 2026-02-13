import { codeToHtml, type ShikiTransformer, BuiltinLanguage } from 'shiki'
import { cn } from './utils'

export const LANGUAGE_MAP: Record<string, BuiltinLanguage> = {
  json: 'json',
  js: 'javascript',
  ts: 'typescript',
  tsx: 'tsx',
  jsx: 'jsx',
  md: 'markdown',
  mdx: 'mdx',
  css: 'css',
  html: 'html',
  yml: 'yaml',
  yaml: 'yaml',
  sh: 'bash',
  bash: 'bash',
  py: 'python',
}

export function getLanguageFromExtension(ext: string): string {
  return LANGUAGE_MAP[ext] || ext || 'text'
}

/**
 * Strips frontmatter from content (for guideline files)
 */
export function stripFrontmatter(content: string): string {
  return content.replace(/^---\n[\s\S]*?\n---\n*/m, '')
}

/*
 * Command Detection & Transformation
 **/

const commandDetectors: ({
  match: (raw: string) => boolean
  transform: (raw: string) => Record<string, string>
})[] = [
  {
    // npm install
    match: (raw) => raw.startsWith('npm install'),
    transform: (raw) => ({
      __npm__: raw,
      __yarn__: raw.replace('npm install', 'yarn add'),
      __pnpm__: raw.replace('npm install', 'pnpm add'),
      __bun__: raw.replace('npm install', 'bun add'),
    }),
  },
  {
    // npx create- (must come before generic npx)
    match: (raw) => raw.startsWith('npx create-'),
    transform: (raw) => ({
      __npm__: raw,
      __yarn__: raw.replace('npx create-', 'yarn create '),
      __pnpm__: raw.replace('npx create-', 'pnpm create '),
      __bun__: raw.replace('npx', 'bunx --bun'),
    }),
  },
  {
    // npm create
    match: (raw) => raw.startsWith('npm create'),
    transform: (raw) => ({
      __npm__: raw,
      __yarn__: raw.replace('npm create', 'yarn create'),
      __pnpm__: raw.replace('npm create', 'pnpm create'),
      __bun__: raw.replace('npm create', 'bun create'),
    }),
  },
  {
    // npx (generic)
    match: (raw) => raw.startsWith('npx'),
    transform: (raw) => ({
      __npm__: raw,
      __yarn__: raw.replace('npx', 'yarn'),
      __pnpm__: raw.replace('npx', 'pnpm dlx'),
      __bun__: raw.replace('npx', 'bunx --bun'),
    }),
  },
  {
    // npm run
    match: (raw) => raw.startsWith('npm run'),
    transform: (raw) => ({
      __npm__: raw,
      __yarn__: raw.replace('npm run', 'yarn'),
      __pnpm__: raw.replace('npm run', 'pnpm'),
      __bun__: raw.replace('npm run', 'bun'),
    }),
  },
  {
    match: (raw) =>
      raw.includes('@joycostudio/scripts') && raw.includes('agents -s'),
    transform: (raw) => ({
      __cursor__: raw.replace(/agents -s \w+/, 'agents -s cursor'),
      __codex__: raw.replace(/agents -s \w+/, 'agents -s codex'),
      __claude__: raw.replace(/agents -s \w+/, 'agents -s claude'),
    }),
  },
]

export function isCommand(raw: string): boolean {
  return commandDetectors.some((cmd) => cmd.match(raw))
}

function applyCommandTransformations(
  raw: string,
  properties: Record<string, unknown>
): void {
  for (const detector of commandDetectors) {
    if (detector.match(raw)) {
      const transforms = detector.transform(raw)
      Object.assign(properties, transforms)
    }
  }
}

/*
 * Shiki Transformers (MDX level)
 **/

export const transformers = [
  {
    pre(node) {
      const raw = this.source
      node.properties['__raw__'] = raw
      node.properties['__iscommand__'] = String(isCommand(raw))
    },
    code(node) {
      if (node.tagName === 'code') {
        const raw = this.source
        node.properties['__raw__'] = raw
        node.properties['__iscommand__'] = String(isCommand(raw))
        applyCommandTransformations(raw, node.properties)
      }
    },
  },
] as ShikiTransformer[]

export const codeClasses = {
  pre: "not-fumadocs-codeblock relative w-full overflow-auto p-4 has-[[data-slot='command-block']]:p-0 has-[[data-line-numbers]]:px-0",
}

export async function highlightCode(code: string, language: string = 'tsx') {
  const html = await codeToHtml(code, {
    lang: language,
    themes: {
      dark: 'github-dark',
      light: 'github-light-default',
    },
    /* These only run at component level when calling highlightCode */
    transformers: [
      {
        code(node) {
          node.properties['data-line-numbers'] = ''
        },
        pre(node) {
          node.properties['class'] = cn(
            codeClasses.pre,
            node.properties['class']?.toString()
          )
        },
        line(node) {
          node.properties['data-line'] = ''
        },
      }
    ]
  })

  return html
}
