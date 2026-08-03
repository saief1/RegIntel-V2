import { useEffect } from 'react'

interface ShortcutOptions {
  key: string
  meta?: boolean
  ctrl?: boolean
  preventDefault?: boolean
  enabled?: boolean
}

/**
 * Registers a global keyboard shortcut (e.g. Cmd/Ctrl+K for the command
 * palette) for the lifetime of the component that calls this hook.
 */
export function useKeyboardShortcut(
  { key, meta = false, ctrl = false, preventDefault = true, enabled = true }: ShortcutOptions,
  handler: (event: KeyboardEvent) => void,
) {
  useEffect(() => {
    if (!enabled) return

    function onKeyDown(event: KeyboardEvent) {
      const matchesKey = event.key.toLowerCase() === key.toLowerCase()
      const matchesModifier = meta ? event.metaKey || event.ctrlKey : ctrl ? event.ctrlKey : true

      if (matchesKey && matchesModifier) {
        if (preventDefault) event.preventDefault()
        handler(event)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [key, meta, ctrl, preventDefault, enabled, handler])
}
