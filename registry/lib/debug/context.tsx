'use client'

import { createContext, Dispatch, SetStateAction, useContext } from 'react'
import type { StoreApi } from 'zustand'
import type { FolderApi, Pane } from 'tweakpane'

export interface FolderEntry {
  folder: FolderApi
  refCount: number
}

export interface DebugRegistry {
  folderEntries: Map<string, FolderEntry>
  stores: Map<string, StoreApi<Record<string, unknown>>>
  onFolderCreated: (() => void) | null
}

export const DebugContext = createContext<{
  pane: Pane | null
  enabled: boolean
  setEnabled: Dispatch<SetStateAction<boolean>>
  registry: DebugRegistry
} | null>(null)

export const useDebug = () => {
  const context = useContext(DebugContext)
  if (!context) {
    throw new Error('useDebug must be used within a DebugProvider')
  }
  return context
}
