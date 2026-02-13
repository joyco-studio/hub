'use client'

import { useEffect, useState } from 'react'
import { interpolate } from 'flubber'
import { animate, motion, useMotionValue, useTransform } from 'motion/react'

interface SvgMorphPathProps {
  paths: string[]
  duration?: number
  gap?: number
  fill?: string
}

function SvgMorphPath({
  paths,
  duration = 0.4,
  gap = 0.5,
  fill = 'currentColor',
}: SvgMorphPathProps) {
  const [pathIndex, setPathIndex] = useState(0)
  const progress = useMotionValue(pathIndex)

  const loopedPaths = [...paths, paths[0]]
  const indices = loopedPaths.map((_, i) => i)
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
  }, [pathIndex, duration, gap, paths.length, progress])

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
  gap?: number
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
