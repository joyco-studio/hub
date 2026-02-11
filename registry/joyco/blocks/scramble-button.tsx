'use client'

import * as React from 'react'
import gsap from 'gsap'
import { cn } from '@/lib/utils'
import '@/lib/gsap/effects/scramble'

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/

export interface ScrambleButtonProps extends React.ComponentPropsWithRef<'button'> {
  /** The text to display and scramble on hover */
  text: string
  /** Character set used for scramble animation */
  scrambleChars?: string
  /** Duration of the scramble animation in seconds */
  scrambleDuration?: number
  /** Programmatically trigger the scramble animation (useful for touch devices) */
  scramble?: boolean
}

/* -------------------------------------------------------------------------------------------------
 * ScrambleButton
 * -----------------------------------------------------------------------------------------------*/

export function ScrambleButton({
  text,
  scrambleChars,
  scrambleDuration = 0.6,
  scramble,
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
      ...(scrambleChars && { chars: scrambleChars }),
      duration: scrambleDuration,
    })
  }, [text, scrambleChars, scrambleDuration])

  const resetText = React.useCallback(() => {
    if (!textRef.current) return
    tweenRef.current?.kill()
    textRef.current.textContent = text
  }, [text])

  // Handle programmatic scramble prop
  const prevScramble = React.useRef(scramble)
  React.useEffect(() => {
    if (scramble === undefined) return
    if (scramble && !prevScramble.current) {
      runScramble()
    } else if (!scramble && prevScramble.current) {
      resetText()
    }
    prevScramble.current = scramble
  }, [scramble, runScramble, resetText])

  // Cleanup on unmount
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
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap',
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      <span ref={textRef} data-slot="text">
        {text}
      </span>
    </button>
  )
}
