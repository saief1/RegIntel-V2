import { useContext } from 'react'
import { ConnectedContext } from '../context/ConnectedContext'

export function useConnected() {
  const value = useContext(ConnectedContext)
  if (!value) throw new Error('useConnected must be used within ConnectedProvider')
  return value
}
