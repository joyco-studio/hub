'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface Point {
  x: number
  y: number
}

const DRAG_THRESHOLD = 5

export function useCanvasPan(initialOffset: Point = { x: 0, y: 0 }) {
  const [offset, setOffset] = useState<Point>(initialOffset)
  const [isDragging, setIsDragging] = useState(false)

  const offsetRef = useRef<Point>(initialOffset)
  const contentRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const lastPointerPos = useRef<Point>({ x: 0, y: 0 })
  const didDrag = useRef(false)
  const dragDistance = useRef(0)
  const rafId = useRef<number>(0)

  const applyTransform = useCallback(() => {
    if (contentRef.current) {
      contentRef.current.style.transform = `translate(${offsetRef.current.x}px, ${offsetRef.current.y}px)`
    }
  }, [])

  const syncStateThrottled = useCallback(() => {
    if (rafId.current) cancelAnimationFrame(rafId.current)
    rafId.current = requestAnimationFrame(() => {
      setOffset({ ...offsetRef.current })
    })
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      offsetRef.current = {
        x: offsetRef.current.x - e.deltaX,
        y: offsetRef.current.y - e.deltaY,
      }
      applyTransform()
      syncStateThrottled()
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => container.removeEventListener('wheel', handleWheel)
  }, [applyTransform, syncStateThrottled])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return
    containerRef.current?.setPointerCapture(e.pointerId)
    lastPointerPos.current = { x: e.clientX, y: e.clientY }
    didDrag.current = false
    dragDistance.current = 0
    setIsDragging(true)
  }, [])

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!e.currentTarget.hasPointerCapture(e.pointerId)) return

      const deltaX = e.clientX - lastPointerPos.current.x
      const deltaY = e.clientY - lastPointerPos.current.y
      lastPointerPos.current = { x: e.clientX, y: e.clientY }

      dragDistance.current += Math.abs(deltaX) + Math.abs(deltaY)
      if (dragDistance.current > DRAG_THRESHOLD) {
        didDrag.current = true
      }

      offsetRef.current = {
        x: offsetRef.current.x + deltaX,
        y: offsetRef.current.y + deltaY,
      }
      applyTransform()
    },
    [applyTransform]
  )

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    containerRef.current?.releasePointerCapture(e.pointerId)
    setIsDragging(false)
    setOffset({ ...offsetRef.current })
  }, [])

  const onClickCapture = useCallback((e: React.MouseEvent) => {
    if (didDrag.current) {
      e.preventDefault()
      e.stopPropagation()
    }
  }, [])

  const resetView = useCallback(
    (target: Point) => {
      offsetRef.current = { ...target }
      applyTransform()
      setOffset({ ...target })
    },
    [applyTransform]
  )

  useEffect(() => {
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [])

  const handlers = {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onClickCapture,
  }

  return { offset, isDragging, containerRef, contentRef, handlers, resetView }
}
