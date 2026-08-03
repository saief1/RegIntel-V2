import { Plug } from 'lucide-react'
import { Link } from 'react-router-dom'
import g from '../../components/governance/governance.module.css'
import { Badge } from '../../components/ui/Badge/Badge'
import { Button } from '../../components/ui/Button/Button'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { useConnected } from '../../hooks/useConnected'
import { useWork } from '../../hooks/useWork'
import { formatRelativeTime } from '../../utils/date'
import { healthVariant, queueVariant, statusVariant } from '../connected/statusBadge'
import styles from '../connected/connected.module.css'

export function IntegrationsPage() {
  const {
    integrations,
    syncQueue,
    selectedIntegrationId,
    selectIntegration,
    disconnectIntegration,
    reconnectIntegration,
    retrySync,
    globalActivity,
  } = useConnected()
  const { getUser } = useWork()
  const selected = integrations.find((item) => item.id === selectedIntegrationId) ?? integrations[0]

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        title="Integrations"
        description="Connect RegIntel to collaboration, ticketing, storage, and developer systems."
        icon={<Plug size={20} />}
      />

      <nav className={styles.hubLinks} aria-label="Connected enterprise areas">
        <Link className={styles.hubLink} to="/integrations/marketplace">
          Marketplace
        </Link>
        <Link className={styles.hubLink} to="/integrations/builder">
          Integration Builder
        </Link>
        <Link className={styles.hubLink} to="/data/lineage">
          Data Lineage
        </Link>
        <Link className={styles.hubLink} to="/settings/api">
          API Platform
        </Link>
        <Link className={styles.hubLink} to="/agents">
          AI Agents
        </Link>
        <Link className={styles.hubLink} to="/settings">
          Settings
        </Link>
      </nav>

      <div className={g.metricGrid}>
        <div className={g.metric}>
          <span>Connected</span>
          <strong>{integrations.filter((i) => i.status === 'connected' || i.status === 'syncing').length}</strong>
        </div>
        <div className={g.metric}>
          <span>Degraded / error</span>
          <strong>{integrations.filter((i) => i.status === 'degraded' || i.status === 'error').length}</strong>
        </div>
        <div className={g.metric}>
          <span>Sync queue</span>
          <strong>{syncQueue.filter((i) => i.status !== 'completed').length}</strong>
        </div>
      </div>

      <div className={styles.split}>
        <section className={g.stack} aria-label="Integration catalog">
          <div className={g.grid}>
            {integrations.map((item) => (
              <button
                key={item.id}
                type="button"
                className={g.card}
                aria-pressed={selected?.id === item.id}
                onClick={() => selectIntegration(item.id)}
              >
                <div className={g.meta}>
                  <Badge variant={statusVariant(item.status)}>{item.status}</Badge>
                  <Badge variant={healthVariant(item.health)}>{item.health}</Badge>
                  {item.status === 'syncing' ? (
                    <span className={styles.syncDot} aria-label="Live sync" />
                  ) : item.status === 'connected' ? (
                    <span className={styles.syncDotIdle} aria-label="Connection healthy" />
                  ) : null}
                </div>
                <h3>{item.name}</h3>
                <p className={g.muted}>
                  {item.category} · Sync {item.syncFrequency}
                  {item.lastSyncAt ? ` · Last sync ${formatRelativeTime(item.lastSyncAt)}` : ''}
                </p>
              </button>
            ))}
          </div>
        </section>

        <aside className={g.stack}>
          {selected && (
            <section className={g.panel} aria-label={`${selected.name} details`}>
              <header className={g.row}>
                <h2>{selected.name}</h2>
                <Badge variant={statusVariant(selected.status)}>{selected.status}</Badge>
              </header>
              <div className={styles.detailGrid}>
                <div className={styles.field}>
                  <label>Health</label>
                  <p>{selected.health}</p>
                </div>
                <div className={styles.field}>
                  <label>Owner</label>
                  <p>{getUser(selected.ownerId)?.name ?? selected.ownerId}</p>
                </div>
                <div className={styles.field}>
                  <label>Last sync</label>
                  <p>{selected.lastSyncAt ? formatRelativeTime(selected.lastSyncAt) : '—'}</p>
                </div>
                <div className={styles.field}>
                  <label>Connected since</label>
                  <p>{selected.connectedSince ? formatRelativeTime(selected.connectedSince) : 'Not connected'}</p>
                </div>
                <div className={styles.field}>
                  <label>Sync frequency</label>
                  <p>{selected.syncFrequency}</p>
                </div>
                <div className={styles.field}>
                  <label>Permissions</label>
                  <p>{selected.permissions.join(', ')}</p>
                </div>
              </div>
              <div className={g.toolbar}>
                {selected.status === 'disconnected' ? (
                  <Button size="sm" variant="primary" onClick={() => reconnectIntegration(selected.id)}>
                    Connect
                  </Button>
                ) : (
                  <Button size="sm" variant="secondary" onClick={() => disconnectIntegration(selected.id)}>
                    Disconnect
                  </Button>
                )}
              </div>
              <h3>Activity log</h3>
              <ul className={g.list}>
                {selected.activity.length === 0 ? (
                  <li className={g.listItem}>
                    <span className={g.muted}>No activity yet.</span>
                  </li>
                ) : (
                  selected.activity.map((entry) => (
                    <li key={entry.id} className={g.listItem}>
                      <span>
                        <strong>{entry.level}</strong> · {entry.message}
                      </span>
                      <time dateTime={entry.at}>{formatRelativeTime(entry.at)}</time>
                    </li>
                  ))
                )}
              </ul>
              {selected.errorHistory.length > 0 && (
                <>
                  <h3>Error history</h3>
                  <ul className={g.list}>
                    {selected.errorHistory.map((error) => (
                      <li key={error} className={g.listItem}>
                        <span className={g.muted}>{error}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>
          )}

          <section className={g.panel}>
            <h2>Background sync queue</h2>
            <ul className={g.list}>
              {syncQueue.map((item) => (
                <li key={item.id} className={g.listItem}>
                  <span>
                    <strong>{item.integrationName}</strong>
                    <br />
                    <span className={g.muted}>
                      {item.detail} · Attempt {item.attempt}/{item.maxAttempts}
                    </span>
                  </span>
                  <div className={g.toolbar}>
                    <Badge variant={queueVariant(item.status)}>{item.status}</Badge>
                    {(item.status === 'failed' || item.status === 'retrying') && (
                      <Button size="sm" variant="secondary" onClick={() => retrySync(item.id)}>
                        Retry
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className={g.panel}>
            <h2>Global activity stream</h2>
            <ul className={g.list}>
              {globalActivity.slice(0, 8).map((item) => (
                <li key={item.id} className={g.listItem}>
                  <span>
                    <strong>{item.title}</strong>
                    <br />
                    <span className={g.muted}>
                      {item.source} · {item.detail}
                    </span>
                  </span>
                  <time dateTime={item.at}>{formatRelativeTime(item.at)}</time>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </PageContainer>
  )
}
