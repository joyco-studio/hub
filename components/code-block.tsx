'use client'

import { CopyButton } from '@/components/copy-button'
import { cn } from '@/lib/utils'
import { DownloadFileButton } from './download-button'

export function CodeBlock({
  highlightedCode,
  language,
  title,
  rawCode,
  maxHeight,
  wrap,
}: {
  highlightedCode: string
  language: string
  title?: string
  rawCode?: string
  maxHeight?: number
  wrap?: boolean
}) {
  return (
    <figure
      data-rehype-pretty-code-figure=""
      data-wrap={wrap}
      className="not-prose"
      data-slot="code-block"
    >
      {title && (
        <figcaption data-rehype-pretty-code-title="" data-language={language}>
          <span>{title}</span>
          {rawCode && <DownloadFileButton value={rawCode} fileName={title} />}
        </figcaption>
      )}

      <div className="group/code relative">
        {rawCode && <CopyButton value={rawCode} />}
        <div
          style={
            {
              '--pre-max-height': maxHeight ? `${maxHeight}px` : 'unset',
            } as React.CSSProperties
          }
          className={cn('[&>pre]:max-h-(--pre-max-height)')}
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      </div>
    </figure>
  )
}
