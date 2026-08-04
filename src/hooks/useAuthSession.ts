import { useContext } from 'react'
import {
  AuthSessionContext,
  type AuthSessionState,
} from '../context/AuthSessionContext'

export function useAuthSession(): AuthSessionState {
  const ctx = useContext(AuthSessionContext)
  if (!ctx) {
    throw new Error('useAuthSession must be used within AuthSessionProvider')
  }
  return ctx
}
