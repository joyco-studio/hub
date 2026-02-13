import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Root, Element, ElementContent } from 'hast'
import { fromHtmlIsomorphic } from 'hast-util-from-html-isomorphic'
import { toText } from 'hast-util-to-text'
import { visitParents } from 'unist-util-visit-parents'
import type { VFile } from 'vfile'

const GENERATED_DIR = join(process.cwd(), 'generated', 'mermaid')

function hashDiagram(source: string): string {
  return createHash('sha256').update(source.trim()).digest('hex').slice(0, 12)
}

/**
 * Rehype plugin that inlines pre-rendered Mermaid SVGs at build time.
 *
 * Looks up SVGs in generated/mermaid/{hash}-{light,dark}.svg — these are
 * created by `node scripts/render-mermaid.mjs` (which needs Playwright).
 * The build itself needs no browser dependency.
 */
export default function rehypeMermaidDualTheme() {
  return (tree: Root, file: VFile) => {
    type DiagramInstance = {
      preElement: Element
      preParent: Element | Root
      diagram: string
    }

    const instances: DiagramInstance[] = []

    visitParents(tree, 'element', (node, ancestors) => {
      const element = node as Element

      if (element.tagName !== 'code') return
      const className = element.properties?.className
      if (!Array.isArray(className)) return
      if (!className.includes('language-mermaid')) return

      const pre = ancestors.at(-1)
      if (
        !pre ||
        pre.type !== 'element' ||
        (pre as Element).tagName !== 'pre'
      )
        return

      const preParent = ancestors.at(-2)
      if (!preParent || !('children' in preParent)) return

      const text = toText(element, { whitespace: 'pre' })
      if (!text.trim()) return

      instances.push({
        preElement: pre as Element,
        preParent: preParent as Element | Root,
        diagram: text,
      })
    })

    if (instances.length === 0) return

    for (let i = instances.length - 1; i >= 0; i--) {
      const { preElement, preParent, diagram } = instances[i]
      const hash = hashDiagram(diagram)

      let lightSvgStr: string
      let darkSvgStr: string
      try {
        lightSvgStr = readFileSync(join(GENERATED_DIR, `${hash}-light.svg`), 'utf-8')
        darkSvgStr = readFileSync(join(GENERATED_DIR, `${hash}-dark.svg`), 'utf-8')
      } catch {
        file.message(
          `Missing pre-rendered SVG for mermaid diagram (hash: ${hash}). ` +
            'Run `node scripts/render-mermaid.mjs` to generate it.'
        )
        continue
      }

      const lightSvg = fromHtmlIsomorphic(lightSvgStr, {
        fragment: true,
      }).children[0] as ElementContent
      const darkSvg = fromHtmlIsomorphic(darkSvgStr, {
        fragment: true,
      }).children[0] as ElementContent

      const wrapper: Element = {
        type: 'element',
        tagName: 'div',
        properties: {
          className: ['mermaid-diagram'],
        },
        children: [
          {
            type: 'element',
            tagName: 'div',
            properties: { 'data-mermaid-theme': 'light' },
            children: [lightSvg],
          } as Element,
          {
            type: 'element',
            tagName: 'div',
            properties: { 'data-mermaid-theme': 'dark' },
            children: [darkSvg],
          } as Element,
        ],
      }

      const preIndex = (
        preParent.children as ElementContent[]
      ).indexOf(preElement as unknown as ElementContent)
      if (preIndex === -1) continue

      preParent.children[preIndex] = wrapper
    }
  }
}
