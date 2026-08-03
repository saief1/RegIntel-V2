import { useContext } from 'react'
import { WorkContext } from '../context/WorkContext'

export function useWork() {
  const value = useContext(WorkContext)
  if (!value) throw new Error('useWork must be used within WorkProvider')
  return value
}
