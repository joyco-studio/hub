'use client'

import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { Euler, Vector3 } from 'three'
import { useDebugBindings, useDebugState } from '@/registry/lib/debug'

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

  // Initialise yaw/pitch from current camera orientation
  useEffect(() => {
    const euler = new Euler()
    euler.setFromQuaternion(camera.quaternion, 'YXZ')
    yawRef.current = euler.y
    pitchRef.current = euler.x
  }, [camera])

  // Pointer lock + mouse look
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

  // Keyboard
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

  // Apply rotation + movement each frame
  useFrame((_, delta) => {
    const keys = keysRef.current

    // Rotation — YXZ order, Z is always 0 (no roll)
    camera.rotation.set(pitchRef.current, yawRef.current, 0, 'YXZ')

    // Movement relative to camera heading
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

export function DebugFlyControls() {
  const [targetRef, folder, store] = useDebugBindings('Canvas', {
    flyControls: false,
  })

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.code === 'KeyF') {
        e.preventDefault()
        const next = !targetRef.current.flyControls
        targetRef.current.flyControls = next
        store.setState({ flyControls: next })
        folder?.refresh()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [targetRef, folder, store])

  const flyControlsEnabled = useDebugState(store, (s) => s.flyControls)

  if (!flyControlsEnabled) return null

  return <ActiveFlyControls />
}
