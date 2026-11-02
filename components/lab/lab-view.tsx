'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { LabCanvas } from './lab-canvas'
import { LabList } from './lab-list'
import { filterExperimentsByTags } from '@/lib/lab-tags'
import { LabTagFilterEmpty, useActiveLabTags } from './lab-tag-filter'

type View = 'canvas' | 'list'

const STORAGE_KEY = 'lab-view'

function getInitialView(searchParam: string | null): View {
  if (searchParam === 'list') return 'list'
  if (searchParam === 'canvas') return 'canvas'
  if (typeof window === 'undefined') return 'list'
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'canvas' ? 'canvas' : 'list'
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
  const activeTags = useActiveLabTags()
  const filteredExperiments = filterExperimentsByTags(experiments, activeTags)

  function switchView(next: View) {
    localStorage.setItem(STORAGE_KEY, next)
    setView(next)
  }

  if (activeTags.length > 0 && filteredExperiments.length === 0) {
    return <LabTagFilterEmpty />
  }

  if (view === 'list') {
    return (
      <LabList
        experiments={filteredExperiments}
        onViewChange={() => switchView('canvas')}
      />
    )
  }

  return (
    <LabCanvas
      experiments={filteredExperiments}
      onViewChange={() => switchView('list')}
    />
  )
}
