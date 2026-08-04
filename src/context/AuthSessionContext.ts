import { createContext } from 'react'
import type { AuthLoginResult } from '../services/apiClient'

export type AuthSessionState = {
  accessToken: string | null
  user: AuthLoginResult['user'] | null
  ready: boolean
  refresh: () => Promise<void>
  clearSession: () => void
  setSession: (result: AuthLoginResult) => void
}

export const AuthSessionContext = createContext<AuthSessionState | null>(null)
