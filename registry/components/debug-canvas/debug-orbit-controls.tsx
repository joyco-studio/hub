'use client'

import { OrbitControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import { Vector3 } from 'three'
import { useDebugBindings, useDebugState } from '@/registry/lib/debug'

function ActiveOrbitControls() {
  const camera = useThree((s) => s.camera)
  const gl = useThree((s) => s.gl)
  const targetRef = useRef(new Vector3())

  // Read the camera's known target, or fall back to projecting along its direction
  const [target] = useState(() => {
    if (camera.userData.target instanceof Vector3) {
      return targetRef.current.copy(camera.userData.target)
    }
    const dir = new Vector3()
    camera.getWorldDirection(dir)
    return targetRef.current.copy(camera.position).add(dir.multiplyScalar(20))
  })

  // Enable pointer events on the canvas while orbit controls are active
  useEffect(() => {
    const canvas = gl.domElement
    canvas.style.pointerEvents = 'auto'
    return () => {
      canvas.style.pointerEvents = ''
    }
  }, [gl])

  return <OrbitControls target={target} makeDefault />
}

export function DebugOrbitControls() {
  const [, , store] = useDebugBindings('Canvas', {
    orbitControls: false,
  })

  const orbitControlsEnabled = useDebugState(store, (s) => s.orbitControls)

  if (!orbitControlsEnabled) return null

  return <ActiveOrbitControls />
}
