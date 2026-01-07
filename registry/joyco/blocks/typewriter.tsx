'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

type AriaLive = 'off' | 'polite' | 'assertive'

export interface TypewriterProps extends React.ComponentPropsWithoutRef<'span'> {
  /**
   * The list of texts to type. When more than one is provided, the component can
   * automatically cycle through them.
   */
  texts: readonly string[]
  /**
   * Controlled active index.
   */
  index?: number
  /**
   * Uncontrolled initial index.
   * @default 0
   */
  defaultIndex?: number
  /**
   * Called whenever the component *requests* an index change (e.g. when auto-advancing).
   */
  onIndexChange?: (index: number) => void
  /**
   * Whether to automatically cycle through `texts` (when `texts.length > 1`).
   * Disabled automatically when `prefers-reduced-motion` is enabled.
   * @default texts.length > 1
   */
  autoPlay?: boolean
  /**
   * Whether to loop back to the first text after the last.
   * @default true
   */
  loop?: boolean
  /**
   * Typing speed in milliseconds per character.
   * @default 60
   */
  msPerChar?: number
  /**
   * Pause after typing completes (before advancing to the next text).
   * @default 900
   */
  pauseMs?: number
  /**
   * Typing speed in milliseconds per character while deleting.
   * @default msPerChar
   */
  deleteMsPerChar?: number
  /**
   * Pause after deleting completes (before starting the next word).
   * @default 150
   */
  gapMs?: number
  /**
   * Whether to render a blinking caret.
   * @default true
   */
  caret?: boolean
  /**
   * Whether screen readers should announce text changes.
   * Defaults to `off` to avoid noisy announcements when cycling.
   * @default "off"
   */
  ariaLive?: AriaLive
}

function clampIndex(index: number, len: number) {
  if (len <= 0) return 0
  if (index < 0) return 0
  if (index >= len) return len - 1
  return index
}

function getCharCount(text: string) {
  // Good enough for most UI strings (handles surrogate pairs).
  return Math.max(0, Array.from(text).length)
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false)

  React.useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!mq) return

    const update = () => setReduced(mq.matches)
    update()

    // Safari < 14 uses addListener/removeListener.
    if ('addEventListener' in mq) mq.addEventListener('change', update)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    else (mq as any).addListener(update)

    return () => {
      if ('removeEventListener' in mq) mq.removeEventListener('change', update)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      else (mq as any).removeListener(update)
    }
  }, [])

  return reduced
}

function sleep(ms: number, signal?: AbortSignal) {
  if (ms <= 0) return Promise.resolve()
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'))
      return
    }

    const id = window.setTimeout(resolve, ms)
    signal?.addEventListener(
      'abort',
      () => {
        window.clearTimeout(id)
        reject(new DOMException('Aborted', 'AbortError'))
      },
      { once: true }
    )
  })
}

