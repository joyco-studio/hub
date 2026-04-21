'use client'

import { useSyncExternalStore } from 'react'

function getSnapshot() {
  return document.cookie.includes('joyco-team')
}

function getServerSnapshot() {
  return false
}

function subscribe() {
  return () => {}
}

export function useIsTeam() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
