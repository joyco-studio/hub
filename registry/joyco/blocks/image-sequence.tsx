'use client'

import * as React from 'react'
import { cn } from '@/lib/cn'

/* -------------------------------------------------------------------------------------------------
 * Types
 * -------------------------------------------------------------------------------------------------*/

type SequenceState = {
  /** Map of loaded images by frame index */
  images: Map<number, HTMLImageElement>
  /** Whether the initial frames (first and last) are loaded */
  initialFramesLoaded: boolean
  /** Total number of frames loaded */
  loadedCount: number
  /** Total frame count */
  frameCount: number
}

type UseSequenceOptions = {
  /** Total number of frames in the sequence */
  frameCount: number
  /** Function to generate the image path for a given frame index */
  getImagePath: (frameIndex: number) => string
  /** Whether to start preloading images immediately */
  preload?: boolean
  /** Callback when a frame is loaded */
  onFrameLoad?: (frameIndex: number, image: HTMLImageElement) => void
  /** Callback when all frames are loaded */
  onAllFramesLoaded?: () => void
}

type UseSequenceReturn = {
  /** Current sequence state */
  state: SequenceState
  /** Get the image for a specific frame index */
  getFrame: (frameIndex: number) => HTMLImageElement | undefined
  /** Get the frame index for a given progress value (0-1) */
  getFrameIndexByProgress: (progress: number) => number
  /** Get the image for a given progress value (0-1) */
  getFrameByProgress: (progress: number) => HTMLImageElement | undefined
  /** Check if a specific frame is loaded */
  isFrameLoaded: (frameIndex: number) => boolean
  /** Manually trigger loading of all frames */
  loadAllFrames: () => void
}

/* -------------------------------------------------------------------------------------------------
 * Binary Loading Strategy
 * -------------------------------------------------------------------------------------------------
 * Instead of loading frames sequentially or at fixed intervals, we use a binary approach:
 * 1. Load first and last frame (indices 0 and frameCount-1)
 * 2. Load the middle frame (frameCount/2)
 * 3. Load the middles of each half (frameCount/4 and 3*frameCount/4)
 * 4. Continue recursively until all frames are loaded
 *
 * This ensures the animation is visible from start to end early, but at low framerate
 * initially, with increasing smoothness as more frames load.
 * -------------------------------------------------------------------------------------------------*/

function generateBinaryLoadOrder(frameCount: number): number[] {
  if (frameCount <= 0) return []
  if (frameCount === 1) return [0]
  if (frameCount === 2) return [0, 1]

  const loadOrder: number[] = []
  const visited = new Set<number>()

  // Start with first and last
  const queue: Array<[number, number]> = [[0, frameCount - 1]]

  // Add first and last to load order
  loadOrder.push(0)
  visited.add(0)
  loadOrder.push(frameCount - 1)
  visited.add(frameCount - 1)

  // Process intervals in breadth-first manner
  while (queue.length > 0) {
    const [start, end] = queue.shift()!

    if (end - start <= 1) continue

    const mid = Math.floor((start + end) / 2)

    if (!visited.has(mid)) {
      loadOrder.push(mid)
      visited.add(mid)
    }

    // Add sub-intervals to queue
    queue.push([start, mid])
    queue.push([mid, end])
  }

  return loadOrder
}

/* -------------------------------------------------------------------------------------------------
 * useSequence Hook
 * -------------------------------------------------------------------------------------------------*/

