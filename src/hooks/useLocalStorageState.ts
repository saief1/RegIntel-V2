import { useEffect, useState } from 'react'

/**
 * Persists a piece of UI state (e.g. sidebar collapsed/expanded) to
 * localStorage under `key`. Falls back silently to in-memory state if
 * localStorage is unavailable (private browsing, SSR, etc.).
 */
export function useLocalStorageState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const stored = window.localStorage.getItem(key)
      return stored !== null ? (JSON.parse(stored) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Ignore write failures (quota exceeded, private mode, etc.)
    }
  }, [key, value])

  return [value, setValue] as const
}
