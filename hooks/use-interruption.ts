import * as React from 'react'

/**
 * Hook to manage user interruption state with a timeout-based cooldown.
 * When `interrupt` is called, sets a flag for a duration that can be checked via `isInterruptedRef`.
 */
export const useUserInterruption = (duration: number = 200) => {
  const interruptedRef = React.useRef(false)
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const interrupt = React.useCallback(() => {
    interruptedRef.current = true

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      interruptedRef.current = false
      timeoutRef.current = null
    }, duration)
  }, [duration])

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return { interruptedRef, interrupt }
}
