import { useState } from 'react'
import { KeyRound } from 'lucide-react'
import g from '../../components/governance/governance.module.css'
import { Badge } from '../../components/ui/Badge/Badge'
import { Button } from '../../components/ui/Button/Button'
import { Input } from '../../components/ui/Input/Input'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { Select } from '../../components/ui/Select/Select'
import { Textarea } from '../../components/ui/Textarea/Textarea'
import { useDeveloper } from '../../hooks/useDeveloper'
import type { ApiEnvironment } from '../../types/developer'
import { formatRelativeTime } from '../../utils/date'
import { DeveloperHubNav } from './DeveloperHubNav'
import styles from './developer.module.css'

function keyVariant(status: string) {
  if (status === 'active') return 'success' as const
  if (status === 'rotated') return 'accent' as const
  if (status === 'revoked' || status === 'expired') return 'error' as const
  return 'neutral' as const
}

export function DeveloperAppsPage() {
  const { apiKeys, oauthApps, createApiKey, rotateApiKey, revokeApiKey, createOAuthApp } = useDeveloper()
  const [tab, setTab] = useState<'keys' | 'oauth'>('keys')
  const [keyName, setKeyName] = useState('')
  const [environment, setEnvironment] = useState<ApiEnvironment>('sandbox')
  const [appName, setAppName] = useState('')
  const [redirectUris, setRedirectUris] = useState('https://app.example.com/oauth/callback')
  const [scopes, setScopes] = useState('openid, policies.read, reports.read')

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        title="API Keys & OAuth Apps"
        description="Manage live and sandbox credentials, rotate secrets, and register OAuth applications."
        icon={<KeyRound size={20} />}
      />

      <DeveloperHubNav current="/developer/apps" />

      <div className={g.tabs} role="tablist" aria-label="Credentials">
        <button type="button" role="tab" aria-selected={tab === 'keys'} className={tab === 'keys' ? g.tabActive : g.tab} onClick={() => setTab('keys')}>
          API Keys
        </button>
        <button type="button" role="tab" aria-selected={tab === 'oauth'} className={tab === 'oauth' ? g.tabActive : g.tab} onClick={() => setTab('oauth')}>
          OAuth Applications
        </button>
      </div>

      {tab === 'keys' ? (
        <div className={styles.splitWide}>
          <section className={g.panel}>
            <h2>API keys</h2>
            <ul className={g.list}>
              {apiKeys.map((key) => (
                <li key={key.id} className={g.listItem}>
                  <span>
                    <strong>{key.name}</strong>
                    <br />
                    <span className={`${g.muted} ${styles.mono}`}>{key.maskedSecret}</span>
                    <br />
                    <span className={g.muted}>
                      Permissions: {key.permissions.join(', ')}
                      {key.expiresAt ? ` · Expires ${formatRelativeTime(key.expiresAt)}` : ' · No expiration'}
                      {key.lastUsedAt ? ` · Last used ${formatRelativeTime(key.lastUsedAt)}` : ' · Never used'}
                    </span>
                  </span>
                  <div className={g.toolbar}>
                    <Badge variant={key.environment === 'live' ? 'warning' : 'neutral'}>{key.environment}</Badge>
                    <Badge variant={keyVariant(key.status)}>{key.status}</Badge>
                    <Button size="sm" variant="secondary" disabled={key.status === 'revoked'} onClick={() => rotateApiKey(key.id)}>
                      Rotate
                    </Button>
                    <Button size="sm" variant="ghost" disabled={key.status === 'revoked'} onClick={() => revokeApiKey(key.id)}>
                      Revoke
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <aside className={g.panel}>
            <h2>Create API key</h2>
            <div className={styles.formGrid}>
              <label style={{ gridColumn: '1 / -1' }}>
                Name
                <Input aria-label="API key name" value={keyName} onChange={(e) => setKeyName(e.target.value)} />
              </label>
              <label style={{ gridColumn: '1 / -1' }}>
                Environment
                <Select aria-label="API key environment" value={environment} onChange={(e) => setEnvironment(e.target.value as ApiEnvironment)}>
                  <option value="sandbox">Sandbox</option>
                  <option value="live">Live</option>
                </Select>
              </label>
            </div>
            <div className={g.toolbar}>
              <Button
                variant="primary"
                disabled={!keyName.trim()}
                onClick={() => {
                  createApiKey({
                    name: keyName,
                    environment,
                    permissions: environment === 'sandbox' ? ['*'] : ['policies:read', 'reports:read'],
                  })
                  setKeyName('')
                }}
              >
                Create key
              </Button>
            </div>
          </aside>
        </div>
      ) : (
        <div className={styles.splitWide}>
          <section className={g.panel}>
            <h2>OAuth applications</h2>
            <ul className={g.list}>
              {oauthApps.map((app) => (
                <li key={app.id} className={g.listItem}>
                  <span>
                    <strong>{app.name}</strong>
                    <br />
                    <span className={`${g.muted} ${styles.mono}`}>
                      Client ID {app.clientId}
                      <br />
                      Client Secret {app.clientSecretMasked}
                    </span>
                    <br />
                    <span className={g.muted}>
                      Redirect URIs: {app.redirectUris.join(', ')}
                      <br />
                      Scopes: {app.scopes.join(', ')}
                      <br />
                      Authorized orgs: {app.authorizedOrgs.join(', ')}
                      <br />
                      Activity {formatRelativeTime(app.lastActivityAt)}
                    </span>
                  </span>
                  <Badge variant={app.status === 'active' ? 'success' : 'neutral'}>{app.status}</Badge>
                </li>
              ))}
            </ul>
          </section>

          <aside className={g.panel}>
            <h2>Create app</h2>
            <div className={styles.formGrid}>
              <label style={{ gridColumn: '1 / -1' }}>
                Name
                <Input aria-label="OAuth app name" value={appName} onChange={(e) => setAppName(e.target.value)} />
              </label>
              <label style={{ gridColumn: '1 / -1' }}>
                Redirect URIs
                <Textarea aria-label="Redirect URIs" rows={3} value={redirectUris} onChange={(e) => setRedirectUris(e.target.value)} />
              </label>
              <label style={{ gridColumn: '1 / -1' }}>
                Scopes
                <Input aria-label="OAuth scopes" value={scopes} onChange={(e) => setScopes(e.target.value)} />
              </label>
            </div>
            <div className={g.toolbar}>
              <Button
                variant="primary"
                disabled={!appName.trim()}
                onClick={() => {
                  createOAuthApp({
                    name: appName,
                    redirectUris: redirectUris
                      .split('\n')
                      .map((item) => item.trim())
                      .filter(Boolean),
                    scopes: scopes
                      .split(',')
                      .map((item) => item.trim())
                      .filter(Boolean),
                  })
                  setAppName('')
                }}
              >
                Create App
              </Button>
            </div>
          </aside>
        </div>
      )}
    </PageContainer>
  )
}
