import { useContext } from 'react'
import { SolutionsContext } from '../context/SolutionsContext'

export function useSolutions() {
  const value = useContext(SolutionsContext)
  if (!value) throw new Error('useSolutions must be used within SolutionsProvider')
  return value
}
