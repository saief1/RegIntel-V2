import { useState } from 'react'
import { Shield } from 'lucide-react'
import { Link } from 'react-router-dom'
import g from '../../components/governance/governance.module.css'
import { Badge } from '../../components/ui/Badge/Badge'
import { Button } from '../../components/ui/Button/Button'
import { Input } from '../../components/ui/Input/Input'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { useConnected } from '../../hooks/useConnected'
import { useGovernance } from '../../hooks/useGovernance'
import { useSecurityCenterLive } from '../../hooks/useSecurityCenterLive'
import { useWork } from '../../hooks/useWork'
import { formatRelativeTime } from '../../utils/date'
import styles from '../connected/connected.module.css'

type Tab =
  | 'tenant'
  | 'users'
  | 'teams'
  | 'auth'
  | 'sessions'
  | 'security'
  | 'history'

export function AdminConsolePage() {
  const {
    adminUsers,
    loginHistory: mockLoginHistory,
    deviceSessions: mockSessions,
    revokeSession: mockRevokeSession,
    tenantName,
    setTenantName,
    ssoEnabled,
    toggleSso,
    scimEnabled,
    toggleScim,
    mfaRequired,
    toggleMfaRequired,
    globalActivity,
  } = useConnected()
  const live = useSecurityCenterLive()
  const loginHistory = live.enabled ? live.loginHistory : mockLoginHistory
  const deviceSessions = live.enabled ? live.deviceSessions : mockSessions
  const revokeSession = live.enabled ? live.revokeSession : mockRevokeSession
  const { teams, departments } = useGovernance()
  const { getUser } = useWork()
  const [tab, setTab] = useState<Tab>('tenant')

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        title="Admin Console"
        description="Tenant, identity, session, and security administration for the enterprise."
        icon={<Shield size={20} />}
      />

      <nav className={styles.hubLinks} aria-label="Connected enterprise areas">
        <Link className={styles.hubLink} to="/settings">
          Settings
        </Link>
        <Link className={styles.hubLink} to="/settings/integrations">
          Integrations
        </Link>
        <Link className={styles.hubLink} to="/settings/api">
          API Platform
        </Link>
      </nav>

      <div className={g.tabs} role="tablist" aria-label="Admin console sections">
        {(
          [
            ['tenant', 'Tenant Settings'],
            ['users', 'User Management'],
            ['teams', 'Teams & Departments'],
            ['auth', 'Authentication'],
            ['sessions', 'Session Management'],
            ['security', 'Security Policies'],
            ['history', 'Login History'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={tab === id ? g.tabActive : g.tab}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'tenant' && (
        <section className={g.panel}>
          <h2>Tenant settings</h2>
          <div className={styles.field}>
            <label htmlFor="tenant-name">Organization name</label>
            <Input
              id="tenant-name"
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
              aria-label="Tenant organization name"
            />
          </div>
          <p className={g.muted}>Changes apply to branding surfaces and audit export metadata (local mock).</p>
          <h3>Recent admin activity</h3>
          <ul className={g.list}>
            {globalActivity
              .filter((item) => item.source === 'admin' || item.source === 'integration')
              .slice(0, 5)
              .map((item) => (
                <li key={item.id} className={g.listItem}>
                  <span>
                    <strong>{item.title}</strong>
                    <br />
                    <span className={g.muted}>{item.detail}</span>
                  </span>
                  <time dateTime={item.at}>{formatRelativeTime(item.at)}</time>
                </li>
              ))}
          </ul>
        </section>
      )}

      {tab === 'users' && (
        <section className={g.panel}>
          <h2>User management</h2>
          <ul className={g.list}>
            {adminUsers.map((user) => (
              <li key={user.id} className={g.listItem}>
                <span>
                  <strong>{user.name}</strong>
                  <br />
                  <span className={g.muted}>
                    {user.email} · {user.role}
                    {user.lastLoginAt ? ` · Last login ${formatRelativeTime(user.lastLoginAt)}` : ''}
                  </span>
                </span>
                <div className={g.toolbar}>
                  <Badge variant={user.status === 'active' ? 'success' : user.status === 'suspended' ? 'error' : 'warning'}>
                    {user.status}
                  </Badge>
                  <Badge variant={user.mfaEnabled ? 'accent' : 'neutral'}>
                    {user.mfaEnabled ? 'MFA on' : 'MFA off'}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab === 'teams' && (
        <div className={styles.split}>
          <section className={g.panel}>
            <h2>Teams</h2>
            <ul className={g.list}>
              {teams.map((team) => (
                <li key={team.id} className={g.listItem}>
                  <span>
                    <strong>{team.name}</strong>
                    <br />
                    <span className={g.muted}>
                      Lead {getUser(team.leadId)?.name} · {team.memberIds.length} members
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
          <section className={g.panel}>
            <h2>Departments</h2>
            <ul className={g.list}>
              {departments.map((dept) => (
                <li key={dept.id} className={g.listItem}>
                  <span>
                    <strong>{dept.name}</strong>
                    <br />
                    <span className={g.muted}>Manager {getUser(dept.managerId)?.name}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}

      {tab === 'auth' && (
        <div className={g.stack}>
          <section className={g.panel}>
            <header className={g.row}>
              <div>
                <h2>SSO (mock)</h2>
                <p className={g.muted}>Enterprise single sign-on via your identity provider.</p>
              </div>
              <Button size="sm" variant="secondary" onClick={toggleSso}>
                {ssoEnabled ? 'Disable SSO' : 'Enable SSO'}
              </Button>
            </header>
            <Badge variant={ssoEnabled ? 'success' : 'neutral'}>{ssoEnabled ? 'Enabled' : 'Disabled'}</Badge>
          </section>
          <section className={g.panel}>
            <h2>SAML configuration (mock)</h2>
            <div className={styles.detailGrid}>
              <div className={styles.field}>
                <label>Entity ID</label>
                <p>https://auth.regintel.example/saml/metadata</p>
              </div>
              <div className={styles.field}>
                <label>ACS URL</label>
                <p>https://app.regintel.example/sso/saml/acs</p>
              </div>
              <div className={styles.field}>
                <label>Name ID format</label>
                <p>emailAddress</p>
              </div>
              <div className={styles.field}>
                <label>Certificate</label>
                <p>Uploaded · expires 2027-03-01</p>
              </div>
            </div>
          </section>
          <section className={g.panel}>
            <header className={g.row}>
              <div>
                <h2>SCIM provisioning (mock)</h2>
                <p className={g.muted}>Push users and groups from your directory.</p>
              </div>
              <Button size="sm" variant="secondary" onClick={toggleScim}>
                {scimEnabled ? 'Disable SCIM' : 'Enable SCIM'}
              </Button>
            </header>
            <Badge variant={scimEnabled ? 'success' : 'neutral'}>{scimEnabled ? 'Enabled' : 'Disabled'}</Badge>
            <p className={g.muted}>Bearer token: scim_live_••••••••····</p>
          </section>
        </div>
      )}

      {tab === 'sessions' && (
        <section className={g.panel}>
          <h2>Device sessions</h2>
          <ul className={g.list}>
            {deviceSessions.map((session) => (
              <li key={session.id} className={g.listItem}>
                <span>
                  <strong>{session.device}</strong>
                  <br />
                  <span className={g.muted}>
                    {getUser(session.userId)?.name ?? session.userId} · {session.browser} · Active{' '}
                    {formatRelativeTime(session.lastActiveAt)}
                  </span>
                </span>
                <div className={g.toolbar}>
                  {session.current && <Badge variant="accent">Current</Badge>}
                  {!session.current && (
                    <Button size="sm" variant="secondary" onClick={() => revokeSession(session.id)}>
                      Revoke
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab === 'security' && (
        <div className={g.stack}>
          <section className={g.panel}>
            <header className={g.row}>
              <div>
                <h2>MFA settings</h2>
                <p className={g.muted}>Require multi-factor authentication for all users.</p>
              </div>
              <Button size="sm" variant="secondary" onClick={toggleMfaRequired}>
                {mfaRequired ? 'Make optional' : 'Require MFA'}
              </Button>
            </header>
            <Badge variant={mfaRequired ? 'success' : 'warning'}>
              {mfaRequired ? 'Required' : 'Optional'}
            </Badge>
          </section>
          <section className={g.panel}>
            <h2>Password policies</h2>
            <ul className={g.list}>
              {[
                'Minimum 14 characters',
                'Require uppercase, lowercase, number, and symbol',
                '90-day rotation for privileged roles',
                'Block last 12 passwords',
              ].map((rule) => (
                <li key={rule} className={g.listItem}>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </section>
          <section className={g.panel}>
            <h2>Security policies</h2>
            <ul className={g.list}>
              {[
                live.enabled && live.idleTimeoutSeconds
                ? `Idle session timeout: ${Math.round(live.idleTimeoutSeconds / 60)} minutes`
                : 'Idle session timeout: 30 minutes',
                'Max concurrent sessions: 5',
                'IP allowlist: corporate VPN ranges',
                'Export of audit events requires Compliance Admin',
              ].map((rule) => (
                <li key={rule} className={g.listItem}>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}

      {tab === 'history' && (
        <section className={g.panel}>
          <h2>Login history</h2>
          <ul className={g.list}>
            {loginHistory.map((item) => (
              <li key={item.id} className={g.listItem}>
                <span>
                  <strong>{getUser(item.userId)?.name ?? item.userId}</strong>
                  <br />
                  <span className={g.muted}>
                    {item.ip} · {item.location}
                  </span>
                </span>
                <div className={g.toolbar}>
                  <Badge
                    variant={
                      item.result === 'success' ? 'success' : item.result === 'failure' ? 'error' : 'warning'
                    }
                  >
                    {item.result}
                  </Badge>
                  <time dateTime={item.at}>{formatRelativeTime(item.at)}</time>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </PageContainer>
  )
}
