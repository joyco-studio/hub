'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { LabCanvas } from './lab-canvas'
import { LabList } from './lab-list'

type View = 'canvas' | 'list'

const STORAGE_KEY = 'lab-view'

function getInitialView(searchParam: string | null): View {
  if (searchParam === 'list') return 'list'
  if (typeof window === 'undefined') return 'canvas'
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'list' ? 'list' : 'canvas'
}

interface LabViewProps {
  experiments: Array<{
    slug: string
    title: string
    description?: string
    tags?: string[]
  }>
}

export function LabView({ experiments }: LabViewProps) {
  const searchParams = useSearchParams()
  const [view, setView] = useState<View>(() =>
    getInitialView(searchParams.get('view'))
  )

  function switchView(next: View) {
    localStorage.setItem(STORAGE_KEY, next)
    setView(next)
  }

  if (view === 'list') {
    return (
      <LabList
        experiments={experiments}
        onViewChange={() => switchView('canvas')}
      />
    )
  }

  return (
    <LabCanvas
      experiments={experiments}
      onViewChange={() => switchView('list')}
    />
  )
}
