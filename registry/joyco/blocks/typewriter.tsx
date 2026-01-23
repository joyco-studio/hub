'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { useTypewriter } from '@/hooks/use-typewriter'

export interface TypewriterProps extends React.ComponentPropsWithRef<'span'> {
  texts: readonly string[]
  msPerChar?: number
  pauseMs?: number
  deleteMsPerChar?: number
  gapMs?: number
  loop?: boolean
  caret?: boolean
}

export function Typewriter({
  texts,
  msPerChar = 60,
  pauseMs = 900,
  deleteMsPerChar = msPerChar,
  gapMs = 150,
  loop = true,
  caret = true,
  className,
  ref,
  ...props
}: TypewriterProps) {
  const { visible, longestText, prefersReducedMotion } = useTypewriter({
    texts,
    msPerChar,
    pauseMs,
    deleteMsPerChar,
    gapMs,
    loop,
  })

  if (texts.length === 0) return null

  return (
    <span
      ref={ref}
      className={cn('relative inline-block', className)}
      aria-live="polite"
      aria-atomic="true"
      {...props}
    >
      {/* Size holder - only renders longest text */}
      <span
        data-slot="size-holder"
        className="invisible whitespace-pre"
        aria-hidden="true"
      >
        {longestText}
      </span>

      {/* Visible text */}
      <span data-slot="text" className="absolute inset-0 whitespace-pre">
        {visible}
        {caret && (
          <span
            data-slot="caret"
            className="inline-block w-px bg-current"
            style={{ height: '1em' }}
            aria-hidden="true"
          />
        )}
      </span>
    </span>
  )
}
