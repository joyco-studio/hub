'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

/* -------------------------------------------------------------------------------------------------
 * Types
 * -------------------------------------------------------------------------------------------------*/

export interface SpritesheetSequencerProps extends React.ComponentProps<'div'> {
  /** URL to the squared spritesheet image */
  src: string
  /** Total number of frames in the spritesheet */
  frameCount: number
  /** Duration per frame in milliseconds (default: 100) */
  frameDuration?: number
  /** Whether the animation is playing (default: true) */
  isPlaying?: boolean
  /** Whether to loop the animation (default: true) */
  loop?: boolean
  /** Animation direction (default: 'normal') */
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse'
  /** Reset to frame 0 when isPlaying changes to true (default: false) */
  resetOnPlay?: boolean
  /** Callback fired when the current frame changes */
  onFrameChange?: (frame: number) => void
  /** Callback fired when the spritesheet image loads */
  onLoad?: () => void
  /** Callback fired when the animation completes (non-looping only) */
  onComplete?: () => void
}

/* -------------------------------------------------------------------------------------------------
 * Helpers
 * -------------------------------------------------------------------------------------------------*/

function buildKeyframes(frameCount: number, gridSize: number): Keyframe[] {
  const keyframes: Keyframe[] = []

  for (let i = 0; i < frameCount; i++) {
    const col = i % gridSize
    const row = Math.floor(i / gridSize)

    // CSS background-position % is relative to (container - image) size
    // 0% = left/top edge aligned, 100% = right/bottom edge aligned
    // For gridSize columns, we need to map col 0 to 0%, col (gridSize-1) to 100%
    const posX = gridSize > 1 ? (col / (gridSize - 1)) * 100 : 0
    const posY = gridSize > 1 ? (row / (gridSize - 1)) * 100 : 0

    const keyframe = {
      backgroundPositionX: `${posX}%`,
      backgroundPositionY: `${posY}%`,
      offset: i / frameCount,
      easing: 'step-end',
    }

    console.log(`[buildKeyframes] frame ${i}: col=${col}, row=${row}, offset=${keyframe.offset}, posX=${keyframe.backgroundPositionX}, posY=${keyframe.backgroundPositionY}`)

    keyframes.push(keyframe)
  }

  return keyframes
}

/* -------------------------------------------------------------------------------------------------
 * SpritesheetSequencer
 * -------------------------------------------------------------------------------------------------*/

export function SpritesheetSequencer({
  src,
  frameCount,
  frameDuration = 100,
  isPlaying = true,
  loop = true,
  direction = 'normal',
  resetOnPlay = false,
  onFrameChange,
  onLoad,
  onComplete,
  className,
  style,
  ...props
}: SpritesheetSequencerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const animationRef = React.useRef<Animation | null>(null)
  const currentFrameRef = React.useRef<number>(-1)
  const wasPlayingRef = React.useRef<boolean>(isPlaying)
  const onFrameChangeRef = React.useRef(onFrameChange)
  const onCompleteRef = React.useRef(onComplete)
  const onLoadRef = React.useRef(onLoad)

  const [isLoaded, setIsLoaded] = React.useState(false)

  const gridSize = Math.ceil(Math.sqrt(frameCount))
  const totalDuration = frameDuration * frameCount

  // Keep refs in sync
  React.useEffect(() => {
    onFrameChangeRef.current = onFrameChange
    onCompleteRef.current = onComplete
    onLoadRef.current = onLoad
  })

  // Preload spritesheet image
  React.useEffect(() => {
    const img = new Image()

    const handleLoad = () => {
      console.log('[preload] Image loaded:', src)
      setIsLoaded(true)
      onLoadRef.current?.()
    }

    const handleError = () => {
      console.error(`Failed to load spritesheet: ${src}`)
    }

    img.addEventListener('load', handleLoad)
    img.addEventListener('error', handleError)
    img.src = src

    return () => {
      img.removeEventListener('load', handleLoad)
      img.removeEventListener('error', handleError)
      img.src = ''
      setIsLoaded(false)
    }
  }, [src])

  // Create animation (only recreate when structure changes, not timing)
  React.useEffect(() => {
    if (!isLoaded || !containerRef.current) return
    if (frameCount <= 0) return

    console.log('[animation] Creating animation:', {
      frameCount,
      gridSize,
      frameDuration,
      totalDuration: frameDuration * frameCount,
      loop,
      direction,
      isPlaying,
    })

    const keyframes = buildKeyframes(frameCount, gridSize)

    console.log('[animation] Keyframes created:', keyframes.length)

    const animation = containerRef.current.animate(keyframes, {
      duration: frameDuration * frameCount,
      iterations: loop ? Infinity : 1,
      direction,
      fill: 'forwards',
    })

    console.log('[animation] Animation created:', animation)

    // Start paused if not playing
    if (!isPlaying) {
      animation.pause()
    }

    // Handle animation completion (non-looping)
    animation.onfinish = () => {
      onCompleteRef.current?.()
    }

    animationRef.current = animation
    currentFrameRef.current = -1

    return () => {
      animation.cancel()
      animationRef.current = null
    }
    // Note: frameDuration intentionally excluded - handled by separate effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, frameCount, gridSize, loop, direction])

  // Handle play/pause changes
  React.useEffect(() => {
    const animation = animationRef.current
    if (!animation) return

    if (isPlaying) {
      // Reset if requested and transitioning from paused to playing
      if (resetOnPlay && !wasPlayingRef.current) {
        animation.currentTime = 0
        currentFrameRef.current = -1
      }
      animation.play()
    } else {
      animation.pause()
    }

    wasPlayingRef.current = isPlaying
  }, [isPlaying, resetOnPlay])

  // Update duration dynamically without recreating animation
  React.useEffect(() => {
    const animation = animationRef.current
    if (!animation?.effect) return

    const timing = animation.effect.getTiming()
    const oldDuration = timing.duration as number
    const newDuration = totalDuration

    // Skip if duration hasn't changed
    if (oldDuration === newDuration) return

    // Preserve relative progress when changing speed
    const currentTime = Number(animation.currentTime ?? 0)
    const currentProgress = currentTime / oldDuration
    animation.effect.updateTiming({ duration: newDuration })
    animation.currentTime = currentProgress * newDuration
  }, [totalDuration])

  // Track frame changes via RAF
  React.useEffect(() => {
    if (!isPlaying || !animationRef.current) return

    let rafId: number

    const tick = () => {
      const animation = animationRef.current
      if (!animation) return

      const currentTime = Number(animation.currentTime ?? 0)
      const frame = Math.floor(currentTime / frameDuration) % frameCount

      if (frame !== currentFrameRef.current) {
        console.log('[tick] Frame change:', {
          frame,
          currentTime,
          frameDuration,
          totalDuration,
          progress: currentTime / totalDuration,
        })
        currentFrameRef.current = frame
        onFrameChangeRef.current?.(frame)
      }

      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafId)
    }
  }, [isPlaying, frameDuration, frameCount])

  console.log('[render] backgroundSize:', `${gridSize * 100}% ${gridSize * 100}%`, 'gridSize:', gridSize, 'frameCount:', frameCount)

  return (
    <div
      ref={containerRef}
      data-slot="spritesheet-sequencer"
      data-loaded={isLoaded}
      data-playing={isPlaying && isLoaded}
      className={cn('size-full bg-no-repeat', className)}
      style={{
        backgroundImage: isLoaded ? `url(${src})` : undefined,
        backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
        ...style,
      }}
      {...props}
    />
  )
}
