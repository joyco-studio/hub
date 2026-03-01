'use client'

import * as React from 'react'
import gsap from 'gsap'
import { type VariantProps } from 'class-variance-authority'
import { Button, buttonVariants } from '@/components/ui/button'
import '@/lib/gsap/effects/scramble'

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/

export interface ScrambleButtonProps
  extends
    React.ComponentPropsWithRef<'button'>,
    VariantProps<typeof buttonVariants> {
  /** The text to display and scramble on hover */
  text: string
  /** Character set for scramble animation. Repeated chars increase their probability. */
  scrambleChars?: string
  /** Duration of the scramble animation in seconds. 0 = auto-scale with text length. */
  scrambleDuration?: number
  /** Seconds of full scramble before characters start resolving. */
  scrambleRevealDelay?: number
  /** How many scramble frames each character gets before resolving (higher = more chaotic). */
  scrambleFrames?: number
  /** Programmatically trigger the scramble animation (useful for touch devices). */
  scramble?: boolean
}

/* -------------------------------------------------------------------------------------------------
 * ScrambleButton
 * -----------------------------------------------------------------------------------------------*/

export function ScrambleButton({
  text,
  scrambleChars,
  scrambleDuration = 0,
  scrambleRevealDelay = 0,
  scrambleFrames,
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
      ...(scrambleChars != null && { chars: scrambleChars }),
      ...(scrambleDuration > 0 && { duration: scrambleDuration }),
      ...(scrambleRevealDelay > 0 && { revealDelay: scrambleRevealDelay }),
      ...(scrambleFrames != null && { scrambleFrames }),
    })
  }, [
    text,
    scrambleChars,
    scrambleDuration,
    scrambleRevealDelay,
    scrambleFrames,
  ])

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
