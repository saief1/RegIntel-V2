import { useContext } from 'react'
import { InvestigationsContext } from '../context/InvestigationsContext'

export function useInvestigations() {
  const value = useContext(InvestigationsContext)
  if (!value) throw new Error('useInvestigations must be used within InvestigationsProvider')
  return value
}
