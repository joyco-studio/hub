'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Check, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ComponentCode({
  highlightedCode,
  language,
  title,
  rawCode,
}: {
  highlightedCode: string
  language: string
  title: string | undefined
  rawCode?: string
}) {
  const [hasCopied, setHasCopied] = React.useState(false)

  React.useEffect(() => {
    if (hasCopied) {
      const timer = setTimeout(() => setHasCopied(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [hasCopied])

  const copyCode = React.useCallback(() => {
    if (!rawCode) {
      return
    }

    navigator.clipboard.writeText(rawCode)
    setHasCopied(true)
  }, [rawCode])

  return (
    <figure
      data-rehype-pretty-code-figure=""
      className="group/code scrollbar-none bg-card relative my-0 max-h-[400px] rounded-none pt-4"
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
          'scrollbar-none max-h-[400px] overflow-auto',
          '[&>pre]:scrollbar-none [&>pre]:overflow-auto [&>pre]:p-4'
        )}
      >
        <div dangerouslySetInnerHTML={{ __html: highlightedCode }} />
      </div>

      {rawCode && (
        <Button
          data-slot="copy-button"
          size="icon"
          variant="ghost"
          className="bg-background absolute top-2 right-2 z-10 size-7 opacity-0 transition-opacity group-hover/code:opacity-100 hover:opacity-100 focus-visible:opacity-100"
          onClick={copyCode}
        >
          {hasCopied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      )}
    </figure>
  )
}
