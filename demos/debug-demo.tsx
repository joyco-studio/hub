'use client'

import * as THREE from 'three/webgpu'
import {
  Fn,
  cos,
  dot,
  float,
  floor,
  fract,
  hash,
  mix,
  mod,
  mul,
  select,
  sin,
  smoothstep,
  sub,
  time,
  uv,
  vec2,
} from 'three/tsl'
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'

import { DebugProvider, useDebugBindings } from '@/registry/joyco/blocks/debug'
import { useUniforms } from '@/hooks/use-uniforms'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
extend(THREE as any)

// TSL simplex-ish noise built from hash
const noise2D = Fn(([p_immutable]: [ReturnType<typeof vec2>]) => {
  const p = vec2(p_immutable).toVar()
  const i = floor(p).toVar()
  const f = fract(p).toVar()
  const u = f.mul(f).mul(sub(float(3), mul(float(2), f)))

  const a = hash(i)
  const b = hash(i.add(vec2(1, 0)))
  const c = hash(i.add(vec2(0, 1)))
  const d = hash(i.add(vec2(1, 1)))

  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y)
    .mul(2)
    .sub(1)
})

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
      noiseScale: 3.0,
      noiseStrength: 0.15,
      speed: 1.0,
    },
    {
      angle: { min: 0, max: 360, step: 1 },
      stripes: { min: 1, max: 20, step: 1 },
      sharpness: { min: 1, max: 20, step: 0.1 },
      noiseScale: { min: 0, max: 10, step: 0.1 },
      noiseStrength: { min: 0, max: 1, step: 0.01 },
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
    uNoiseScale: ref.current.noiseScale,
    uNoiseStrength: ref.current.noiseStrength,
    uSpeed: ref.current.speed,
  })

  useEffect(() => {
    if (!folder) return
    // eslint-disable-next-line react-hooks/immutability
    folder.expanded = true
    folder.on('change', (e) => {
      console.log(e)
    })
  }, [folder])

  const material = useMemo(() => {
    const {
      uColorA,
      uColorB,
      uColorC,
      uAngle,
      uStripes,
      uSharpness,
      uNoiseScale,
      uNoiseStrength,
      uSpeed,
    } = uniforms

    const rad = uAngle.mul(Math.PI / 180)
    const dir = vec2(cos(rad), sin(rad))
    const linear = dot(sub(uv(), vec2(0.5)), dir).add(0.5)

    const n = noise2D(
      uv().add(time.mul(uSpeed).mul(0.05)).mul(uNoiseScale)
    ).mul(uNoiseStrength)
    const distorted = linear.add(n)

    const t = smoothstep(
      sub(float(0.5), float(0.5).div(uSharpness)),
      float(0.5).add(float(0.5).div(uSharpness)),
      fract(distorted.mul(uStripes))
    )

    const stripeIdx = mod(floor(distorted.mul(uStripes)), float(3))

    const fromColor = select(
      stripeIdx.lessThan(0.5),
      uColorA,
      select(stripeIdx.lessThan(1.5), uColorB, uColorC)
    )
    const toColor = select(
      stripeIdx.lessThan(0.5),
      uColorB,
      select(stripeIdx.lessThan(1.5), uColorC, uColorA)
    )

    const finalColor = mix(fromColor, toColor, t)

    const mat = new THREE.MeshBasicNodeMaterial()
    mat.colorNode = finalColor
    return mat
  }, [uniforms])

  const matRef = useRef(material)
  matRef.current = material

  useFrame(() => {
    setUniforms({
      uColorA: ref.current.colorA,
      uColorB: ref.current.colorB,
      uColorC: ref.current.colorC,
      uAngle: ref.current.angle,
      uStripes: ref.current.stripes,
      uSharpness: ref.current.sharpness,
      uNoiseScale: ref.current.noiseScale,
      uNoiseStrength: ref.current.noiseStrength,
      uSpeed: ref.current.speed,
    })
  })

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
          style={{ width: '100%', height: '100%' }}
        >
          <GradientMesh />
        </Canvas>
      </div>
    </DebugProvider>
  )
}

export default DebugDemo
