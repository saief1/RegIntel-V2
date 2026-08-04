import { useEffect, useState } from 'react'
import { featureFlags } from '../config/featureFlags'
import {
  realSecurityApi,
  type RealLoginHistoryItem,
  type RealSession,
  type RealTrustedDevice,
} from '../services/apiClient'
import type { DeviceSession, LoginHistoryItem } from '../types/connected'
import type { TrustedDevice } from '../types/operations'
import { useAuthSession } from './useAuthSession'

type SecurityCenterLiveData = {
  enabled: boolean
  loading: boolean
  deviceSessions: DeviceSession[]
  trustedDevices: TrustedDevice[]
  loginHistory: LoginHistoryItem[]
  revokeSession: (id: string) => void
  revokeDevice: (id: string) => void
  logoutEverywhere: () => Promise<void>
  idleTimeoutSeconds: number | null
}

function mapSession(row: RealSession): DeviceSession {
  return {
    id: row.id,
    userId: row.userId,
    device: row.device,
    browser: row.browser,
    lastActiveAt: row.lastActiveAt,
    current: row.current,
  }
}

function mapDevice(row: RealTrustedDevice, userLabel: string): TrustedDevice {
  return {
    id: row.id,
    name: row.name,
    user: userLabel,
    lastSeenAt: row.lastSeenAt,
    trusted: row.trusted,
  }
}

function mapLogin(row: RealLoginHistoryItem): LoginHistoryItem {
  const normalized = row.result.toLowerCase()
  const result: LoginHistoryItem['result'] =
    normalized === 'success'
      ? 'success'
      : normalized.includes('mfa')
        ? 'mfa_challenge'
        : 'failure'
  return {
    id: row.id,
    userId: row.userId ?? 'unknown',
    at: row.at,
    ip: row.ip ?? 'unknown',
    location: row.location,
    result,
  }
}

/**
 * When VITE_USE_REAL_AUTH is on, loads sessions/devices/login history from the API
 * for existing Security Center / Admin Console surfaces. Otherwise returns disabled.
 */
export function useSecurityCenterLive(
  fallbackUserName = 'Current user',
): SecurityCenterLiveData {
  const enabled = featureFlags.useRealAuth
  const { accessToken, user } = useAuthSession()
  const [loading, setLoading] = useState(false)
  const [deviceSessions, setDeviceSessions] = useState<DeviceSession[]>([])
  const [trustedDevices, setTrustedDevices] = useState<TrustedDevice[]>([])
  const [loginHistory, setLoginHistory] = useState<LoginHistoryItem[]>([])
  const [idleTimeoutSeconds, setIdleTimeoutSeconds] = useState<number | null>(null)
  const userName = user?.name ?? fallbackUserName

  useEffect(() => {
    if (!enabled || !accessToken) {
      return
    }
    let cancelled = false
    // Defer so setState is not synchronous in the effect body (React Compiler lint).
    const handle = window.setTimeout(() => {
      void (async () => {
        setLoading(true)
        try {
          const [sessions, devices, history, policy] = await Promise.all([
            realSecurityApi.listSessions(accessToken),
            realSecurityApi.listDevices(accessToken),
            realSecurityApi.loginHistory(accessToken),
            realSecurityApi.sessionPolicy(accessToken),
          ])
          if (cancelled) return
          setDeviceSessions(sessions.map(mapSession))
          setTrustedDevices(devices.map((d) => mapDevice(d, userName)))
          setLoginHistory(history.map(mapLogin))
          setIdleTimeoutSeconds(policy.idleTimeoutSeconds)
        } catch {
          // Keep empty; mock fallback when flag off.
        } finally {
          if (!cancelled) {
            setLoading(false)
          }
        }
      })()
    }, 0)
    return () => {
      cancelled = true
      window.clearTimeout(handle)
    }
  }, [enabled, accessToken, userName])

  function revokeSession(id: string) {
    if (!accessToken) return
    setDeviceSessions((current) => current.filter((item) => item.id !== id))
    void realSecurityApi.revokeSession(accessToken, id).then(async () => {
      const sessions = await realSecurityApi.listSessions(accessToken)
      setDeviceSessions(sessions.map(mapSession))
    })
  }

  function revokeDevice(id: string) {
    if (!accessToken) return
    setTrustedDevices((current) => current.filter((item) => item.id !== id))
    void realSecurityApi.revokeDevice(accessToken, id).then(async () => {
      const devices = await realSecurityApi.listDevices(accessToken)
      setTrustedDevices(devices.map((d) => mapDevice(d, userName)))
    })
  }

  async function logoutEverywhere() {
    if (!accessToken) return
    await realSecurityApi.logoutEverywhere(accessToken)
    const sessions = await realSecurityApi.listSessions(accessToken).catch(() => [])
    setDeviceSessions(sessions.map(mapSession))
  }

  return {
    enabled,
    loading,
    deviceSessions,
    trustedDevices,
    loginHistory,
    revokeSession,
    revokeDevice,
    logoutEverywhere,
    idleTimeoutSeconds,
  }
}
