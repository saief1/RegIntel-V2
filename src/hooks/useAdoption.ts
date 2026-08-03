import { useContext } from 'react'
import { AdoptionContext } from '../context/AdoptionContext'

export function useAdoption() {
  const value = useContext(AdoptionContext)
  if (!value) throw new Error('useAdoption must be used within AdoptionProvider')
  return value
}
