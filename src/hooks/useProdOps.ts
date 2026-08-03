import { useContext } from 'react'
import { ProdOpsContext } from '../context/ProdOpsContext'

export function useProdOps() {
  const value = useContext(ProdOpsContext)
  if (!value) throw new Error('useProdOps must be used within ProdOpsProvider')
  return value
}
