'use client'

import { useState } from 'react'
import { LabCanvas } from './lab-canvas'
import { LabList } from './lab-list'

type View = 'canvas' | 'list'

interface LabViewProps {
  experiments: Array<{
    slug: string
    title: string
    description?: string
    tags?: string[]
  }>
}

export function LabView({ experiments }: LabViewProps) {
  const [view, setView] = useState<View>('canvas')

  if (view === 'list') {
    return (
      <LabList
        experiments={experiments}
        onViewChange={() => setView('canvas')}
      />
    )
  }

  return (
    <LabCanvas
      experiments={experiments}
      onViewChange={() => setView('list')}
    />
  )
}
