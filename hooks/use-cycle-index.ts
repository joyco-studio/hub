'use client'

import * as React from 'react'

export interface UseCycleIndexOptions {
  count: number
  delayMs: number
  paused?: boolean
  initialIndex?: number
}

export function useCycleIndex({
  count,
  delayMs,
  paused = false,
  initialIndex = 0,
}: UseCycleIndexOptions): [number, React.Dispatch<React.SetStateAction<number>>] {
  const [index, setIndex] = React.useState(initialIndex)

  React.useEffect(() => {
    if (paused || count <= 0) return
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % count)
    }, delayMs)
    return () => window.clearInterval(id)
  }, [count, delayMs, paused])

  return [index, setIndex]
}
