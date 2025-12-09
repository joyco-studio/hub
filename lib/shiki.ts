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

export const transformers = [
  {
    code(node) {
      if (node.tagName === 'code') {
        const raw = this.source
        node.properties['__raw__'] = raw

        if (raw.startsWith('npm install')) {
          node.properties['__npm__'] = raw
          node.properties['__yarn__'] = raw.replace('npm install', 'yarn add')
          node.properties['__pnpm__'] = raw.replace('npm install', 'pnpm add')
          node.properties['__bun__'] = raw.replace('npm install', 'bun add')
        }

        if (raw.startsWith('npx create-')) {
          node.properties['__npm__'] = raw
          node.properties['__yarn__'] = raw.replace(
            'npx create-',
            'yarn create '
          )
          node.properties['__pnpm__'] = raw.replace(
            'npx create-',
            'pnpm create '
          )
          node.properties['__bun__'] = raw.replace('npx', 'bunx --bun')
        }

        // npm create.
        if (raw.startsWith('npm create')) {
          node.properties['__npm__'] = raw
          node.properties['__yarn__'] = raw.replace('npm create', 'yarn create')
          node.properties['__pnpm__'] = raw.replace('npm create', 'pnpm create')
          node.properties['__bun__'] = raw.replace('npm create', 'bun create')
        }

        // npx.
        if (raw.startsWith('npx')) {
          node.properties['__npm__'] = raw
          node.properties['__yarn__'] = raw.replace('npx', 'yarn')
          node.properties['__pnpm__'] = raw.replace('npx', 'pnpm dlx')
          node.properties['__bun__'] = raw.replace('npx', 'bunx --bun')
        }

        // npm run.
        if (raw.startsWith('npm run')) {
          node.properties['__npm__'] = raw
          node.properties['__yarn__'] = raw.replace('npm run', 'yarn')
          node.properties['__pnpm__'] = raw.replace('npm run', 'pnpm')
          node.properties['__bun__'] = raw.replace('npm run', 'bun')
        }
      }
    },
  },
] as ShikiTransformer[]

export const codeClasses = {
  pre: "not-fumadocs-codeblock group/code relative w-full overflow-auto p-3 has-[[data-slot='command-block']]:p-0 has-[[data-line-numbers]]:px-0"
}

export async function highlightCode(code: string, language: string = "tsx") {
  const html = await codeToHtml(code, {
    lang: language,
    themes: {
      dark: 'github-dark',
      light: 'github-light-default',
    },
    transformers: [
      {
        pre(node) {
          node.properties["class"] = cn(codeClasses.pre, node.properties["class"]?.toString())
        },
        code(node) {
          node.properties["data-line-numbers"] = ""
        },
        line(node) {
          node.properties["data-line"] = ""
        },
      },
    ],
  })

  return html
}