import { useContext } from 'react'
import { EcosystemContext } from '../context/EcosystemContext'

export function useEcosystem() {
  const value = useContext(EcosystemContext)
  if (!value) throw new Error('useEcosystem must be used within EcosystemProvider')
  return value
}
