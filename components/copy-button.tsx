'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import CopyIcon from '@/components/icons/copy'
import { cn } from '@/lib/utils'

export function useCopyToClipboard(timeout = 2000) {
  const [hasCopied, setHasCopied] = React.useState(false)

  React.useEffect(() => {
    if (hasCopied) {
      const timer = setTimeout(() => setHasCopied(false), timeout)
      return () => clearTimeout(timer)
    }
  }, [hasCopied, timeout])

  const copy = React.useCallback((value: string) => {
    navigator.clipboard.writeText(value)
    setHasCopied(true)
  }, [])

  return { hasCopied, copy }
}

/**
 * Build clean rich-text HTML from a rendered content element.
 *
 * The on-page DOM carries things that don't belong in pasted content:
 * interactive chrome (copy / download buttons) and syntax-highlighted code
 * blocks whose per-line `<span data-line>` structure and `--shiki-*` colors
 * collapse the moment a WYSIWYG target (e.g. x.com articles) strips classes
 * and CSS. We clone, drop the chrome, and rebuild every code block as a plain
 * `<pre><code>` with real newlines so it survives as an actual code block.
 */
function serializeRichTextHtml(element: HTMLElement): string {
  const clone = element.cloneNode(true) as HTMLElement

  // Drop interactive chrome (copy buttons, download buttons, …) — it should
  // never end up in the pasted output.
  clone.querySelectorAll('button, [data-slot="copy-button"]').forEach((el) => {
    el.remove()
  })

  // Flatten highlighted code blocks into plain <pre><code> with real newlines.
  clone.querySelectorAll('pre').forEach((pre) => {
    const lines = pre.querySelectorAll('[data-line], .line')
    const code =
      lines.length > 0
        ? Array.from(lines)
            .map((line) => line.textContent ?? '')
            .join('\n')
        : (pre.textContent ?? '')

    const newPre = document.createElement('pre')
    const newCode = document.createElement('code')
    newCode.textContent = code
    newPre.appendChild(newCode)
    pre.replaceWith(newPre)
  })

  // Resolve relative links/images to absolute so they still work once pasted
  // off-site.
  clone.querySelectorAll('a[href]').forEach((a) => {
    a.setAttribute('href', (a as HTMLAnchorElement).href)
  })
  clone.querySelectorAll('img[src]').forEach((img) => {
    img.setAttribute('src', (img as HTMLImageElement).src)
  })

  return clone.innerHTML
}

/**
 * Copy rendered content to the clipboard as rich text (WYSIWYG).
 *
 * Writes both a sanitized `text/html` payload and a `text/plain` fallback so
 * pasting into a rich-text editor (x.com articles, Google Docs, Notion, email,
 * …) preserves formatting and code blocks, while plain-text targets still
 * receive readable text.
 */
export function useCopyRichTextToClipboard(timeout = 2000) {
  const [hasCopied, setHasCopied] = React.useState(false)

  React.useEffect(() => {
    if (hasCopied) {
      const timer = setTimeout(() => setHasCopied(false), timeout)
      return () => clearTimeout(timer)
    }
  }, [hasCopied, timeout])

  const copy = React.useCallback((element: HTMLElement | null) => {
    if (!element) return

    const html = serializeRichTextHtml(element)
    const plain = element.innerText

    const canWriteRichText =
      typeof ClipboardItem !== 'undefined' &&
      typeof navigator.clipboard?.write === 'function'

    if (canWriteRichText) {
      const item = new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([plain], { type: 'text/plain' }),
      })
      navigator.clipboard
        .write([item])
        .then(() => setHasCopied(true))
        .catch(() => {
          navigator.clipboard.writeText(plain)
          setHasCopied(true)
        })
    } else {
      navigator.clipboard.writeText(plain)
      setHasCopied(true)
    }
  }, [])

  return { hasCopied, copy }
}

export function CopyButton({
  value,
  className,
  forceVisible = false,
  absolute = true,
  children,
  variant = 'ghost',
  size = 'icon',
  ...props
}: {
  value: string
  forceVisible?: boolean
  /** Whether to use absolute positioning (default: true for code blocks) */
  absolute?: boolean
  children?: (hasCopied: boolean) => React.ReactNode
} & Omit<React.ComponentProps<typeof Button>, 'children'>) {
  const { hasCopied, copy } = useCopyToClipboard()

  return (
    <Button
      data-slot="copy-button"
      size={size}
      variant={variant}
      className={cn(
        size === 'icon' && absolute && 'size-7',
        size === 'icon' &&
          absolute &&
          'absolute top-[0.725rem] right-3 z-10',
        size === 'icon' &&
          (forceVisible
            ? 'opacity-70 hover:opacity-100'
            : 'opacity-0 transition-opacity group-hover/code:opacity-100 hover:opacity-100 focus-visible:opacity-100'),
        className
      )}
      onClick={() => copy(value)}
      {...props}
    >
      {children ? (
        children(hasCopied)
      ) : hasCopied ? (
        <Check className="h-4 w-4" />
      ) : (
        <CopyIcon className="h-4 w-4" />
      )}
    </Button>
  )
}
