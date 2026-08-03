import { useEffect, useState } from 'react'

/**
 * Brief, honest loading flag used to show skeleton placeholders while a page
 * or panel "settles" — not tied to any backend request. Shared by every
 * Knowledge page so the loading feel stays consistent across the app.
 */
export function useSimulatedLoad(durationMs = 420): boolean {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), durationMs)
    return () => window.clearTimeout(timer)
  }, [durationMs])

  return loading
}