export function useSequence({
  frameCount,
  getImagePath,
  preload = true,
  onFrameLoad,
  onAllFramesLoaded,
}: UseSequenceOptions): UseSequenceReturn {
  const imagesRef = React.useRef<Map<number, HTMLImageElement>>(new Map())
  const loadingRef = React.useRef<Set<number>>(new Set())
  const hasStartedLoadingRef = React.useRef(false)
  const getImagePathRef = React.useRef(getImagePath)
  const onFrameLoadRef = React.useRef(onFrameLoad)
  const onAllFramesLoadedRef = React.useRef(onAllFramesLoaded)

  React.useEffect(() => {
    getImagePathRef.current = getImagePath
    onFrameLoadRef.current = onFrameLoad
    onAllFramesLoadedRef.current = onAllFramesLoaded
  })

  const [state, setState] = React.useState<SequenceState>({
    images: new Map(),
    initialFramesLoaded: false,
    loadedCount: 0,
    frameCount,
  })

  // Generate binary load order once
  const loadOrder = React.useMemo(
    () => generateBinaryLoadOrder(frameCount),
    [frameCount]
  )

  // Load a single image
  const loadImage = React.useCallback(
    async (frameIndex: number): Promise<HTMLImageElement | null> => {
      // Skip if already loaded or currently loading
      if (
        imagesRef.current.has(frameIndex) ||
        loadingRef.current.has(frameIndex)
      ) {
        return imagesRef.current.get(frameIndex) ?? null
      }

      loadingRef.current.add(frameIndex)

      try {
        const url = getImagePathRef.current(frameIndex)
        const image = new Image()

        await new Promise<void>((resolve, reject) => {
          const handleLoad = () => {
            image.removeEventListener('load', handleLoad)
            image.removeEventListener('error', handleError)
            resolve()
          }
          const handleError = () => {
            image.removeEventListener('load', handleLoad)
            image.removeEventListener('error', handleError)
            reject(new Error(`Failed to load image: ${url}`))
          }
          image.addEventListener('load', handleLoad)
          image.addEventListener('error', handleError)
          image.src = url
        })

        imagesRef.current.set(frameIndex, image)
        loadingRef.current.delete(frameIndex)

        // Update state
        setState((prev) => {
          const newImages = new Map(prev.images)
          newImages.set(frameIndex, image)

          const newLoadedCount = newImages.size
          const initialFramesLoaded =
            newImages.has(0) && newImages.has(frameCount - 1)

          return {
            ...prev,
            images: newImages,
            loadedCount: newLoadedCount,
            initialFramesLoaded,
          }
        })

        onFrameLoadRef.current?.(frameIndex, image)

        return image
      } catch (error) {
        loadingRef.current.delete(frameIndex)
        console.error(`Failed to load frame ${frameIndex}:`, error)
        return null
      }
    },
    [frameCount]
  )

  // Load all frames in binary order
  const loadAllFrames = React.useCallback(async () => {
    if (hasStartedLoadingRef.current) return
    hasStartedLoadingRef.current = true

    // Load frames in binary order, but process in batches for better performance
    const batchSize = 4
    for (let i = 0; i < loadOrder.length; i += batchSize) {
      const batch = loadOrder.slice(i, i + batchSize)
      await Promise.all(batch.map((frameIndex) => loadImage(frameIndex)))
    }

    onAllFramesLoadedRef.current?.()
  }, [loadOrder, loadImage])

  // Start preloading on mount if enabled
  React.useEffect(() => {
    const loading = loadingRef.current
    const images = imagesRef.current

    if (preload) {
      loadAllFrames()
    }

    return () => {
      // Cleanup: reset loading state and cancel any pending loads
      hasStartedLoadingRef.current = false
      loading.clear()
      images.forEach((img) => {
        img.src = ''
      })
      images.clear()
    }
  }, [preload, loadAllFrames])

  // Utility functions
  const getFrame = React.useCallback(
    (frameIndex: number) => imagesRef.current.get(frameIndex),
    []
  )

  const getFrameIndexByProgress = React.useCallback(
    (progress: number) => {
      const clampedProgress = Math.max(0, Math.min(1, progress))
      return Math.floor(clampedProgress * (frameCount - 1))
    },
    [frameCount]
  )

  const getFrameByProgress = React.useCallback(
    (progress: number) => {
      const frameIndex = getFrameIndexByProgress(progress)
      return imagesRef.current.get(frameIndex)
    },
    [getFrameIndexByProgress]
  )

  const isFrameLoaded = React.useCallback(
    (frameIndex: number) => imagesRef.current.has(frameIndex),
    []
  )

  return {
    state,
    getFrame,
    getFrameIndexByProgress,
    getFrameByProgress,
    isFrameLoaded,
    loadAllFrames,
  }
}

