import { useContext } from 'react'
import { ShellLayoutContext, type ShellLayoutContextValue } from '../context/ShellLayoutContext'

export function useShellLayout(): ShellLayoutContextValue {
  const context = useContext(ShellLayoutContext)
  if (!context) throw new Error('useShellLayout must be used within a ShellLayoutProvider')
  return context
}
