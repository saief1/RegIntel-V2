import { useContext } from 'react'
import { AnalyticsContext } from '../context/AnalyticsContext'

export function useAnalytics() {
  const value = useContext(AnalyticsContext)
  if (!value) throw new Error('useAnalytics must be used within AnalyticsProvider')
  return value
}
