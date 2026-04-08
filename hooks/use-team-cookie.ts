import { useSyncExternalStore } from 'react'

function getSnapshot() {
  return document.cookie.includes('joyco-team')
}

function getServerSnapshot() {
  return false
}

function subscribe(callback: () => void) {
  const interval = setInterval(callback, 2000)
  return () => clearInterval(interval)
}

export function useIsTeam() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
