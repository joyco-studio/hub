'use client'

import { useEffect } from 'react'

export function ShortcutsRelay() {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (window.parent !== window) {
          window.parent.postMessage(
            { type: 'joyco:open-command-palette' },
            window.location.origin
          )
        }
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  return null
}
