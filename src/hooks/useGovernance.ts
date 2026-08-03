import { useContext } from 'react'
import { GovernanceContext } from '../context/GovernanceContext'

export function useGovernance() {
  const value = useContext(GovernanceContext)
  if (!value) throw new Error('useGovernance must be used within GovernanceProvider')
  return value
}
