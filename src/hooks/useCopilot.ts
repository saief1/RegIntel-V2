import { useContext } from 'react'
import { CopilotContext } from '../context/CopilotContext'

export function useCopilot() {
  const value = useContext(CopilotContext)
  if (!value) throw new Error('useCopilot must be used within CopilotProvider')
  return value
}
