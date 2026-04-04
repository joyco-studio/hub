'use client'

import { useCallback } from 'react'
import { Canvas2D } from '@/registry/components/canvas-2d'

function Canvas2DDemo() {
  const onContext = useCallback(
    ({
      ctx,
      width,
      height,
    }: {
      ctx: CanvasRenderingContext2D
      width: number
      height: number
    }) => {
      let raf: number

      const primary = getComputedStyle(document.documentElement)
        .getPropertyValue('--primary')
        .trim()

      const cols = 24
      const rows = 16
      const cellW = width / cols
      const cellH = height / rows

      function draw(t: number) {
        ctx.clearRect(0, 0, width, height)

        for (let x = 0; x < cols; x++) {
          for (let y = 0; y < rows; y++) {
            const cx = x * cellW + cellW / 2
            const cy = y * cellH + cellH / 2

            const phase =
              Math.sin(x * 0.3 + t * 0.002) *
                Math.cos(y * 0.3 + t * 0.0015) *
                0.5 +
              0.5

            const radius = phase * Math.min(cellW, cellH) * 0.35 + 1

            ctx.beginPath()
            ctx.arc(cx, cy, radius, 0, Math.PI * 2)
            ctx.fillStyle = `oklch(from ${primary} l c h / ${0.15 + phase * 0.65})`
            ctx.fill()
          }
        }

        raf = requestAnimationFrame(draw)
      }

      raf = requestAnimationFrame(draw)
      return () => cancelAnimationFrame(raf)
    },
    []
  )

  return (
    <Canvas2D
      className="bg-background aspect-video w-full"
      onContext={onContext}
    />
  )
}

export default Canvas2DDemo
