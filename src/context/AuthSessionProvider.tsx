import {
  useCallback,
  useEffect,
  useEffectEvent,
  useState,
  type ReactNode,
} from 'react'
import { featureFlags } from '../config/featureFlags'
import { realAuthApi, type AuthLoginResult } from '../services/apiClient'
import { AuthSessionContext, type AuthSessionState } from './AuthSessionContext'

const ACCESS_TOKEN_KEY = 'ri.accessToken'

function readStoredToken(): string | null {
  try {
    return sessionStorage.getItem(ACCESS_TOKEN_KEY)
  } catch {
    return null
  }
}

function writeStoredToken(token: string | null): void {
  try {
    if (token) {
      sessionStorage.setItem(ACCESS_TOKEN_KEY, token)
    } else {
      sessionStorage.removeItem(ACCESS_TOKEN_KEY)
    }
  } catch {
    // ignore storage failures (private mode)
  }
}

/**
 * Real auth session provider. Only performs refresh/idle activity when
 * `VITE_USE_REAL_AUTH=true`. When the flag is off, this is a no-op shell
 * (no mocked timers) so mock UI remains unchanged.
 */
export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const enabled = featureFlags.useRealAuth
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    enabled ? readStoredToken() : null,
  )
  const [user, setUser] = useState<AuthLoginResult['user'] | null>(null)
  const [ready, setReady] = useState(!enabled)

  const clearSession = useCallback(() => {
    setAccessToken(null)
    setUser(null)
    writeStoredToken(null)
  }, [])

  const setSession = useCallback((result: AuthLoginResult) => {
    setAccessToken(result.accessToken)
    setUser(result.user)
    writeStoredToken(result.accessToken)
  }, [])

  const refresh = useCallback(async () => {
    if (!featureFlags.useRealAuth) {
      return
    }
    const result = await realAuthApi.refresh()
    setSession(result)
  }, [setSession])

  const onVisibilityOrActivity = useEffectEvent(() => {
    if (!featureFlags.useRealAuth || !accessToken) {
      return
    }
    void refresh().catch(() => {
      clearSession()
    })
  })

  useEffect(() => {
    if (!enabled) {
      return
    }

    let cancelled = false
    void (async () => {
      try {
        const result = await realAuthApi.refresh()
        if (!cancelled) {
          setSession(result)
        }
      } catch {
        if (!cancelled) {
          clearSession()
        }
      } finally {
        if (!cancelled) {
          setReady(true)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [enabled, clearSession, setSession])

  useEffect(() => {
    if (!enabled || !accessToken) {
      return
    }

    const onActivity = () => {
      onVisibilityOrActivity()
    }
    const events: Array<keyof WindowEventMap> = ['focus', 'pointerdown', 'keydown']
    for (const event of events) {
      window.addEventListener(event, onActivity)
    }
    const interval = window.setInterval(() => {
      void refresh().catch(() => clearSession())
    }, 12 * 60 * 1000)

    return () => {
      for (const event of events) {
        window.removeEventListener(event, onActivity)
      }
      window.clearInterval(interval)
    }
  }, [enabled, accessToken, refresh, clearSession])

  const value: AuthSessionState = {
    accessToken,
    user,
    ready,
    refresh,
    clearSession,
    setSession,
  }

  return (
    <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>
  )
}
