import { ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import g from '../../components/governance/governance.module.css'
import { Badge } from '../../components/ui/Badge/Badge'
import { Button } from '../../components/ui/Button/Button'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { useConnected } from '../../hooks/useConnected'
import { useOperations } from '../../hooks/useOperations'
import { useWork } from '../../hooks/useWork'
import { formatRelativeTime } from '../../utils/date'
import { OperationsHubNav } from '../operations/OperationsHubNav'
import styles from '../operations/operations.module.css'

export function SecurityCenterPage() {
  const {
    securityAlerts,
    acknowledgeAlert,
    trustedDevices,
    revokeDevice,
    ipRestrictions,
    toggleIpRestriction,
    secrets,
    securityScore,
    mfaCoverage,
  } = useOperations()
  const { deviceSessions, revokeSession, loginHistory, mfaRequired } = useConnected()
  const { getUser } = useWork()

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        title="Enterprise Security Center"
        description="Security posture, sessions, devices, alerts, IP controls, and secret management."
        icon={<ShieldCheck size={20} />}
      />

      <OperationsHubNav current="/settings/security" />

      <nav className={styles.hubLinks} aria-label="Security configuration">
        <Link className={styles.hubLink} to="/settings/security/sso">
          SSO Configuration
        </Link>
        <Link className={styles.hubLink} to="/settings/admin">
          Admin Console
        </Link>
      </nav>

      <div className={g.metricGrid} aria-label="Security dashboard">
        <div className={g.metric}>
          <span>Security risk score</span>
          <strong>{securityScore}</strong>
        </div>
        <div className={g.metric}>
          <span>MFA coverage</span>
          <strong>{mfaCoverage}%</strong>
        </div>
        <div className={g.metric}>
          <span>MFA policy</span>
          <strong>{mfaRequired ? 'Required' : 'Optional'}</strong>
        </div>
        <div className={g.metric}>
          <span>Open alerts</span>
          <strong>{securityAlerts.filter((alert) => !alert.acknowledged).length}</strong>
        </div>
      </div>

      <div className={styles.split}>
        <section className={g.panel}>
          <h2>Security alerts</h2>
          <ul className={g.list}>
            {securityAlerts.map((alert) => (
              <li key={alert.id} className={g.listItem}>
                <span>
                  <strong>{alert.title}</strong>
                  <br />
                  <span className={g.muted}>
                    {alert.detail} · Risk {alert.riskScore}
                  </span>
                </span>
                <div className={g.toolbar}>
                  <Badge
                    variant={
                      alert.severity === 'critical' || alert.severity === 'high'
                        ? 'error'
                        : alert.severity === 'medium'
                          ? 'warning'
                          : 'neutral'
                    }
                  >
                    {alert.severity}
                  </Badge>
                  {!alert.acknowledged ? (
                    <Button size="sm" variant="secondary" onClick={() => acknowledgeAlert(alert.id)}>
                      Acknowledge
                    </Button>
                  ) : (
                    <Badge variant="success">Ack</Badge>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <aside className={g.panel}>
          <header className={g.row}>
            <h2>Active sessions</h2>
            <Link className={styles.hubLink} to="/settings/admin">
              Admin sessions
            </Link>
          </header>
          <ul className={g.list}>
            {deviceSessions.map((session) => (
              <li key={session.id} className={g.listItem}>
                <span>
                  <strong>{session.device}</strong>
                  <br />
                  <span className={g.muted}>
                    {getUser(session.userId)?.name ?? session.userId} · {session.browser}
                  </span>
                </span>
                <div className={g.toolbar}>
                  {session.current ? (
                    <Badge variant="accent">Current</Badge>
                  ) : (
                    <Button size="sm" variant="secondary" onClick={() => revokeSession(session.id)}>
                      Revoke
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <div className={styles.split}>
        <section className={g.panel}>
          <h2>Device management / trusted devices</h2>
          <ul className={g.list}>
            {trustedDevices.map((device) => (
              <li key={device.id} className={g.listItem}>
                <span>
                  <strong>{device.name}</strong>
                  <br />
                  <span className={g.muted}>
                    {device.user} · {formatRelativeTime(device.lastSeenAt)}
                  </span>
                </span>
                <div className={g.toolbar}>
                  <Badge variant={device.trusted ? 'success' : 'warning'}>
                    {device.trusted ? 'Trusted' : 'Untrusted'}
                  </Badge>
                  <Button size="sm" variant="secondary" onClick={() => revokeDevice(device.id)}>
                    Revoke
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className={g.panel}>
          <h2>IP restrictions</h2>
          <ul className={g.list}>
            {ipRestrictions.map((item) => (
              <li key={item.id} className={g.listItem}>
                <span>
                  <strong>{item.label}</strong>
                  <br />
                  <span className={g.muted}>{item.cidr}</span>
                </span>
                <Button size="sm" variant="secondary" onClick={() => toggleIpRestriction(item.id)}>
                  {item.enabled ? 'Disable' : 'Enable'}
                </Button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className={styles.split}>
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
                    variant={item.result === 'success' ? 'success' : item.result === 'failure' ? 'error' : 'warning'}
                  >
                    {item.result}
                  </Badge>
                  <time dateTime={item.at}>{formatRelativeTime(item.at)}</time>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className={g.panel}>
          <h2>Encryption & secret management (mock)</h2>
          <p className={g.muted}>Data at rest: AES-256 · In transit: TLS 1.3 · KMS: simulated</p>
          <ul className={g.list}>
            {secrets.map((secret) => (
              <li key={secret.id} className={g.listItem}>
                <span>
                  <strong>{secret.name}</strong>
                  <br />
                  <span className={g.muted}>Rotated {formatRelativeTime(secret.lastRotatedAt)}</span>
                </span>
                <Badge
                  variant={
                    secret.status === 'active' ? 'success' : secret.status === 'expiring' ? 'warning' : 'accent'
                  }
                >
                  {secret.status}
                </Badge>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </PageContainer>
  )
}
