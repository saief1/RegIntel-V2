import { Activity } from 'lucide-react'
import { Link } from 'react-router-dom'
import g from '../../components/governance/governance.module.css'
import { Badge } from '../../components/ui/Badge/Badge'
import { Button } from '../../components/ui/Button/Button'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { useOperations } from '../../hooks/useOperations'
import { formatRelativeTime } from '../../utils/date'
import { OperationsHubNav } from '../operations/OperationsHubNav'
import styles from '../operations/operations.module.css'

export function SystemHealthPage() {
  const {
    services,
    globalJobs,
    retryGlobalJob,
    featureFlags,
    toggleFeatureFlag,
    releaseNotes,
    maintenanceMode,
    toggleMaintenanceMode,
  } = useOperations()

  const failed = globalJobs.filter((job) => job.status === 'failed' || job.status === 'retrying')
  const queueDepth = globalJobs.reduce((sum, job) => sum + (job.depth ?? 0), 0)
  const avgLatency = Math.round(services.reduce((sum, svc) => sum + svc.latencyMs, 0) / Math.max(services.length, 1))

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        title="System Health Center"
        description="Platform status, queues, integrations, AI agents, storage, cache, and scheduled jobs."
        icon={<Activity size={20} />}
      />

      <OperationsHubNav current="/system" />

      <nav className={styles.hubLinks} aria-label="Production operations">
        <Link className={styles.hubLink} to="/operations">
          Operations Center
        </Link>
        <Link className={styles.hubLink} to="/operations/observability">
          Observability
        </Link>
        <Link className={styles.hubLink} to="/operations/deployments">
          Deployments
        </Link>
      </nav>

      <div className={g.metricGrid} aria-label="Platform status">
        <div className={g.metric}>
          <span>Uptime (app)</span>
          <strong>{services.find((svc) => svc.id === 'svc-app')?.uptime ?? '—'}</strong>
        </div>
        <div className={g.metric}>
          <span>Avg response</span>
          <strong>{avgLatency} ms</strong>
        </div>
        <div className={g.metric}>
          <span>Queue depth</span>
          <strong>{queueDepth}</strong>
        </div>
        <div className={g.metric}>
          <span>Failed / retrying</span>
          <strong>{failed.length}</strong>
        </div>
      </div>

      <section className={g.panel}>
        <header className={g.row}>
          <h2>Service health</h2>
          <Button size="sm" variant="secondary" onClick={toggleMaintenanceMode}>
            {maintenanceMode ? 'Disable maintenance mode' : 'Enable maintenance mode'}
          </Button>
        </header>
        <div className={g.grid}>
          {services.map((service) => (
            <article key={service.id} className={g.card} style={{ cursor: 'default' }}>
              <div className={g.meta}>
                <Badge
                  variant={
                    service.status === 'operational'
                      ? 'success'
                      : service.status === 'degraded'
                        ? 'warning'
                        : 'error'
                  }
                >
                  {service.status}
                </Badge>
                <Badge variant="neutral">{service.category}</Badge>
              </div>
              <h3>{service.name}</h3>
              <p className={g.muted}>
                Latency {service.latencyMs} ms · Uptime {service.uptime}
              </p>
            </article>
          ))}
        </div>
      </section>

      <div className={styles.split}>
        <section className={g.panel}>
          <h2>Background jobs / queue monitor</h2>
          <ul className={g.list}>
            {globalJobs.map((job) => (
              <li key={job.id} className={g.listItem}>
                <span>
                  <strong>{job.name}</strong>
                  <br />
                  <span className={g.muted}>
                    {job.queue} · {job.detail}
                    {typeof job.depth === 'number' ? ` · Depth ${job.depth}` : ''} · Attempt {job.attempt}/
                    {job.maxAttempts}
                  </span>
                </span>
                <div className={g.toolbar}>
                  <Badge
                    variant={
                      job.status === 'succeeded'
                        ? 'success'
                        : job.status === 'failed'
                          ? 'error'
                          : job.status === 'running' || job.status === 'retrying'
                            ? 'accent'
                            : 'neutral'
                    }
                  >
                    {job.status}
                  </Badge>
                  {(job.status === 'failed' || job.status === 'retrying') && (
                    <Button size="sm" variant="secondary" onClick={() => retryGlobalJob(job.id)}>
                      Retry
                    </Button>
                  )}
                  <time dateTime={job.updatedAt}>{formatRelativeTime(job.updatedAt)}</time>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <aside className={g.stack}>
          <section className={g.panel}>
            <h2>Resource usage (simulated)</h2>
            <ul className={g.list}>
              {[
                ['CPU', '41%'],
                ['Memory', '63%'],
                ['Storage', '58%'],
                ['Cache hit ratio', '94%'],
              ].map(([label, value]) => (
                <li key={label} className={g.listItem}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </li>
              ))}
            </ul>
          </section>
          <section className={g.panel}>
            <h2>Feature flags (mock)</h2>
            <ul className={g.list}>
              {featureFlags.map((flag) => (
                <li key={flag.id} className={g.listItem}>
                  <span>
                    <strong>{flag.key}</strong>
                    <br />
                    <span className={g.muted}>{flag.description}</span>
                  </span>
                  <Button size="sm" variant="secondary" onClick={() => toggleFeatureFlag(flag.id)}>
                    {flag.enabled ? 'Disable' : 'Enable'}
                  </Button>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>

      <section className={g.panel}>
        <h2>Release notes viewer</h2>
        <ul className={g.list}>
          {releaseNotes.map((note) => (
            <li key={note.id} className={g.listItem} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <div className={g.row}>
                <strong>
                  {note.version} · {note.title}
                </strong>
                <time dateTime={note.publishedAt}>{formatRelativeTime(note.publishedAt)}</time>
              </div>
              <ul className={g.list}>
                {note.highlights.map((item) => (
                  <li key={item} className={g.listItem}>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>
    </PageContainer>
  )
}
