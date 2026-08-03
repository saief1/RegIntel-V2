import { useContext } from 'react'
import { DeveloperContext } from '../context/DeveloperContext'

export function useDeveloper() {
  const value = useContext(DeveloperContext)
  if (!value) throw new Error('useDeveloper must be used within DeveloperProvider')
  return value
}
