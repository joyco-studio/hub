'use client'

import { OrbitControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import { Euler, Vector3 } from 'three'
import { useDebugBindings, useDebugState } from '@/registry/lib/debug'

function ActiveOrbitControls() {
  const camera = useThree((s) => s.camera)
  const gl = useThree((s) => s.gl)
  const targetRef = useRef(new Vector3())

  const [target] = useState(() => {
    if (camera.userData.target instanceof Vector3) {
      return targetRef.current.copy(camera.userData.target)
    }
    const dir = new Vector3()
    camera.getWorldDirection(dir)
    return targetRef.current.copy(camera.position).add(dir.multiplyScalar(20))
  })

  useEffect(() => {
    const canvas = gl.domElement
    canvas.style.pointerEvents = 'auto'
    return () => {
      canvas.style.pointerEvents = ''
    }
  }, [gl])

  return <OrbitControls target={target} makeDefault />
}

const HALF_PI = Math.PI / 2
const _forward = new Vector3()
const _right = new Vector3()

function ActiveFlyControls() {
  const camera = useThree((s) => s.camera)
  const gl = useThree((s) => s.gl)
  const yawRef = useRef(0)
  const pitchRef = useRef(0)
  const keysRef = useRef({ w: false, a: false, s: false, d: false, space: false, shift: false })
  const speed = 3
  const sprintMultiplier = 5
  const sensitivity = 0.002

  useEffect(() => {
    const euler = new Euler()
    euler.setFromQuaternion(camera.quaternion, 'YXZ')
    yawRef.current = euler.y
    pitchRef.current = euler.x
  }, [camera])

  useEffect(() => {
    const canvas = gl.domElement
    canvas.style.pointerEvents = 'auto'

    const onClick = () => canvas.requestPointerLock()

    const onMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement !== canvas) return
      yawRef.current -= e.movementX * sensitivity
      pitchRef.current -= e.movementY * sensitivity
      pitchRef.current = Math.max(-HALF_PI, Math.min(HALF_PI, pitchRef.current))
    }

    canvas.addEventListener('click', onClick)
    document.addEventListener('mousemove', onMouseMove)

    return () => {
      canvas.removeEventListener('click', onClick)
      document.removeEventListener('mousemove', onMouseMove)
      if (document.pointerLockElement === canvas) document.exitPointerLock()
      canvas.style.pointerEvents = ''
    }
  }, [gl])

  useEffect(() => {
    const keys = keysRef.current

    const set = (e: KeyboardEvent, pressed: boolean) => {
      switch (e.code) {
        case 'KeyW':
          keys.w = pressed
          break
        case 'KeyA':
          keys.a = pressed
          break
        case 'KeyS':
          keys.s = pressed
          break
        case 'KeyD':
          keys.d = pressed
          break
        case 'Space':
          e.preventDefault()
          keys.space = pressed
          break
        case 'ShiftLeft':
        case 'ShiftRight':
          keys.shift = pressed
          break
      }
    }

    const onDown = (e: KeyboardEvent) => set(e, true)
    const onUp = (e: KeyboardEvent) => set(e, false)

    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
    }
  }, [])

  useFrame((_, delta) => {
    const keys = keysRef.current

    camera.rotation.set(pitchRef.current, yawRef.current, 0, 'YXZ')

    camera.getWorldDirection(_forward)
    _right.crossVectors(_forward, camera.up).normalize()

    const step = speed * (keys.shift ? sprintMultiplier : 1) * delta
    if (keys.w) camera.position.addScaledVector(_forward, step)
    if (keys.s) camera.position.addScaledVector(_forward, -step)
    if (keys.a) camera.position.addScaledVector(_right, -step)
    if (keys.d) camera.position.addScaledVector(_right, step)
    if (keys.space) camera.position.y += step
  })

  return null
}

export function DebugControls() {
  const [targetRef, , store] = useDebugBindings('Canvas', {
    orbitControls: false,
    flyControls: false,
  })

  // Mutual exclusion: enabling one disables the other
  useEffect(() => {
    return store.subscribe((state, prev) => {
      if (state.orbitControls && !prev.orbitControls && state.flyControls) {
        targetRef.current.flyControls = false
      } else if (state.flyControls && !prev.flyControls && state.orbitControls) {
        targetRef.current.orbitControls = false
      }
    })
  }, [store, targetRef])

  // Alt+F keyboard toggle for fly controls
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.code === 'KeyF') {
        e.preventDefault()
        targetRef.current.flyControls = !targetRef.current.flyControls
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [targetRef])

  const orbit = useDebugState(store, (s) => s.orbitControls)
  const fly = useDebugState(store, (s) => s.flyControls)

  return (
    <>
      {orbit && <ActiveOrbitControls />}
      {fly && <ActiveFlyControls />}
    </>
  )
}
