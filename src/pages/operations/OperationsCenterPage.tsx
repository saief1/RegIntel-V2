import { useState } from 'react'
import { Gauge } from 'lucide-react'
import { Link } from 'react-router-dom'
import g from '../../components/governance/governance.module.css'
import { Badge } from '../../components/ui/Badge/Badge'
import { Button } from '../../components/ui/Button/Button'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { useProdOps } from '../../hooks/useProdOps'
import { formatRelativeTime } from '../../utils/date'
import { ProdOpsHubNav } from './ProdOpsHubNav'
import styles from './operations.module.css'

type OpsView = 'overview' | 'infrastructure' | 'services' | 'jobs' | 'maintenance'

function svcVariant(status: string) {
  if (status === 'operational') return 'success' as const
  if (status === 'degraded') return 'warning' as const
  return 'error' as const
}

function jobVariant(status: string) {
  if (status === 'succeeded') return 'success' as const
  if (status === 'failed') return 'error' as const
  if (status === 'retrying' || status === 'running') return 'accent' as const
  return 'neutral' as const
}

export function OperationsCenterPage() {
  const { health, cards, services, jobs, maintenance, timeline, retryJob, liveRefresh, lastRefreshedAt, bumpRefresh } =
    useProdOps()
  const [view, setView] = useState<OpsView>('overview')

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        title="Operations Center"
        description="Production monitoring for platform health, incidents, jobs, infrastructure, and maintenance."
        icon={<Gauge size={20} />}
      />

      <ProdOpsHubNav current="/operations" />

      <div className={g.toolbar}>
        <div className={g.tabs} role="tablist" aria-label="Operations views">
          {(
            [
              ['overview', 'Overview'],
              ['infrastructure', 'Infrastructure'],
              ['services', 'Services'],
              ['jobs', 'Jobs'],
              ['maintenance', 'Maintenance'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={view === id}
              className={view === id ? g.tabActive : g.tab}
              onClick={() => setView(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <Badge variant="success">Health {health.score}</Badge>
        <Badge variant="neutral">Live {liveRefresh ? 'on' : 'off'}</Badge>
        <Button size="sm" variant="ghost" onClick={bumpRefresh}>
          Refresh · {formatRelativeTime(lastRefreshedAt)}
        </Button>
      </div>

      {(view === 'overview' || view === 'infrastructure') && (
        <div className={g.metricGrid} aria-label="Operations dashboard">
          {cards.map((card) => (
            <div key={card.id} className={g.metric}>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
              <span className={g.muted}>{card.hint}</span>
            </div>
          ))}
        </div>
      )}

      {view === 'overview' && (
        <div className={styles.split}>
          <section className={g.panel}>
            <h2>Service dependency map</h2>
            <div className={styles.depMap} role="list">
              {services.map((svc, index) => (
                <div key={svc.id} className={styles.flow} role="listitem">
                  <span className={svc.status === 'operational' ? styles.node : styles.nodeActive}>
                    {svc.name}
                    <Badge variant={svcVariant(svc.status)}>{svc.status}</Badge>
                  </span>
                  {index < services.length - 1 && (
                    <span className={styles.arrow} aria-hidden="true">
                      →
                    </span>
                  )}
                </div>
              ))}
            </div>
            <p className={g.muted}>Depends-on edges encoded in the platform graph (mock).</p>
          </section>
          <aside className={g.panel}>
            <h2>Platform timeline</h2>
            <ul className={g.list}>
              {timeline.map((item) => (
                <li key={item.id} className={g.listItem}>
                  <span>
                    <Badge variant="neutral">{item.kind}</Badge> <strong>{item.title}</strong>
                    <br />
                    <span className={g.muted}>{item.detail}</span>
                  </span>
                  <time dateTime={item.at}>{formatRelativeTime(item.at)}</time>
                </li>
              ))}
            </ul>
            <Link className={styles.hubLink} to="/operations/incidents">
              Open incidents
            </Link>
          </aside>
        </div>
      )}

      {(view === 'services' || view === 'infrastructure') && (
        <section className={g.panel}>
          <h2>Services</h2>
          <div className={g.grid}>
            {services.map((svc) => (
              <article key={svc.id} className={g.card} style={{ cursor: 'default' }}>
                <div className={g.meta}>
                  <Badge variant={svcVariant(svc.status)}>{svc.status}</Badge>
                </div>
                <h3>{svc.name}</h3>
                <p className={g.muted}>
                  Depends on: {svc.dependsOn.map((id) => services.find((s) => s.id === id)?.name ?? id).join(', ') || '—'}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}

      {view === 'jobs' && (
        <section className={g.panel}>
          <header className={g.row}>
            <h2>Background job monitor</h2>
            <Badge variant="neutral">Depth {jobs.reduce((sum, job) => sum + job.depth, 0)}</Badge>
          </header>
          <ul className={g.list}>
            {jobs.map((job) => (
              <li key={job.id} className={g.listItem}>
                <span>
                  <strong>{job.name}</strong>
                  <br />
                  <span className={g.muted}>
                    {job.queue} · depth {job.depth} · attempts {job.attempts} · {formatRelativeTime(job.lastRunAt)}
                  </span>
                </span>
                <div className={g.toolbar}>
                  <Badge variant={jobVariant(job.status)}>{job.status}</Badge>
                  {(job.status === 'failed' || job.status === 'retrying') && (
                    <Button size="sm" variant="secondary" onClick={() => retryJob(job.id)}>
                      Retry failed job
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {view === 'maintenance' && (
        <section className={g.panel}>
          <h2>Scheduled maintenance</h2>
          <ul className={g.list}>
            {maintenance.map((item) => (
              <li key={item.id} className={g.listItem}>
                <span>
                  <strong>{item.title}</strong>
                  <br />
                  <span className={g.muted}>
                    {formatRelativeTime(item.startsAt)} → {formatRelativeTime(item.endsAt)}
                  </span>
                </span>
                <Badge variant={item.status === 'scheduled' ? 'accent' : item.status === 'active' ? 'warning' : 'neutral'}>
                  {item.status}
                </Badge>
              </li>
            ))}
          </ul>
        </section>
      )}
    </PageContainer>
  )
}
