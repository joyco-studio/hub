'use client'

import { createContext, Dispatch, SetStateAction, useContext } from 'react'
import type { FolderApi, Pane } from 'tweakpane'

export interface FolderEntry {
  folder: FolderApi
  refCount: number
}

export const DebugContext = createContext<{
  pane: Pane | null
  enabled: boolean
  setEnabled: Dispatch<SetStateAction<boolean>>
} | null>(null)

export const useDebug = () => {
  const context = useContext(DebugContext)
  if (!context) {
    throw new Error('useDebugPane must be used within a DebugProvider')
  }
  return context
}
