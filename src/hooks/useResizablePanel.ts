import { useCallback, useState, type PointerEvent as ReactPointerEvent } from 'react'

interface ResizablePanelOptions {
  initialWidth: number
  minWidth: number
  maxWidth: number
  /** Which edge the drag handle sits on — determines drag direction sign. */
  edge?: 'left' | 'right'
}

/**
 * Drag-to-resize behavior for a fixed-width panel (e.g. the AI Assistant
 * panel). Returns the current width and the pointer-down handler to attach
 * to a resize handle element.
 */
export function useResizablePanel({ initialWidth, minWidth, maxWidth, edge = 'left' }: ResizablePanelOptions) {
  const [width, setWidth] = useState(initialWidth)

  const onPointerDown = useCallback(
    (event: ReactPointerEvent) => {
      const startX = event.clientX
      const startWidth = width

      function onPointerMove(moveEvent: PointerEvent) {
        const delta = moveEvent.clientX - startX
        const signedDelta = edge === 'left' ? -delta : delta
        setWidth(Math.min(maxWidth, Math.max(minWidth, startWidth + signedDelta)))
      }

      function onPointerUp() {
        document.body.style.removeProperty('cursor')
        document.body.style.removeProperty('user-select')
        window.removeEventListener('pointermove', onPointerMove)
        window.removeEventListener('pointerup', onPointerUp)
      }

      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
      window.addEventListener('pointermove', onPointerMove)
      window.addEventListener('pointerup', onPointerUp)
    },
    [edge, minWidth, maxWidth, width],
  )

  return { width, onPointerDown }
}
