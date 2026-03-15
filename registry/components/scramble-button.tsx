'use client'

import * as React from 'react'
import gsap from 'gsap'
import { Button } from '@/components/ui/button'
import '@/registry/lib/gsap/effects/scramble'

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/

export interface ScrambleButtonProps extends React.ComponentPropsWithRef<
  typeof Button
> {
  /** The text to display and scramble on hover */
  text: string
  /** Character set for scramble animation. Repeated chars increase their probability. */
  chars?: string
  /** Duration of the scramble animation in seconds. 0 = auto-scale with text length. */
  duration?: number
  /** How many randomization cycles each character gets before resolving (higher = more chaotic). */
  cycles?: number
  /** Probability (0–1) that each character scrambles. Default 1. */
  chance?: number
  /** Animate from empty string, growing text in. Default false. */
  overflow?: boolean
  /** Programmatically trigger the scramble animation (useful for touch devices). */
  scramble?: boolean
}

/* -------------------------------------------------------------------------------------------------
 * ScrambleButton
 * -----------------------------------------------------------------------------------------------*/

export function ScrambleButton({
  text,
  chars,
  duration = 0,
  cycles,
  chance,
  overflow,
  scramble,
  variant,
  size,
  className,
  onMouseEnter,
  onMouseLeave,
  ref,
  ...props
}: ScrambleButtonProps) {
  const textRef = React.useRef<HTMLSpanElement>(null)
  const tweenRef = React.useRef<gsap.core.Tween | null>(null)

  const runScramble = React.useCallback(() => {
    if (!textRef.current) return
    tweenRef.current?.kill()
    tweenRef.current = gsap.effects.scramble(textRef.current, {
      text,
      ...(chars != null && { chars }),
      ...(duration != null && duration > 0 && { duration }),
      ...(cycles != null && { cycles }),
      ...(chance != null && { chance }),
      ...(overflow != null && { overflow }),
    })
  }, [text, chars, duration, cycles, chance, overflow])

  const resetText = React.useCallback(() => {
    if (!textRef.current) return
    tweenRef.current?.kill()
    textRef.current.textContent = text
  }, [text])

  // Handle programmatic scramble prop (rising edge triggers animation)
  const prevScramble = React.useRef(scramble)
  React.useEffect(() => {
    if (scramble === undefined) return
    if (scramble && !prevScramble.current) runScramble()
    else if (!scramble && prevScramble.current) resetText()
    prevScramble.current = scramble
  }, [scramble, runScramble, resetText])

  React.useEffect(() => {
    return () => {
      tweenRef.current?.kill()
    }
  }, [])

  const handleMouseEnter = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      runScramble()
      onMouseEnter?.(e)
    },
    [runScramble, onMouseEnter]
  )

  const handleMouseLeave = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      resetText()
      onMouseLeave?.(e)
    },
    [resetText, onMouseLeave]
  )

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      <span ref={textRef} data-slot="text">
        {text}
      </span>
    </Button>
  )
}
