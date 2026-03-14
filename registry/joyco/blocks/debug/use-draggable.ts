import { useEffect, type RefObject } from 'react'

/**
 * Makes a fixed-position container draggable by a handle element.
 *
 * - Clamped to the viewport so the panel can never leave the screen.
 * - After each drag, anchors to the nearest corner (top/bottom × left/right)
 *   so that content growth always pushes toward the center, not off-screen.
 */
export function useDraggable(
  containerRef: RefObject<HTMLElement | null>,
  handleSelector: string,
  active: boolean
) {
  useEffect(() => {
    const container = containerRef.current
    if (!active || !container) return

    const handle = container.querySelector<HTMLElement>(handleSelector)
    if (!handle) return

    handle.style.cursor = 'grab'

    let dragging = false
    let didDrag = false
    let offsetX = 0
    let offsetY = 0

    function anchorToCorner(el: HTMLElement) {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const vw = window.innerWidth
      const vh = window.innerHeight

      if (cx > vw / 2) {
        el.style.right = `${vw - rect.right}px`
        el.style.left = 'auto'
      } else {
        el.style.left = `${rect.left}px`
        el.style.right = 'auto'
      }

      if (cy > vh / 2) {
        el.style.bottom = `${vh - rect.bottom}px`
        el.style.top = 'auto'
      } else {
        el.style.top = `${rect.top}px`
        el.style.bottom = 'auto'
      }
    }

    const onMouseDown = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      dragging = true
      didDrag = false
      offsetX = e.clientX - rect.left
      offsetY = e.clientY - rect.top
      handle.style.cursor = 'grabbing'
      e.preventDefault()
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!dragging) return
      didDrag = true
      const w = container.offsetWidth
      const h = container.offsetHeight

      let x = e.clientX - offsetX
      let y = e.clientY - offsetY

      x = Math.max(0, Math.min(x, window.innerWidth - w))
      y = Math.max(0, Math.min(y, window.innerHeight - h))

      container.style.left = `${x}px`
      container.style.top = `${y}px`
      container.style.right = 'auto'
      container.style.bottom = 'auto'
    }

    const onMouseUp = () => {
      if (!dragging) return
      dragging = false
      handle.style.cursor = 'grab'
      if (didDrag) anchorToCorner(container)
    }

    // Swallow the click that fires after a drag so Tweakpane
    // doesn't toggle expand/collapse.
    const onClick = (e: MouseEvent) => {
      if (didDrag) {
        e.stopPropagation()
        didDrag = false
      }
    }

    handle.addEventListener('mousedown', onMouseDown)
    handle.addEventListener('click', onClick, true)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)

    return () => {
      handle.removeEventListener('mousedown', onMouseDown)
      handle.removeEventListener('click', onClick, true)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [containerRef, handleSelector, active])
}
