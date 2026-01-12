'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

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
  const [index, setIndex] = React.useState(0)
  const text = texts[index] ?? ''
  const [count, setCount] = React.useState(text.length)
  const [phase, setPhase] = React.useState<'hold' | 'delete' | 'gap' | 'type' | 'pause'>('hold')

  React.useEffect(() => {
    if (phase === 'hold') {
      const id = setTimeout(() => setPhase('delete'), pauseMs)
      return () => clearTimeout(id)
    }

    if (phase === 'delete') {
      if (count === 0) {
        const isLast = index + 1 >= texts.length
        if (isLast && !loop) return // Stop if no loop
        setIndex(isLast ? 0 : index + 1)
        setPhase('gap')
        return
      }
      const id = setTimeout(() => setCount((c) => c - 1), deleteMsPerChar)
      return () => clearTimeout(id)
    }

    if (phase === 'gap') {
      const id = setTimeout(() => setPhase('type'), gapMs)
      return () => clearTimeout(id)
    }

    if (phase === 'type') {
      if (count < text.length) {
        const id = setTimeout(() => setCount((c) => c + 1), msPerChar)
        return () => clearTimeout(id)
      }
      setPhase('pause')
    }

    if (phase === 'pause') {
      const id = setTimeout(() => setPhase('delete'), pauseMs)
      return () => clearTimeout(id)
    }
  }, [count, phase, text.length, index, texts.length, loop, msPerChar, deleteMsPerChar, pauseMs, gapMs])

  const visible = text.slice(0, count)

  return (
    <span
      ref={ref}
      className={cn('relative inline-block', className)}
      {...props}
    >
      {/* Size holder */}
      <span className="invisible inline-grid *:col-start-1 *:row-start-1 *:whitespace-pre">
        {texts.map((t, i) => (
          <span key={i}>{t}</span>
        ))}
      </span>
      {/* Text */}
      <span className="absolute inset-0 whitespace-pre">
        {visible}
        {caret && (
          <span
            className="animate-caret-blink inline-block w-px bg-current"
            style={{ height: '1em' }}
          />
        )}
      </span>
    </span>
  )
}
