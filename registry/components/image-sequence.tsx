'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import {
  resolveFrameSource,
  SequenceDemandController,
  type FrameSource,
  type SequenceOptions,
} from '@/registry/lib/image-sequence/runtime'

export type { FrameSource }
export type ImageSequenceProps = Omit<SequenceOptions, 'onFrame'> & {
  sequenceId: string
  poster: FrameSource
  alt: string
  className?: string
  playing?: boolean
  resetOnPause?: boolean
  enabled?: boolean
  target?: number
  pixelated?: boolean
  onFrame?: (index: number) => void
}

/** A standalone native-image player. Change sequenceId when replacing sources. */
export function ImageSequence({
  sequenceId,
  poster,
  alt,
  className,
  playing = true,
  resetOnPause = false,
  enabled = true,
  target,
  pixelated = false,
  onFrame,
  onComplete,
  frameCount,
  source,
  mode = 'autoplay',
  frameDuration = 1000 / 24,
  loop = true,
  loopStart,
  loopEnd,
  initialFrame,
  loadInitial = false,
  priority = 'hybrid',
  ahead = 7,
  behind = 3,
}: ImageSequenceProps) {
  const rootRef = useRef<HTMLSpanElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const syncRef = useRef<(() => void) | null>(null)
  const surfaceLease = useRef<(() => void) | undefined>(undefined)
  const openingSurface = useRef<{
    key: string
    src: string
    retain: () => () => void
    release: () => void
  } | null>(null)
  // Opt-in hover previews start a fresh controller when resumed.
  const restart = resetOnPause ? playing : null
  const latest = useRef({
    source,
    poster,
    playing,
    resetOnPause,
    enabled,
    onFrame,
    onComplete,
    target,
  })
  // React owns the SSR poster once; the effect owns src/srcset afterwards. Parent
  // renders must never overwrite a decoded surface with an undecoded candidate.
  const [firstPoster] = useState(() =>
    typeof poster === 'string' ? { src: poster } : poster
  )

  useEffect(() => {
    latest.current = {
      source,
      poster,
      playing,
      resetOnPause,
      enabled,
      onFrame,
      onComplete,
      target,
    }
    syncRef.current?.()
  })

  useEffect(() => {
    const root = rootRef.current
    const image = imageRef.current
    if (!root || !image) return
    const runKey = JSON.stringify([
      sequenceId,
      initialFrame,
      loopStart,
      loopEnd,
      frameCount,
      resetOnPause,
    ])
    if (openingSurface.current?.key !== runKey) {
      openingSurface.current?.release()
      openingSurface.current = null
    }
    const motion = matchMedia('(prefers-reduced-motion: reduce)')
    let nearby = false
    let visible = false
    let disposed = false
    let raf: number | undefined
    let lastTarget: number | undefined
    let lastTime: number | undefined
    let pixelWidth = Math.max(
      1,
      Math.ceil(image.getBoundingClientRect().width * devicePixelRatio)
    )
    const controller = new SequenceDemandController({
      frameCount,
      mode,
      frameDuration,
      loop,
      loopStart,
      loopEnd,
      initialFrame,
      loadInitial,
      priority,
      ahead,
      behind,
      source: (index) =>
        resolveFrameSource(latest.current.source(index), pixelWidth),
      onFrame: (index, frame) => {
        if (
          disposed ||
          !image.isConnected ||
          motion.matches ||
          !latest.current.enabled ||
          !latest.current.playing ||
          document.hidden
        )
          return false
        const releasePrevious = surfaceLease.current
        const releaseNext = controller.retainSurface(frame)
        image.removeAttribute('srcset')
        image.src = frame.src
        surfaceLease.current = releaseNext
        releasePrevious?.()
        if (latest.current.resetOnPause && !openingSurface.current) {
          const retain = () => controller.retainSurface(frame)
          openingSurface.current = {
            key: runKey,
            src: frame.src,
            retain,
            release: retain(),
          }
        }
        latest.current.onFrame?.(index)
        return true
      },
      onComplete: () => latest.current.onComplete?.(),
    })

    const stop = () => {
      if (raf !== undefined) cancelAnimationFrame(raf)
      raf = undefined
      lastTime = undefined
    }
    const tick = (time: number) => {
      raf = undefined
      controller.tick(lastTime === undefined ? 0 : time - lastTime)
      lastTime = time
      if (!disposed && !controller.isComplete) raf = requestAnimationFrame(tick)
    }
    const assignPoster = () => {
      const current = latest.current.poster
      const value = typeof current === 'string' ? { src: current } : current
      // Reassigning the same URL can restart the native poster request, notably
      // with browser cache disabled. Observer notifications must be idempotent.
      if ((image.getAttribute('sizes') ?? '') !== (value.sizes ?? ''))
        image.sizes = value.sizes ?? ''
      if ((image.getAttribute('srcset') ?? '') !== (value.srcSet ?? ''))
        image.srcset = value.srcSet ?? ''
      if (image.getAttribute('src') !== value.src) image.src = value.src
    }
    const restorePoster = (useOpeningFrame = false) => {
      const opening = useOpeningFrame ? openingSurface.current : null
      const releasePrevious = surfaceLease.current
      surfaceLease.current = opening?.retain()
      if (opening) {
        image.removeAttribute('srcset')
        if (image.src !== opening.src) image.src = opening.src
      } else assignPoster()
      releasePrevious?.()
      controller.restorePoster()
    }
    const sync = () => {
      const target = latest.current.target
      if (target !== undefined && target !== lastTarget) {
        lastTarget = target
        controller.queueTarget(target)
      }
      const allowed =
        !document.hidden &&
        !motion.matches &&
        latest.current.enabled &&
        latest.current.playing
      controller.setConditions(nearby && allowed, visible && allowed)
      if (visible && allowed && mode !== 'scrub' && !controller.isComplete) {
        if (raf === undefined) raf = requestAnimationFrame(tick)
      } else stop()
      if (
        motion.matches ||
        (latest.current.resetOnPause && !latest.current.playing)
      )
        restorePoster(!motion.matches)
      else if (!surfaceLease.current) assignPoster()
    }
    const resize = () => {
      const next = Math.max(
        1,
        Math.ceil(image.getBoundingClientRect().width * devicePixelRatio)
      )
      if (pixelWidth === next) return
      pixelWidth = next
      controller.resetWindow()
    }
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      sync()
    })
    const nearbyObserver = new IntersectionObserver(
      ([entry]) => {
        nearby = entry.isIntersecting
        sync()
      },
      { rootMargin: '200px' }
    )
    const sizeObserver = new ResizeObserver(resize)
    visibilityObserver.observe(root)
    nearbyObserver.observe(root)
    sizeObserver.observe(image)
    motion.addEventListener('change', sync)
    document.addEventListener('visibilitychange', sync)
    window.addEventListener('resize', resize)
    window.addEventListener('orientationchange', resize)
    syncRef.current = sync
    sync()
    return () => {
      disposed = true
      stop()
      visibilityObserver.disconnect()
      nearbyObserver.disconnect()
      sizeObserver.disconnect()
      motion.removeEventListener('change', sync)
      document.removeEventListener('visibilitychange', sync)
      window.removeEventListener('resize', resize)
      window.removeEventListener('orientationchange', resize)
      controller.dispose()
      syncRef.current = null
      // The separate surface lease survives replacement of this controller.
    }
  }, [
    restart,
    resetOnPause,
    sequenceId,
    frameCount,
    mode,
    frameDuration,
    loop,
    loopStart,
    loopEnd,
    initialFrame,
    loadInitial,
    priority,
    ahead,
    behind,
  ])

  useEffect(
    () => () => {
      surfaceLease.current?.()
      surfaceLease.current = undefined
      openingSurface.current?.release()
      openingSurface.current = null
    },
    []
  )

  const dimensions = typeof poster === 'string' ? undefined : poster
  return (
    <span
      ref={rootRef}
      data-slot="image-sequence"
      className={cn(
        'relative block **:data-[slot=sequence-image]:block **:data-[slot=sequence-image]:size-full **:data-[slot=sequence-image]:object-contain **:data-[slot=sequence-picture]:block **:data-[slot=sequence-picture]:size-full',
        pixelated &&
          '**:data-[slot=sequence-image]:[image-rendering:pixelated]',
        className
      )}
    >
      <picture data-slot="sequence-picture">
        <img
          ref={imageRef}
          data-slot="sequence-image"
          src={firstPoster.src}
          srcSet={firstPoster.srcSet}
          sizes={firstPoster.sizes}
          width={dimensions?.width}
          height={dimensions?.height}
          alt={alt}
          draggable={false}
          decoding="async"
        />
      </picture>
    </span>
  )
}
