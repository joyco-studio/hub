'use client'

import { useDebugBindings, useDebugState } from '@/registry/lib/debug'

export function DebugGridHelper() {
  const [, , store] = useDebugBindings('Canvas', {
    gridHelper: false,
  })
  const gridHelperEnabled = useDebugState(store, (s) => s.gridHelper)

  if (!gridHelperEnabled) return null

  return <gridHelper args={[100, 100]} />
}
