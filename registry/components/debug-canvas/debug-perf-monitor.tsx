'use client'

import { useEffect, useRef } from 'react'
import { useDebugBindings, useDebugState } from '@/registry/lib/debug'
import Stats from 'stats-gl'
import { useFrame, useThree } from '@react-three/fiber'

type Panel = InstanceType<typeof Stats.Panel>

export function DebugPerfMonitor() {
  const [, , store] = useDebugBindings('Canvas', { perfMonitor: false })
  const enabled = useDebugState(store, (s) => s.perfMonitor)

  if (!enabled) return null

  return <PerfMonitorGL />
}

function PerfMonitorGL() {
  const gl = useThree((s) => s.gl)
  const statsRef = useRef<Stats | null>(null)
  const trianglesPanelRef = useRef<Panel | null>(null)
  const callsPanelRef = useRef<Panel | null>(null)
  const maxTrianglesRef = useRef(0)
  const maxCallsRef = useRef(0)
  const prevTrianglesRef = useRef(0)
  const prevCallsRef = useRef(0)

  useEffect(() => {
    const stats = new Stats({
      trackHz: true,
      trackFPS: true,
    })

    let cancelled = false

    const setup = async () => {
      await stats.init(gl)
      if (cancelled) return

      const trianglesPanel = stats.addPanel(new Stats.Panel('TRI', '#f80', '#210'))
      const callsPanel = stats.addPanel(new Stats.Panel('CALL', '#e08', '#201'))

      stats.dom.style.cssText = `
        position: fixed;
        bottom: 0;
        right: 0;
        z-index: 10000;
        opacity: 0.9;
        display: flex;
        pointer-events: auto;
      `

      const vsyncCanvas = (stats as unknown as { vsyncPanel?: { canvas: HTMLElement } }).vsyncPanel?.canvas

      const applyFlexLayout = () => {
        for (const child of Array.from(stats.dom.children) as HTMLElement[]) {
          if (child === vsyncCanvas) continue
          child.style.position = 'relative'
          child.style.top = 'auto'
          child.style.left = 'auto'
        }
      }

      applyFlexLayout()
      window.addEventListener('resize', applyFlexLayout)

      document.body.appendChild(stats.dom)
      statsRef.current = stats
      trianglesPanelRef.current = trianglesPanel
      callsPanelRef.current = callsPanel

      return applyFlexLayout
    }

    const cleanupP = setup()

    return () => {
      cancelled = true
      statsRef.current = null
      trianglesPanelRef.current = null
      callsPanelRef.current = null
      cleanupP.then((applyFlexLayout) => {
        if (applyFlexLayout) window.removeEventListener('resize', applyFlexLayout)
        stats.dom.remove()
        stats.dispose()
      }).catch(() => {
        // init failed — nothing was appended, nothing to clean up
      })
    }
  }, [gl])

  useFrame(() => {
    const info = gl.info
    prevTrianglesRef.current = info?.render?.triangles ?? 0
    prevCallsRef.current = info?.render?.calls ?? 0

    statsRef.current?.begin()
  }, -Infinity)

  useFrame(() => {
    const info = gl.info
    const triangles = (info?.render?.triangles ?? 0) - prevTrianglesRef.current
    const calls = (info?.render?.calls ?? 0) - prevCallsRef.current

    maxTrianglesRef.current = Math.max(maxTrianglesRef.current, triangles)
    maxCallsRef.current = Math.max(maxCallsRef.current, calls)

    trianglesPanelRef.current?.update(triangles, maxTrianglesRef.current)
    trianglesPanelRef.current?.updateGraph(triangles, maxTrianglesRef.current)

    callsPanelRef.current?.update(calls, maxCallsRef.current)
    callsPanelRef.current?.updateGraph(calls, maxCallsRef.current)

    statsRef.current?.end()
    statsRef.current?.update()
  }, Infinity)

  return null
}
