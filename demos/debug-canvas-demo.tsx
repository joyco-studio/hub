'use client'

import { DebugProvider } from '@/registry/lib/debug'
import { DebugCanvas } from '@/registry/components/debug-canvas'

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[-5, 10, -5]} intensity={1} />

      <mesh position={[0, 0.5, 0]}>
        <boxGeometry />
        <meshStandardMaterial color="#6366f1" />
      </mesh>

      <mesh position={[2, 0.35, -1]}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial color="#ec4899" />
      </mesh>

      <mesh position={[-1.5, 0.25, 1]}>
        <cylinderGeometry args={[0.25, 0.25, 0.5, 32]} />
        <meshStandardMaterial color="#facc15" />
      </mesh>
    </>
  )
}

function DebugCanvasDemo() {
  return (
    <DebugProvider title="Canvas Debug" position="top-right" enabled>
      <div className="bg-background h-screen w-full">
        <DebugCanvas
          camera={{ position: [3, 3.5, 3.5], fov: 50 }}
          style={{ width: '100%', height: '100%' }}
        >
          <Scene />
        </DebugCanvas>
      </div>
    </DebugProvider>
  )
}

export default DebugCanvasDemo
