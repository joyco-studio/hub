'use client'

import { CopyButton } from '@/components/copy-button'
import { cn } from '@/lib/utils'

export function CodeBlock({
  highlightedCode,
  language,
  title,
  rawCode,
  maxHeight,
}: {
  highlightedCode: string
  language: string
  title: string | undefined
  rawCode?: string
  maxHeight?: number
}) {
  return (
    <figure
      data-rehype-pretty-code-figure=""
      className="not-prose group/code"
    >
      {title && (
        <figcaption
          data-rehype-pretty-code-title=""
          data-language={language}
        >
          <span>{title}</span>
        </figcaption>
      )}
      {rawCode && <CopyButton forceVisible={!!title} value={rawCode} />}

      <div
        style={{
          '--pre-max-height': maxHeight ? `${maxHeight}px` : 'unset',
        } as React.CSSProperties}
        className={cn(
          '[&>pre]:max-h-(--pre-max-height)'
        )}
        dangerouslySetInnerHTML={{ __html: highlightedCode }}
      />
    </figure>
  )
}
