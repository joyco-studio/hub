'use client'

import React, { useLayoutEffect, useRef, useState } from 'react'
import { createStore, useStore } from 'zustand'
import type { StoreApi } from 'zustand'
import type { BindingParams, FolderApi } from 'tweakpane'
import type { Pane } from 'tweakpane'

import { useDebug, type DebugRegistry } from './context'

// ---------------------------------------------------------------------------
// Folder helpers — scoped to a DebugRegistry instance
// ---------------------------------------------------------------------------

function getOrCreateFolder(reg: DebugRegistry, pane: Pane, title: string): FolderApi {
  const existing = reg.folderEntries.get(title)
  if (existing) {
    existing.refCount++
    reg.onFolderCreated?.()
    return existing.folder
  }
  const f = pane.addFolder({ title, expanded: false })
  reg.folderEntries.set(title, { folder: f, refCount: 1 })
  reg.onFolderCreated?.()
  return f
}

function releaseFolder(reg: DebugRegistry, title: string) {
  const entry = reg.folderEntries.get(title)
  if (!entry) return

  entry.refCount--

  if (entry.refCount <= 0) {
    entry.folder.dispose()
    reg.folderEntries.delete(title)
    reg.stores.delete(title)
  }
}

// ---------------------------------------------------------------------------
// useDebugFolder — acquisition inside effect for balanced ref counting
// ---------------------------------------------------------------------------

export function useDebugFolder(title: string): FolderApi | null {
  const { pane, registry } = useDebug()
  const [folder, setFolder] = useState<FolderApi | null>(null)

  useLayoutEffect(() => {
    if (!pane) return

    const f = getOrCreateFolder(registry, pane, title)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFolder(f)

    return () => {
      releaseFolder(registry, title)
      setFolder(null)
    }
  }, [pane, registry, title])

  return folder
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type DebugTarget = Record<string, unknown>

export type DebugOptions<T> = Partial<Record<keyof T, BindingParams>>

// ---------------------------------------------------------------------------
// Store helpers — scoped to a DebugRegistry instance
// ---------------------------------------------------------------------------

function getOrCreateStore<T extends DebugTarget>(reg: DebugRegistry, key: string, initial: T): StoreApi<T> {
  let store = reg.stores.get(key) as StoreApi<T> | undefined
  if (!store) {
    store = createStore<T>(() => ({ ...initial }))
    reg.stores.set(key, store)
  } else {
    // Merge new keys from later useDebugBindings calls
    const current = store.getState()
    const patch: Partial<T> = {}
    let hasPatch = false
    for (const k of Object.keys(initial)) {
      if (!(k in current)) {
        ;(patch as Record<string, unknown>)[k] = initial[k]
        hasPatch = true
      }
    }
    if (hasPatch) store.setState(patch)
  }
  return store
}

function getStore<T extends DebugTarget>(reg: DebugRegistry, key: string): StoreApi<T> {
  const store = reg.stores.get(key) as StoreApi<T> | undefined
  if (!store) {
    throw new Error(
      `[useDebugState] No store found for "${key}". Make sure useDebugBindings("${key}", ...) mounts before useDebugState("${key}", ...).`
    )
  }
  return store
}

// ---------------------------------------------------------------------------
// bindKeys — iterates Object.keys(target), returns BindingApi[]
// ---------------------------------------------------------------------------

function bindKeys<T extends DebugTarget>(folder: FolderApi, target: T, options?: DebugOptions<T>) {
  const apis: ReturnType<FolderApi['addBinding']>[] = []
  for (const key of Object.keys(target)) {
    const opts = options?.[key as keyof T]
    apis.push(folder.addBinding(target, key, opts))
  }
  return apis
}

// ---------------------------------------------------------------------------
// useDebugBindings — creates tweakpane UI, mutates target, notifies store
// ---------------------------------------------------------------------------

export function useDebugBindings<T extends DebugTarget>(
  folderTitle: string,
  target: T,
  options?: DebugOptions<T>
): [React.RefObject<T>, FolderApi | null, StoreApi<T>] {
  const { registry } = useDebug()
  const folder = useDebugFolder(folderTitle)
  const optionsRef = useRef(options)
  // eslint-disable-next-line react-hooks/refs
  optionsRef.current = options
  const targetRef = useRef(target)

  // Create store eagerly during render so useDebugState can access it
  // in the same render cycle (before effects run).
  const store = getOrCreateStore(registry, folderTitle, target)

  useLayoutEffect(() => {
    if (!folder) return

    const raw = targetRef.current
    const store = getOrCreateStore(registry, folderTitle, raw)

    // Proxy intercepts external mutations so the folder UI stays in sync
    const proxy = new Proxy(raw, {
      set(obj, prop, value) {
        const result = Reflect.set(obj, prop, value)
        folder.refresh()
        store.setState({ ...obj })
        return result
      },
    }) as T
    targetRef.current = proxy

    const apis = bindKeys(folder, proxy, optionsRef.current)

    return () => {
      for (const a of apis) a.dispose()
      targetRef.current = raw
    }
    // target is expected to be a stable ref (e.g. useRef().current).
    // options is read from a ref — safe to define inline.
  }, [folder, folderTitle, registry])

  return [targetRef, folder, store]
}

// ---------------------------------------------------------------------------
// useDebugState — subscribe to a debug store by folder title OR direct StoreApi
// ---------------------------------------------------------------------------

export function useDebugState<T extends DebugTarget>(store: StoreApi<T>): T
export function useDebugState<T extends DebugTarget, S>(store: StoreApi<T>, selector: (state: T) => S): S
export function useDebugState<T>(folderTitle: string): T
export function useDebugState<T, S>(folderTitle: string, selector: (state: T) => S): S
export function useDebugState(
  storeOrTitle: StoreApi<DebugTarget> | string,
  selector?: (state: DebugTarget) => unknown
) {
  const { registry } = useDebug()
  const store = typeof storeOrTitle === 'string' ? getStore(registry, storeOrTitle) : storeOrTitle
  return useStore(store, selector as (state: DebugTarget) => unknown)
}
