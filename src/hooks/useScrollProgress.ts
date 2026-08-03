import { useEffect, useRef, useState, type RefObject } from 'react'

/**
 * Tracks vertical scroll progress (0-100) of the nearest scrollable ancestor
 * of `elementRef`. Deliberately walks up the DOM rather than assuming a
 * specific shell class, so it stays decoupled from `Workspace`'s internals.
 * Powers reading-progress persistence in the Document Viewer.
 */
export function useScrollProgress(elementRef: RefObject<HTMLElement | null>): number {
  const [progress, setProgress] = useState(0)
  const frame = useRef<number>(undefined)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    let scrollParent: HTMLElement | null = element.parentElement
    while (scrollParent && scrollParent.scrollHeight <= scrollParent.clientHeight + 1) {
      scrollParent = scrollParent.parentElement
    }
    if (!scrollParent) return
    const parent = scrollParent

    function computeProgress() {
      const scrollable = parent.scrollHeight - parent.clientHeight
      const percent = scrollable <= 0 ? 100 : Math.min(100, Math.round((parent.scrollTop / scrollable) * 100))
      setProgress(percent)
    }

    function onScroll() {
      if (frame.current) return
      frame.current = window.requestAnimationFrame(() => {
        frame.current = undefined
        computeProgress()
      })
    }

    computeProgress()
    parent.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      parent.removeEventListener('scroll', onScroll)
      if (frame.current) window.cancelAnimationFrame(frame.current)
    }
  }, [elementRef])

  return progress
}
