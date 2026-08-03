import { useContext } from 'react'
import { AutonomousContext } from '../context/AutonomousContext'

export function useAutonomous() {
  const value = useContext(AutonomousContext)
  if (!value) throw new Error('useAutonomous must be used within AutonomousProvider')
  return value
}
