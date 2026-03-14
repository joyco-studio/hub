'use client'

import { useEffect } from 'react'
import {
  DebugProvider,
  useDebugBindings,
  useDebugState,
} from '@/registry/joyco/blocks/debug'
import { useDebug } from '@/registry/joyco/blocks/debug/context'

function ForceEnable() {
  const { setEnabled } = useDebug()
  useEffect(() => setEnabled(true), [setEnabled])
  return null
}

function DebuggedBox() {
  const [, folder, store] = useDebugBindings(
    'Box',
    {
      width: 120,
      height: 120,
      borderRadius: 16,
      rotation: 0,
      opacity: 1,
      color: '#6366f1',
    },
    {
      width: {
        min: 100,
        max: 200,
        step: 1,
      },
      height: {
        min: 100,
        max: 200,
        step: 1,
      },
      borderRadius: {
        min: 0,
        max: 100,
        step: 1,
      },
      rotation: {
        min: 0,
        max: 360,
        step: 1,
      },
      opacity: {
        min: 0,
        max: 1,
        step: 0.01,
      },
      color: {
        type: 'color',
      },
    }
  )

  if (folder) {
    // eslint-disable-next-line react-hooks/immutability
    folder.expanded = true
  }

  const state = useDebugState(store)

  return (
    <div
      style={{
        width: `${state.width as number}px`,
        height: `${state.height as number}px`,
        borderRadius: `${state.borderRadius as number}px`,
        transform: `rotate(${state.rotation as number}deg)`,
        opacity: state.opacity as number,
        backgroundColor: state.color as string,
        transition: 'all 0.15s ease-out',
      }}
    />
  )
}

function DebugDemo() {
  return (
    <DebugProvider title="Debug Box Demo" position="top-right">
      <ForceEnable />
      <div className="bg-background flex h-screen w-full items-center justify-center p-8">
        <DebuggedBox />
      </div>
    </DebugProvider>
  )
}

export default DebugDemo
