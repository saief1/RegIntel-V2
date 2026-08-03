import { useContext } from 'react'
import { CommercialContext } from '../context/CommercialContext'

export function useCommercial() {
  const value = useContext(CommercialContext)
  if (!value) throw new Error('useCommercial must be used within CommercialProvider')
  return value
}
