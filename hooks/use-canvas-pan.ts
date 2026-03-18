'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface Point {
  x: number
  y: number
}

const DRAG_THRESHOLD = 5
const FRICTION = 0.92
const MIN_VELOCITY = 0.5

export function useCanvasPan(initialOffset: Point = { x: 0, y: 0 }) {
  const [offset, setOffset] = useState<Point>(initialOffset)
  const [isDragging, setIsDragging] = useState(false)

  const offsetRef = useRef<Point>(initialOffset)
  const contentRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const lastPointerPos = useRef<Point>({ x: 0, y: 0 })
  const isPointerDown = useRef(false)
  const didDrag = useRef(false)
  const dragDistance = useRef(0)
  const activePointerId = useRef<number | null>(null)
  const rafId = useRef<number>(0)
  const inertiaId = useRef<number>(0)
  const velocity = useRef<Point>({ x: 0, y: 0 })
  const lastMoveTime = useRef(0)

  const applyTransform = useCallback(() => {
    if (contentRef.current) {
      contentRef.current.style.transform = `translate(${offsetRef.current.x}px, ${offsetRef.current.y}px)`
    }
    if (containerRef.current) {
      containerRef.current.style.backgroundPosition = `${offsetRef.current.x % 24}px ${offsetRef.current.y % 24}px`
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

  const stopInertia = useCallback(() => {
    if (inertiaId.current) {
      cancelAnimationFrame(inertiaId.current)
      inertiaId.current = 0
    }
  }, [])

  const startInertia = useCallback(() => {
    const step = () => {
      velocity.current.x *= FRICTION
      velocity.current.y *= FRICTION

      if (
        Math.abs(velocity.current.x) < MIN_VELOCITY &&
        Math.abs(velocity.current.y) < MIN_VELOCITY
      ) {
        inertiaId.current = 0
        setOffset({ ...offsetRef.current })
        return
      }

      offsetRef.current = {
        x: offsetRef.current.x + velocity.current.x,
        y: offsetRef.current.y + velocity.current.y,
      }
      applyTransform()
      syncStateThrottled()
      inertiaId.current = requestAnimationFrame(step)
    }

    inertiaId.current = requestAnimationFrame(step)
  }, [applyTransform, syncStateThrottled])

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return
      stopInertia()
      lastPointerPos.current = { x: e.clientX, y: e.clientY }
      isPointerDown.current = true
      activePointerId.current = e.pointerId
      didDrag.current = false
      dragDistance.current = 0
      velocity.current = { x: 0, y: 0 }
      lastMoveTime.current = e.timeStamp
    },
    [stopInertia]
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isPointerDown.current || e.pointerId !== activePointerId.current)
        return

      const deltaX = e.clientX - lastPointerPos.current.x
      const deltaY = e.clientY - lastPointerPos.current.y
      lastPointerPos.current = { x: e.clientX, y: e.clientY }

      const dt = e.timeStamp - lastMoveTime.current
      lastMoveTime.current = e.timeStamp
      if (dt > 0 && dt < 100) {
        const factor = 16 / dt
        velocity.current = { x: deltaX * factor, y: deltaY * factor }
      }

      dragDistance.current += Math.abs(deltaX) + Math.abs(deltaY)

      if (dragDistance.current > DRAG_THRESHOLD) {
        if (!didDrag.current) {
          didDrag.current = true
          containerRef.current?.setPointerCapture(e.pointerId)
          setIsDragging(true)
        }

        offsetRef.current = {
          x: offsetRef.current.x + deltaX,
          y: offsetRef.current.y + deltaY,
        }
        applyTransform()
        syncStateThrottled()
      }
    },
    [applyTransform, syncStateThrottled]
  )

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isPointerDown.current) return
      isPointerDown.current = false
      activePointerId.current = null

      if (didDrag.current) {
        containerRef.current?.releasePointerCapture(e.pointerId)
        setIsDragging(false)

        const timeSinceLastMove = e.timeStamp - lastMoveTime.current
        if (
          timeSinceLastMove < 100 &&
          (Math.abs(velocity.current.x) > MIN_VELOCITY ||
            Math.abs(velocity.current.y) > MIN_VELOCITY)
        ) {
          startInertia()
        } else {
          setOffset({ ...offsetRef.current })
        }
      }
    },
    [startInertia]
  )

  const onClickCapture = useCallback((e: React.MouseEvent) => {
    if (didDrag.current) {
      e.preventDefault()
      e.stopPropagation()
    }
  }, [])

  const resetView = useCallback(
    (target: Point) => {
      stopInertia()
      offsetRef.current = { ...target }
      applyTransform()
      setOffset({ ...target })
    },
    [applyTransform, stopInertia]
  )

  useEffect(() => {
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current)
      if (inertiaId.current) cancelAnimationFrame(inertiaId.current)
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
