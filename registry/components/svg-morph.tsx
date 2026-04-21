'use client'

import { useEffect, useRef } from 'react'
import { interpolate } from 'flubber'
import { animate, motion, useMotionValue, useTransform } from 'motion/react'

type FlubberInterpolator = (t: number) => string

interface MorphPathProps {
  paths: string[]
  duration: number
  fill: string
  step: number
}

function MorphPath({ paths, duration, fill, step }: MorphPathProps) {
  const safeStep = Math.max(0, Math.min(step, paths.length - 1))
  const initialPath = paths[safeStep] ?? ''

  const progress = useMotionValue(0)
  const currentPathRef = useRef(initialPath)
  const interpolatorRef = useRef<FlubberInterpolator | null>(null)

  const d = useTransform(progress, (v: number) => {
    if (!interpolatorRef.current) return currentPathRef.current
    return interpolatorRef.current(v)
  })

  useEffect(() => {
    const targetPath = paths[safeStep]
    if (!targetPath || targetPath === currentPathRef.current) return

    const p = progress.get()
    if (interpolatorRef.current && p > 0 && p < 1) {
      currentPathRef.current = interpolatorRef.current(p)
    }

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
  }, [safeStep, duration, progress, paths])

  if (paths.length === 0) return null

  return <motion.path fill={fill} d={d} />
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
  duration = 0.4,
  step = 0,
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
        <MorphPath
          key={i}
          paths={svg.paths}
          fill={svg.fill ?? 'currentColor'}
          duration={duration}
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
