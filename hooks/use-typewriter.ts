'use client'

import * as React from 'react'

export interface UseTypewriterOptions {
  texts: readonly string[]
  msPerChar?: number
  pauseMs?: number
  deleteMsPerChar?: number
  gapMs?: number
  loop?: boolean
}

export interface UseTypewriterReturn {
  /** The currently visible text */
  visible: string
  /** The longest text from the array (useful for sizing) */
  longestText: string
  /** Current animation phase */
  phase: 'type' | 'pause' | 'delete' | 'gap'
  /** Whether the typewriter is actively animating */
  isAnimating: boolean
}

export function useTypewriter({
  texts,
  msPerChar = 60,
  pauseMs = 900,
  deleteMsPerChar = msPerChar,
  gapMs = 150,
  loop = true,
}: UseTypewriterOptions): UseTypewriterReturn {
  const [index, setIndex] = React.useState(0)
  const [count, setCount] = React.useState(0)
  const [phase, setPhase] = React.useState<'type' | 'pause' | 'delete' | 'gap'>(
    'type'
  )

  // Clamp index when texts array changes
  const safeIndex = Math.min(index, Math.max(0, texts.length - 1))
  const text = texts[safeIndex] ?? ''

  const graphemes = React.useMemo(() => toGraphemes(text), [text])

  // Reset state when texts array changes (reference equality)
  const textsKey = React.useMemo(() => texts.join('\0'), [texts])
  React.useEffect(() => {
    setIndex(0)
    setCount(0)
    setPhase('type')
  }, [textsKey])

  const isAnimatingRef = React.useRef(true)

  React.useEffect(() => {
    if (texts.length === 0) {
      isAnimatingRef.current = false
      return
    }

    isAnimatingRef.current = true
    let rafId: number
    let lastTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - lastTime

      // Handle empty strings
      if (graphemes.length === 0) {
        if (phase === 'type') {
          setPhase('pause')
          lastTime = currentTime
        } else if (phase === 'pause' && elapsed >= pauseMs) {
          setPhase('delete')
          lastTime = currentTime
        } else if (phase === 'delete') {
          const isLast = safeIndex + 1 >= texts.length
          if (isLast && !loop) {
            isAnimatingRef.current = false
            return
          }
          setIndex(isLast ? 0 : safeIndex + 1)
          setPhase('gap')
          lastTime = currentTime
        } else if (phase === 'gap' && elapsed >= gapMs) {
          setPhase('type')
          lastTime = currentTime
        }

        if (phase === 'pause' || phase === 'gap') {
          rafId = requestAnimationFrame(animate)
        }
        return
      }

      // Normal animation flow
      if (phase === 'type' && count < graphemes.length) {
        if (elapsed >= msPerChar) {
          lastTime = currentTime
          setCount((c) => c + 1)
        }
        rafId = requestAnimationFrame(animate)
      } else if (phase === 'type' && count >= graphemes.length) {
        setPhase('pause')
        lastTime = currentTime
      } else if (phase === 'pause') {
        if (elapsed >= pauseMs) {
          setPhase('delete')
          lastTime = currentTime
        } else {
          rafId = requestAnimationFrame(animate)
        }
      } else if (phase === 'delete' && count > 0) {
        if (elapsed >= deleteMsPerChar) {
          lastTime = currentTime
          setCount((c) => c - 1)
        }
        rafId = requestAnimationFrame(animate)
      } else if (phase === 'delete' && count === 0) {
        const isLast = safeIndex + 1 >= texts.length
        if (isLast && !loop) {
          isAnimatingRef.current = false
          return
        }
        setIndex(isLast ? 0 : safeIndex + 1)
        setCount(0)
        setPhase('gap')
        lastTime = currentTime
      } else if (phase === 'gap') {
        if (elapsed >= gapMs) {
          setPhase('type')
          lastTime = currentTime
        } else {
          rafId = requestAnimationFrame(animate)
        }
      }
    }

    rafId = requestAnimationFrame(animate)
    return () => {
      cancelAnimationFrame(rafId)
      isAnimatingRef.current = false
    }
  }, [
    phase,
    count,
    graphemes.length,
    safeIndex,
    texts.length,
    loop,
    msPerChar,
    deleteMsPerChar,
    pauseMs,
    gapMs,
  ])

  const longestText = React.useMemo(
    () => texts.reduce((a, b) => (a.length > b.length ? a : b), ''),
    [texts]
  )

  const visible = React.useMemo(
    () => graphemes.slice(0, count).join(''),
    [graphemes, count]
  )

  return {
    visible,
    longestText,
    phase,
    isAnimating: isAnimatingRef.current,
  }
}

/** Split text into grapheme clusters for proper emoji/unicode handling */
function toGraphemes(str: string): string[] {
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' })
    return [...segmenter.segment(str)].map((s) => s.segment)
  }
  // Fallback for older environments - spread handles most cases
  return [...str]
}