/* -------------------------------------------------------------------------------------------------
 * CanvasSequence Component
 * -------------------------------------------------------------------------------------------------
 * Renders an image sequence to a canvas element. This approach:
 * - Decodes images at paint time (prevents half-decoded visible images)
 * - Blocks rendering until the required frame is available
 * - Provides smoother playback than toggling img visibility
 * -------------------------------------------------------------------------------------------------*/

interface CanvasSequenceProps extends Omit<
  React.HTMLAttributes<HTMLCanvasElement>,
  'children'
> {
  /** Total number of frames in the sequence */
  frameCount: number
  /** Duration of each frame in milliseconds */
  frameDuration: number
  /** Function to generate the image path for a given frame index */
  getImagePath: (frameIndex: number) => string
  /** Whether the animation is currently playing */
  isPlaying?: boolean
  /** Whether the canvas should be visible */
  isVisible?: boolean
  /** Whether to loop the animation */
  loop?: boolean
  /** Whether to preload images */
  preload?: boolean
  /** Canvas width */
  width: number
  /** Canvas height */
  height: number
  /** Object fit behavior */
  objectFit?: 'contain' | 'cover' | 'fill'
  /** Callback when a frame is rendered */
  onFrameChange?: (frameIndex: number) => void
  /** Callback when all frames are loaded */
  onAllFramesLoaded?: () => void
  /** Transform time delta (for speed control) */
  timeTransform?: (deltaTime: number) => number
  /** Device pixel ratio for high-DPI displays */
  devicePixelRatio?: number
  /** Reset animation to frame 0 when playback starts */
  resetOnPlay?: boolean
}

