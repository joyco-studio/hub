'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { interpolate } from 'flubber'
import { animate, motion, useMotionValue, useTransform } from 'motion/react'

type FlubberInterpolator = (t: number) => string

interface SvgMorphPathProps {
  paths: string[]
  duration?: number
  gap?: number
  fill?: string
  step?: number
}

function AutoMorphPath({
  paths,
  duration,
  gap,
  fill,
}: {
  paths: string[]
  duration: number
  gap: number
  fill: string
}) {
  const [pathIndex, setPathIndex] = useState(0)
  const progress = useMotionValue(pathIndex)

  const loopedPaths = useMemo(() => [...paths, paths[0]], [paths])
  const indices = useMemo(() => loopedPaths.map((_, i) => i), [loopedPaths])
  const d = useTransform(progress, indices, loopedPaths, {
    mixer: (a, b) => interpolate(a, b, { maxSegmentLength: 20 }),
  })

  useEffect(() => {
    const animation = animate(progress, pathIndex, {
      duration,
      ease: 'easeInOut',
      delay: gap,
      onComplete: () => {
        if (pathIndex === loopedPaths.length - 1) {
          progress.set(0)
          setPathIndex(1)
        } else {
          setPathIndex(pathIndex + 1)
        }
      },
    })

    return () => animation.stop()
  }, [pathIndex, duration, gap, loopedPaths, progress])

  return <motion.path fill={fill} d={d} />
}

function ControlledMorphPath({
  paths,
  duration,
  fill,
  step,
}: {
  paths: string[]
  duration: number
  fill: string
  step: number
}) {
  const progress = useMotionValue(0)
  const currentPathRef = useRef(paths[step])
  const interpolatorRef = useRef<FlubberInterpolator | null>(null)

  const d = useTransform(progress, (v: number) => {
    if (!interpolatorRef.current) return currentPathRef.current
    return interpolatorRef.current(v)
  })

  useEffect(() => {
    const targetPath = paths[step]
    if (targetPath === currentPathRef.current) return

    // Capture mid-animation state if interrupted
    const p = progress.get()
    if (interpolatorRef.current && p > 0 && p < 1) {
      currentPathRef.current = interpolatorRef.current(p)
    }

    // Direct interpolation: current visual state → target (skips intermediates)
    interpolatorRef.current = interpolate(
      currentPathRef.current,
      targetPath,
      { maxSegmentLength: 20 }
    )
    progress.set(0)

    const animation = animate(progress, 1, {
      duration,
      ease: 'easeInOut',
      onComplete: () => {
        currentPathRef.current = targetPath
        interpolatorRef.current = null
      },
    })

    return () => animation.stop()
  }, [step, duration, progress, paths])

  return <motion.path fill={fill} d={d} />
}

function SvgMorphPath({
  paths,
  duration = 0.4,
  gap = 0.5,
  fill = 'currentColor',
  step,
}: SvgMorphPathProps) {
  if (step !== undefined) {
    return (
      <ControlledMorphPath
        paths={paths}
        duration={duration}
        fill={fill}
        step={step}
      />
    )
  }

  return (
    <AutoMorphPath
      paths={paths}
      duration={duration}
      gap={gap}
      fill={fill}
    />
  )
}

interface StaticPath {
  d: string
  fill?: string
}

interface SvgMorphProps {
  svgs: {
    paths: string[]
    fill?: string
  }[]
  staticPaths?: StaticPath[]
  viewBox: string
  transform?: string
  duration?: number
  gap?: number
  step?: number
  className?: string
  width?: number | string
  height?: number | string
}

export default function SvgMorph({
  svgs,
  staticPaths,
  viewBox,
  transform,
  duration,
  gap,
  step,
  className,
  width,
  height,
}: SvgMorphProps) {
  const children = (
    <>
      {staticPaths?.map((sp, i) => (
        <path key={`static-${i}`} d={sp.d} fill={sp.fill ?? 'currentColor'} />
      ))}
      {svgs.map((svg, i) => (
        <SvgMorphPath
          key={i}
          paths={svg.paths}
          fill={svg.fill}
          duration={duration}
          gap={gap}
          step={step}
        />
      ))}
    </>
  )

  return (
    <svg
      viewBox={viewBox}
      className={className}
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
    >
      {transform ? <g transform={transform}>{children}</g> : children}
    </svg>
  )
}
