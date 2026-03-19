'use client'

import { Canvas, type CanvasProps } from '@react-three/fiber'
import { type ReactNode } from 'react'
import { DebugControls } from './debug-controls'
import { DebugGridHelper } from './debug-grid-helper'
import { DebugCameraMonitor } from './debug-camera-monitor'
import { PerfMonitor as DebugPerfMonitor } from './debug-perf-monitor'

interface DebugCanvasProps extends CanvasProps {
  children?: ReactNode
}

export function DebugCanvas({ children, ...props }: DebugCanvasProps) {
  return (
    <Canvas {...props}>
      <DebugControls />
      <DebugGridHelper />
      <DebugCameraMonitor />
      <DebugPerfMonitor />
      {children}
    </Canvas>
  )
}
