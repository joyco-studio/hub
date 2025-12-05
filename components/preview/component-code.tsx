'use client'

import { cn } from '@/lib/utils'

export function ComponentCode({
  highlightedCode,
  language,
  title,
}: {
  highlightedCode: string
  language: string
  title: string | undefined
}) {
  return (
    <figure
      data-rehype-pretty-code-figure=""
      className="group/code scrollbar-none bg-card my-0 max-h-[400px] overflow-auto rounded-none pt-4"
    >
      {title && (
        <figcaption
          data-rehype-pretty-code-title=""
          className="text-code-foreground bg-card flex"
          data-language={language}
        >
          <span className="font-medium">{title}</span>
          <div className="ml-auto flex items-center gap-2">
            <span className="font-mono text-xs opacity-60">{language}</span>
          </div>
        </figcaption>
      )}

      {/* Code container with scrollbar */}
      <div
        className={cn(
          'scrollbar-none',
          '[&>pre]:scrollbar-none [&>pre]:overflow-auto [&>pre]:p-4'
        )}
      >
        <div dangerouslySetInnerHTML={{ __html: highlightedCode }} />
      </div>
    </figure>
  )
}
