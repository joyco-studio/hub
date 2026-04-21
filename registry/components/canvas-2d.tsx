'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface UseCanvas2DParams {
  maxDpr?: number
}

function useCanvas2D({ maxDpr = 2 }: UseCanvas2DParams = {}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [ctx, setCtx] = React.useState<CanvasRenderingContext2D | null>(null)
  const [dpr, setDpr] = React.useState(1)
  const [size, setSize] = React.useState({ width: 0, height: 0 })

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext('2d')
    if (context) setCtx(context)

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return
      const { width, height } = entry.contentRect
      setSize({
        width: Math.max(0, Math.floor(width)),
        height: Math.max(0, Math.floor(height)),
      })
    })

    observer.observe(canvas)
    return () => observer.disconnect()
  }, [])

  const { width, height } = size

  React.useLayoutEffect(() => {
    setDpr(Math.min(window.devicePixelRatio, maxDpr))
  }, [width, height, maxDpr])

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !ctx || width <= 0 || height <= 0) return
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }, [ctx, width, height, dpr])

  return [canvasRef, { ctx, width, height, dpr }] as const
}

interface Canvas2DProps extends React.CanvasHTMLAttributes<HTMLCanvasElement> {
  /** Maximum device pixel ratio. Defaults to 2. */
  maxDpr?: number
  /** Called every time the canvas resizes or first becomes available. */
  onContext?: (state: {
    ctx: CanvasRenderingContext2D
    width: number
    height: number
    dpr: number
  }) => void | (() => void)
}

const Canvas2D = React.forwardRef<HTMLCanvasElement, Canvas2DProps>(
  ({ maxDpr, onContext, className, style, ...props }, ref) => {
    const [canvasRef, state] = useCanvas2D({ maxDpr })
    const cleanupRef = React.useRef<(() => void) | void>(undefined)

    React.useImperativeHandle(ref, () => canvasRef.current!)

    React.useEffect(() => {
      if (!state.ctx || state.width <= 0 || state.height <= 0) return
      cleanupRef.current?.()
      cleanupRef.current = onContext?.({
        ctx: state.ctx,
        width: state.width,
        height: state.height,
        dpr: state.dpr,
      })
      return () => {
        cleanupRef.current?.()
        cleanupRef.current = undefined
      }
    }, [onContext, state.ctx, state.width, state.height, state.dpr])

    return (
      <canvas
        ref={canvasRef}
        className={cn(className)}
        style={{ ...style }}
        {...props}
      />
    )
  }
)
Canvas2D.displayName = 'Canvas2D'

export { Canvas2D, useCanvas2D }
export type { Canvas2DProps, UseCanvas2DParams }
