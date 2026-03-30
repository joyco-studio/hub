'use client'

import * as THREE from 'three/webgpu'
import {
  cos,
  dot,
  float,
  floor,
  fract,
  mix,
  mod,
  select,
  sin,
  smoothstep,
  sqrt,
  sub,
  time,
  uv,
  vec2,
} from 'three/tsl'
import { Canvas, extend, useThree } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'

import { DebugProvider, useDebugBindings } from '@/registry/lib/debug'
import { useUniforms } from '@/hooks/use-uniforms'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
extend(THREE as any)

function GradientMesh() {
  const [ref, folder] = useDebugBindings(
    'Gradient',
    {
      colorA: '#6366f1',
      colorB: '#ec4899',
      colorC: '#facc15',
      angle: 45,
      stripes: 20,
      sharpness: 20.0,
      swirlStrength: 9.0,
      speed: 1.0,
    },
    {
      angle: { min: 0, max: 360, step: 1 },
      stripes: { min: 1, max: 20, step: 1 },
      sharpness: { min: 1, max: 20, step: 0.1 },
      swirlStrength: { min: 0, max: 10, step: 0.1 },
      speed: { min: 0, max: 5, step: 0.1 },
      colorA: { type: 'color' },
      colorB: { type: 'color' },
      colorC: { type: 'color' },
    }
  )

  const [uniforms, setUniforms] = useUniforms({
    uColorA: new THREE.Color(ref.current.colorA),
    uColorB: new THREE.Color(ref.current.colorB),
    uColorC: new THREE.Color(ref.current.colorC),
    uAngle: ref.current.angle,
    uStripes: ref.current.stripes,
    uSharpness: ref.current.sharpness,
    uSwirlStrength: ref.current.swirlStrength,
    uSpeed: ref.current.speed,
  })

  useEffect(() => {
    if (!folder) return
    // eslint-disable-next-line react-hooks/immutability
    folder.expanded = true
    folder.on('change', () => {
      setUniforms({
        uColorA: ref.current.colorA,
        uColorB: ref.current.colorB,
        uColorC: ref.current.colorC,
        uAngle: ref.current.angle,
        uStripes: ref.current.stripes,
        uSharpness: ref.current.sharpness,
        uSwirlStrength: ref.current.swirlStrength,
        uSpeed: ref.current.speed,
      })
    })
  }, [folder, ref, setUniforms])

  const material = useMemo(() => {
    const centered = sub(uv(), vec2(0.5))
    const dist = sqrt(dot(centered, centered))
    const swirlAngle = dist.mul(uniforms.uSwirlStrength).add(time.mul(uniforms.uSpeed).mul(0.3))
    const ca = cos(swirlAngle)
    const sa = sin(swirlAngle)
    const swirled = vec2(
      centered.x.mul(ca).sub(centered.y.mul(sa)),
      centered.x.mul(sa).add(centered.y.mul(ca))
    )

    const rad = uniforms.uAngle.mul(Math.PI / 180)
    const dir = vec2(cos(rad), sin(rad))
    const distorted = dot(swirled, dir).add(0.5)

    const t = smoothstep(
      sub(float(0.5), float(0.5).div(uniforms.uSharpness)),
      float(0.5).add(float(0.5).div(uniforms.uSharpness)),
      fract(distorted.mul(uniforms.uStripes))
    )

    const stripeIdx = mod(floor(distorted.mul(uniforms.uStripes)), float(3))

    const fromColor = select(
      stripeIdx.lessThan(0.5),
      uniforms.uColorA,
      select(stripeIdx.lessThan(1.5), uniforms.uColorB, uniforms.uColorC)
    )
    const toColor = select(
      stripeIdx.lessThan(0.5),
      uniforms.uColorB,
      select(stripeIdx.lessThan(1.5), uniforms.uColorC, uniforms.uColorA)
    )

    const finalColor = mix(fromColor, toColor, t)

    const mat = new THREE.MeshBasicNodeMaterial()
    mat.colorNode = finalColor
    return mat
  }, [uniforms])

  const viewport = useThree((s) => s.viewport)

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry />
      <primitive object={material} attach="material" />
    </mesh>
  )
}

function DebugDemo() {
  return (
    <DebugProvider title="Gradient Debug" position="top-right" enabled>
      <div className="bg-background h-screen w-full">
        <Canvas
          gl={async (props) => {
            const renderer = new THREE.WebGPURenderer(
              props as ConstructorParameters<typeof THREE.WebGPURenderer>[0]
            )
            await renderer.init()
            renderer.outputColorSpace = THREE.SRGBColorSpace
            renderer.toneMapping = THREE.NoToneMapping
            return renderer
          }}
          flat
          style={{ width: '100%', height: '100%' }}
        >
          <GradientMesh />
        </Canvas>
      </div>
    </DebugProvider>
  )
}

export default DebugDemo