export function CanvasSequence({
  frameCount,
  frameDuration,
  getImagePath,
  isPlaying = true,
  isVisible = true,
  loop = true,
  preload = true,
  width,
  height,
  objectFit = 'contain',
  onFrameChange,
  onAllFramesLoaded,
  timeTransform,
  devicePixelRatio,
  resetOnPlay = false,
  className,
  style,
  ...props
}: CanvasSequenceProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const ctxRef = React.useRef<CanvasRenderingContext2D | null>(null)
  const currentFrameRef = React.useRef<number>(-1)
  const timePassedRef = React.useRef<number>(0)
  const animationFrameRef = React.useRef<number | null>(null)
  const lastTimeRef = React.useRef<number | null>(null)
  const wasPlayingRef = React.useRef<boolean>(isPlaying)
  const onFrameChangeRef = React.useRef(onFrameChange)
  const timeTransformRef = React.useRef(timeTransform)

  React.useEffect(() => {
    onFrameChangeRef.current = onFrameChange
    timeTransformRef.current = timeTransform
  })

  const totalDuration = frameCount * frameDuration

  // Use the sequence hook
  const { state, getFrame, getFrameIndexByProgress } = useSequence({
    frameCount,
    getImagePath,
    preload,
    onAllFramesLoaded,
  })

  // Get actual pixel ratio
  const dpr =
    devicePixelRatio ??
    (typeof window !== 'undefined' ? window.devicePixelRatio : 1)

  // Setup canvas context
  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Set canvas size accounting for device pixel ratio
    canvas.width = width * dpr
    canvas.height = height * dpr

    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.scale(dpr, dpr)
      ctxRef.current = ctx
    }
  }, [width, height, dpr])

  // Paint a frame to the canvas
  const paintFrame = React.useCallback(
    (frameIndex: number) => {
      const ctx = ctxRef.current
      const canvas = canvasRef.current
      if (!ctx || !canvas) return false

      const image = getFrame(frameIndex)
      if (!image) return false

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Calculate draw dimensions based on object-fit
      let drawX = 0
      let drawY = 0
      let drawWidth = width
      let drawHeight = height

      const imageAspect = image.naturalWidth / image.naturalHeight
      const canvasAspect = width / height

      if (objectFit === 'contain') {
        if (imageAspect > canvasAspect) {
          drawHeight = width / imageAspect
          drawY = (height - drawHeight) / 2
        } else {
          drawWidth = height * imageAspect
          drawX = (width - drawWidth) / 2
        }
      } else if (objectFit === 'cover') {
        if (imageAspect > canvasAspect) {
          drawWidth = height * imageAspect
          drawX = (width - drawWidth) / 2
        } else {
          drawHeight = width / imageAspect
          drawY = (height - drawHeight) / 2
        }
      }
      // 'fill' uses default full canvas dimensions

      ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight)

      if (currentFrameRef.current !== frameIndex) {
        currentFrameRef.current = frameIndex
        onFrameChangeRef.current?.(frameIndex)
      }

      return true
    },
    [getFrame, width, height, objectFit]
  )

  // Find the closest available frame (for when exact frame isn't loaded yet)
  const findClosestLoadedFrame = React.useCallback(
    (targetFrame: number): number | null => {
      if (state.images.has(targetFrame)) return targetFrame

      // Search outward from target frame
      for (let offset = 1; offset < frameCount; offset++) {
        const before = targetFrame - offset
        const after = targetFrame + offset

        if (before >= 0 && state.images.has(before)) return before
        if (after < frameCount && state.images.has(after)) return after
      }

      return null
    },
    [state.images, frameCount]
  )

  // Animation loop
  React.useEffect(() => {
    if (!isPlaying || !isVisible) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      lastTimeRef.current = null
      return
    }

    // Wait for initial frames to be loaded before starting animation
    if (!state.initialFramesLoaded) return

    const tick = (timestamp: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp
        animationFrameRef.current = requestAnimationFrame(tick)
        return
      }

      let deltaTime = timestamp - lastTimeRef.current
      lastTimeRef.current = timestamp

      // Apply time transform if provided
      if (timeTransformRef.current) {
        deltaTime = timeTransformRef.current(deltaTime)
      }

      timePassedRef.current += deltaTime

      // Calculate progress
      let progress: number
      if (loop) {
        progress = (timePassedRef.current % totalDuration) / totalDuration
      } else {
        progress = Math.min(timePassedRef.current / totalDuration, 1)
      }

      const targetFrame = getFrameIndexByProgress(progress)
      const frameToRender = findClosestLoadedFrame(targetFrame)

      if (frameToRender !== null) {
        paintFrame(frameToRender)
      }

      // Continue animation if looping or not finished
      if (loop || progress < 1) {
        animationFrameRef.current = requestAnimationFrame(tick)
      }
    }

    animationFrameRef.current = requestAnimationFrame(tick)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }
  }, [
    isPlaying,
    isVisible,
    loop,
    state.initialFramesLoaded,
    totalDuration,
    getFrameIndexByProgress,
    findClosestLoadedFrame,
    paintFrame,
  ])

  // Reset animation when sequence config changes
  React.useEffect(() => {
    timePassedRef.current = 0
    currentFrameRef.current = -1
    lastTimeRef.current = null
  }, [frameCount, frameDuration])

  // Reset animation when playback starts (if resetOnPlay is enabled)
  React.useEffect(() => {
    const wasPlaying = wasPlayingRef.current
    wasPlayingRef.current = isPlaying

    if (resetOnPlay && isPlaying && !wasPlaying) {
      timePassedRef.current = 0
      currentFrameRef.current = -1
      lastTimeRef.current = null
    }
  }, [isPlaying, resetOnPlay])

  // Paint first frame when available (for non-playing state)
  React.useEffect(() => {
    if (!isPlaying && state.images.has(0)) {
      paintFrame(0)
    }
  }, [isPlaying, state.images, paintFrame])

  return (
    <canvas
      ref={canvasRef}
      className={cn('block', !isVisible && 'opacity-0', className)}
      style={{
        width,
        height,
        ...style,
      }}
      {...props}
    />
  )
}