export const Typewriter = React.forwardRef<HTMLSpanElement, TypewriterProps>(
  (
    {
      texts,
      index: indexProp,
      defaultIndex = 0,
      onIndexChange,
      autoPlay: autoPlayProp,
      loop = true,
      msPerChar = 60,
      pauseMs = 900,
      deleteMsPerChar,
      gapMs = 150,
      caret = true,
      ariaLive = 'off',
      className,
      style,
      ...props
    },
    ref
  ) => {
    const prefersReducedMotion = usePrefersReducedMotion()

    const isControlled = indexProp != null
    const [uncontrolledIndex, setUncontrolledIndex] =
      React.useState(defaultIndex)

    const resolvedIndex = clampIndex(
      isControlled ? (indexProp as number) : uncontrolledIndex,
      texts.length
    )

    const setIndex = React.useCallback(
      (next: number) => {
        const clamped = clampIndex(next, texts.length)
        if (!isControlled) setUncontrolledIndex(clamped)
        onIndexChange?.(clamped)
      },
      [isControlled, onIndexChange, texts.length]
    )

    const autoPlay = autoPlayProp ?? texts.length > 1

    const text = texts.length > 0 ? (texts[resolvedIndex] ?? '') : ''
    const chars = getCharCount(text)
    const typeDurationMs = Math.max(0, Math.round(chars * msPerChar))
    const deleteDurationMs = Math.max(
      0,
      Math.round(chars * (deleteMsPerChar ?? msPerChar))
    )
    const textRef = React.useRef<HTMLSpanElement | null>(null)
    const caretRef = React.useRef<HTMLSpanElement | null>(null)
    const blinkRef = React.useRef<Animation | null>(null)

    React.useEffect(() => {
      const caretEl = caretRef.current
      if (!caretEl) return

      blinkRef.current?.cancel()
      blinkRef.current = null

      if (prefersReducedMotion) return
      if (!caret) return

      blinkRef.current = caretEl.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 1000,
        iterations: Infinity,
        easing: 'steps(1, end)',
      })

      return () => {
        blinkRef.current?.cancel()
        blinkRef.current = null
      }
    }, [caret, prefersReducedMotion])

    React.useEffect(() => {
      const textEl = textRef.current
      const caretEl = caretRef.current
      if (!textEl) return

      // Stop any previous animations.
      textEl.getAnimations().forEach((a) => a.cancel())
      caretEl?.getAnimations().forEach((a) => a.cancel())

      // Reset.
      if (caretEl) {
        caretEl.style.visibility = caret ? 'visible' : 'hidden'
        caretEl.style.transform = 'translateX(0px)'
      }
      textEl.style.clipPath = 'none'
      textEl.style.willChange = 'clip-path'

      if (prefersReducedMotion) {
        return
      }

      // Start hidden.
      textEl.style.clipPath = 'inset(0 100% 0 0)'

      // Measure once (no per-frame JS).
      const widthPx = textEl.getBoundingClientRect().width
      if (caretEl) {
        const parentRect = textEl.parentElement?.getBoundingClientRect()
        const textRect = textEl.getBoundingClientRect()
        if (parentRect) {
          caretEl.style.top = `${textRect.top - parentRect.top}px`
        }
        caretEl.style.height = `${textRect.height}px`
      }
      const steps = Math.max(1, chars)
      const stepEasing = `steps(${steps}, end)`

      const controller = new AbortController()
      const { signal } = controller

      const typeText = textEl.animate(
        [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)' }],
        { duration: typeDurationMs, easing: stepEasing, fill: 'forwards' }
      )

      const typeCaret =
        caretEl && caret
          ? caretEl.animate(
              [
                { transform: 'translateX(0px)' },
                { transform: `translateX(${widthPx}px)` },
              ],
              { duration: typeDurationMs, easing: stepEasing, fill: 'forwards' }
            )
          : null

      const run = async () => {
        await Promise.all([typeText.finished, typeCaret?.finished])
        await sleep(pauseMs, signal)

        const delText = textEl.animate(
          [{ clipPath: 'inset(0 0% 0 0)' }, { clipPath: 'inset(0 100% 0 0)' }],
          { duration: deleteDurationMs, easing: stepEasing, fill: 'forwards' }
        )

        const delCaret =
          caretEl && caret
            ? caretEl.animate(
                [
                  { transform: `translateX(${widthPx}px)` },
                  { transform: 'translateX(0px)' },
                ],
                {
                  duration: deleteDurationMs,
                  easing: stepEasing,
                  fill: 'forwards',
                }
              )
            : null

        await Promise.all([delText.finished, delCaret?.finished])

        if (caretEl) caretEl.style.visibility = 'hidden'
        await sleep(gapMs, signal)
        if (caretEl) caretEl.style.visibility = caret ? 'visible' : 'hidden'

        if (!autoPlay) return
        if (texts.length <= 1) return

        const isLast = resolvedIndex >= texts.length - 1
        if (isLast) {
          if (!loop) return
          setIndex(0)
          return
        }
        setIndex(resolvedIndex + 1)
      }

      run().catch(() => {
        // Abort/cancel -> ignore
      })

      return () => {
        controller.abort()
        typeText.cancel()
        typeCaret?.cancel()
      }
    }, [
      autoPlay,
      caret,
      chars,
      deleteDurationMs,
      gapMs,
      loop,
      pauseMs,
      prefersReducedMotion,
      resolvedIndex,
      setIndex,
      texts.length,
      typeDurationMs,
    ])

    return (
      <span
        ref={ref}
        data-slot="typewriter"
        aria-live={ariaLive}
        aria-atomic={ariaLive === 'off' ? undefined : true}
        className={cn('relative inline-block', className)}
        style={style}
        {...props}
      >
        {/* Measurement layer: renders all phrases, reserves stable width, not visible. */}
        <span
          data-slot="typewriter-measure"
          aria-hidden="true"
          className={cn(
            'inline-grid items-baseline',
            '*:col-start-1 *:row-start-1',
            '*:whitespace-pre',
            'invisible'
          )}
        >
          {texts.map((t, i) => (
            <span key={`${i}:${t}`}>{t}</span>
          ))}
        </span>

        {/* Active layer: visible, animated via WAAPI. */}
        <span
          data-slot="typewriter-active"
          className="pointer-events-none absolute inset-0"
        >
          <span ref={textRef} data-slot="typewriter-text" aria-hidden={false}>
            {text}
          </span>
          {caret ? (
            <span
              ref={caretRef}
              data-slot="typewriter-caret"
              aria-hidden="true"
              className="absolute left-0 w-px bg-current"
            />
          ) : null}
        </span>
      </span>
    )
  }
)

Typewriter.displayName = 'Typewriter'
