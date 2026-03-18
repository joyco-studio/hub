'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { Euler } from 'three'
import { useDebugFolder } from '@/registry/lib/debug'

const RAD2DEG = 180 / Math.PI
const _euler = new Euler()

export function DebugCameraMonitor() {
  const folder = useDebugFolder('Canvas')
  const camera = useThree((s) => s.camera)
  const paramsRef = useRef({
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
  })
  const bindingsRef = useRef<{ dispose(): void }[]>([])

  useEffect(() => {
    if (!folder) return

    const fmt = (v: number) => v.toFixed(2)
    const pos = folder.addBinding(paramsRef.current, 'position', {
      label: 'cam pos',
      x: { format: fmt },
      y: { format: fmt },
      z: { format: fmt },
    })
    const rot = folder.addBinding(paramsRef.current, 'rotation', {
      label: 'cam rot',
      x: { format: fmt },
      y: { format: fmt },
      z: { format: fmt },
    })

    bindingsRef.current = [pos, rot]

    return () => {
      pos.dispose()
      rot.dispose()
      bindingsRef.current = []
    }
  }, [folder])

  useFrame(() => {
    const p = paramsRef.current.position
    const r = paramsRef.current.rotation

    p.x = camera.position.x
    p.y = camera.position.y
    p.z = camera.position.z

    _euler.setFromQuaternion(camera.quaternion)
    r.x = _euler.x * RAD2DEG
    r.y = _euler.y * RAD2DEG
    r.z = _euler.z * RAD2DEG

    for (const b of bindingsRef.current) {
      ;(b as unknown as { refresh(): void }).refresh()
    }
  })

  return null
}
