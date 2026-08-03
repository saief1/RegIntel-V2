import { useContext } from 'react'
import { OperationsContext } from '../context/OperationsContext'

export function useOperations() {
  const value = useContext(OperationsContext)
  if (!value) throw new Error('useOperations must be used within OperationsProvider')
  return value
}
