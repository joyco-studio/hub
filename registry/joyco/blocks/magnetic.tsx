'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'
import { useComposedRefs } from '@/lib/compose-refs'

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/

type MagneticContextValue = {
  rootRef: React.RefObject<HTMLElement | null>
  mousePos: React.RefObject<{ x: number; y: number }>
  strength: number
  ease: number
  isHovered: React.RefObject<boolean>
}

/* -------------------------------------------------------------------------------------------------
 * Context
 * -----------------------------------------------------------------------------------------------*/

const MagneticContext = React.createContext<MagneticContextValue | null>(null)

function useMagneticContext() {
  const context = React.useContext(MagneticContext)
  if (!context) {
    throw new Error('Magnetic.Inner must be used within a Magnetic.Root')
  }
  return context
}

/* -------------------------------------------------------------------------------------------------
 * Root
 * -----------------------------------------------------------------------------------------------*/

interface RootProps extends React.ComponentPropsWithRef<'div'> {
  asChild?: boolean
  /** How strongly inner content follows the cursor (0–1) */
  strength?: number
  /** Return-to-center transition duration in ms */
  ease?: number
}

function Root({
  asChild,
  ref: forwardedRef,
  strength = 0.35,
  ease = 350,
  children,
  ...props
}: RootProps) {
  const rootRef = React.useRef<HTMLElement | null>(null)
  const mousePos = React.useRef({ x: 0, y: 0 })
  const isHovered = React.useRef(false)
  const composedRef = useComposedRefs(forwardedRef, rootRef)

  const handleMouseMove = (e: React.MouseEvent) => {
    mousePos.current = { x: e.pageX, y: e.pageY }
    props.onMouseMove?.(e as React.MouseEvent<HTMLDivElement>)
  }

  const handleMouseEnter = (e: React.MouseEvent) => {
    isHovered.current = true
    props.onMouseEnter?.(e as React.MouseEvent<HTMLDivElement>)
  }

  const handleMouseLeave = (e: React.MouseEvent) => {
    isHovered.current = false
    props.onMouseLeave?.(e as React.MouseEvent<HTMLDivElement>)
  }

  const contextValue = React.useMemo<MagneticContextValue>(
    () => ({ rootRef, mousePos, strength, ease, isHovered }),
    [strength, ease]
  )

  const Comp = asChild ? Slot : 'div'

  return (
    <MagneticContext.Provider value={contextValue}>
      <Comp
        ref={composedRef}
        {...props}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </Comp>
    </MagneticContext.Provider>
  )
}

/* -------------------------------------------------------------------------------------------------
 * Inner
 * -----------------------------------------------------------------------------------------------*/

interface InnerProps extends React.ComponentPropsWithRef<'div'> {
  asChild?: boolean
}

function Inner({
  asChild,
  ref: forwardedRef,
  className,
  style,
  ...props
}: InnerProps) {
  const { rootRef, mousePos, strength, ease } = useMagneticContext()
  const innerRef = React.useRef<HTMLElement | null>(null)
  const composedRef = useComposedRefs(forwardedRef, innerRef)
  const rafId = React.useRef<number>(0)
  const current = React.useRef({ x: 0, y: 0 })
  const prefersReducedMotion = React.useRef(false)

  const applyTick = React.useEffectEvent(() => {
    if (prefersReducedMotion.current) return false

    const el = innerRef.current
    const rootEl = rootRef.current
    if (!el || !rootEl) return false

    const rect = rootEl.getBoundingClientRect()
    const centerX = rect.left + window.scrollX + rect.width / 2
    const centerY = rect.top + window.scrollY + rect.height / 2

    const lerpFactor = 0.15
    const targetX = (mousePos.current.x - centerX) * strength
    const targetY = (mousePos.current.y - centerY) * strength

    current.current.x += (targetX - current.current.x) * lerpFactor
    current.current.y += (targetY - current.current.y) * lerpFactor

    el.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0)`

    return true
  })

  const applyLeave = React.useEffectEvent(() => {
    cancelAnimationFrame(rafId.current)

    if (prefersReducedMotion.current) return

    const el = innerRef.current
    if (!el) return

    current.current = { x: 0, y: 0 }
    el.style.transition = `transform ${ease}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`
    el.style.transform = 'translate3d(0, 0, 0)'
  })

  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion.current = mq.matches

    const onChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches
      if (e.matches) {
        cancelAnimationFrame(rafId.current)
        const el = innerRef.current
        if (el) {
          el.style.transform = 'translate3d(0, 0, 0)'
          el.style.transition = ''
        }
      }
    }

    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  React.useEffect(() => {
    const root = rootRef.current
    const inner = innerRef.current
    if (!root || !inner) return

    function tick() {
      if (applyTick()) {
        rafId.current = requestAnimationFrame(tick)
      }
    }

    function handleEnter() {
      if (prefersReducedMotion.current) return

      const el = innerRef.current
      if (!el) return

      el.style.transition = ''
      rafId.current = requestAnimationFrame(tick)
    }

    root.addEventListener('mouseenter', handleEnter)
    root.addEventListener('mouseleave', applyLeave)

    return () => {
      cancelAnimationFrame(rafId.current)
      root.removeEventListener('mouseenter', handleEnter)
      root.removeEventListener('mouseleave', applyLeave)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- applyTick/applyLeave are effect events, rootRef is a stable ref

  const Comp = asChild ? Slot : 'div'

  return (
    <Comp
      ref={composedRef}
      className={cn('will-change-transform', className)}
      style={{ ...style, transform: 'translate3d(0, 0, 0)' }}
      {...props}
    />
  )
}

export { Root, Inner }
