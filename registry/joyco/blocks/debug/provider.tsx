'use client'

import { useSearchParams } from 'next/navigation'
import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import debounce from 'lodash.debounce'
import { Pane } from 'tweakpane'

import { parseHashState, writeHashState } from './hash-state'
import { DebugContext, useDebug } from './context'
import { setOnFolderCreated, clearAllFolders } from './hooks'
import { useDraggable } from './use-draggable'

export function DebugParamSync() {
  const searchParams = useSearchParams()
  const { setEnabled } = useDebug()

  useEffect(() => {
    const hasParam = searchParams.has('debug')
    if (hasParam) setEnabled(true)
  }, [searchParams, setEnabled])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.altKey && e.code === 'KeyD') {
        e.preventDefault()
        setEnabled((prev) => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setEnabled])

  return null
}

type Position = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

const positionStyles: Record<
  Position,
  Pick<React.CSSProperties, 'top' | 'right' | 'bottom' | 'left'>
> = {
  'top-left': { top: 0, left: 0 },
  'top-right': { top: 0, right: 0 },
  'bottom-left': { bottom: 0, left: 0 },
  'bottom-right': { bottom: 0, right: 0 },
}

interface DebugProviderProps {
  children: ReactNode
  position?: Position
  title?: string
  padding?: number
}

export function DebugProvider({
  children,
  position = 'bottom-left',
  title = 'Debug',
  padding = 8,
}: DebugProviderProps) {
  const [enabled, setEnabled] = useState(false)
  const [pane, setPane] = useState<Pane | null>(null)
  const paneRef = useRef<Pane | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const pendingStateRef = useRef<Record<string, unknown> | null>(null)
  const safetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const flushPendingImport = useCallback(() => {
    const state = pendingStateRef.current
    if (state && paneRef.current) {
      paneRef.current.importState(state)
      pendingStateRef.current = null
    }
  }, [])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const schedulePendingImport = useCallback(
    debounce(() => flushPendingImport(), 150),
    [flushPendingImport]
  )

  // Create pane lazily on first enable; keep it alive across toggles
  useEffect(() => {
    if (paneRef.current || !containerRef.current) return

    const instance = new Pane({
      container: containerRef.current,
      title,
      expanded: true,
    })

    paneRef.current = instance
    setPane(instance)
    setOnFolderCreated(schedulePendingImport)

    const urlState = parseHashState()
    if (urlState) {
      pendingStateRef.current = urlState
      safetyTimerRef.current = setTimeout(() => flushPendingImport(), 2000)
    }

    const exportFolder = instance.addFolder({
      title: 'Export',
      expanded: false,
    })

    const copyLinkBtn = exportFolder.addButton({ title: 'Copy Link' })
    copyLinkBtn.on('click', () => {
      writeHashState(instance.exportState())
      navigator.clipboard.writeText(window.location.href).catch(() => {})
      copyLinkBtn.title = 'Copied!'
      setTimeout(() => {
        copyLinkBtn.title = 'Copy Link'
      }, 1500)
    })

    const copyStateBtn = exportFolder.addButton({ title: 'Copy State' })
    copyStateBtn.on('click', () => {
      const json = JSON.stringify(instance.exportState(), null, 2)
      navigator.clipboard.writeText(json).catch(() => {})
      copyStateBtn.title = 'Copied!'
      setTimeout(() => {
        copyStateBtn.title = 'Copy State'
      }, 1500)
    })
  }, [flushPendingImport, schedulePendingImport, title])

  // Toggle pane visibility without disposing
  useEffect(() => {
    if (paneRef.current) paneRef.current.hidden = !enabled
  }, [enabled])

  // Dispose pane on provider unmount only
  useEffect(() => {
    return () => {
      schedulePendingImport.cancel()
      if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current)
      pendingStateRef.current = null
      clearAllFolders()
      paneRef.current?.dispose()
      paneRef.current = null
      setOnFolderCreated(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useDraggable(containerRef, '.tp-rotv_t', !!pane)

  return (
    <DebugContext.Provider value={{ pane, enabled, setEnabled }}>
      <Suspense fallback={null}>
        <DebugParamSync />
      </Suspense>
      {children}
      <div
        ref={containerRef}
        style={{
          position: 'fixed',
          ...positionStyles[position],
          padding,
          zIndex: 9999,
          display: enabled ? undefined : 'none',
        }}
      />
    </DebugContext.Provider>
  )
}
