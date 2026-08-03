import { Link } from 'react-router-dom'
import { Database } from 'lucide-react'
import g from '../../components/governance/governance.module.css'
import { Badge } from '../../components/ui/Badge/Badge'
import { Button } from '../../components/ui/Button/Button'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { useOperations } from '../../hooks/useOperations'
import { formatRelativeTime } from '../../utils/date'
import { OperationsHubNav } from '../operations/OperationsHubNav'
import styles from '../operations/operations.module.css'

function jobVariant(status: string) {
  if (status === 'succeeded') return 'success' as const
  if (status === 'failed') return 'error' as const
  if (status === 'retrying' || status === 'running') return 'accent' as const
  return 'neutral' as const
}

export function DataManagementPage() {
  const {
    dataSources,
    dataJobs,
    dataQuality,
    retentionPolicies,
    duplicates,
    recordHistory,
    retryDataJob,
    queueMockImport,
  } = useOperations()

  const failed = dataJobs.filter((job) => job.status === 'failed' || job.status === 'retrying')

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        title="Data Management Center"
        description="Sources, imports, quality, retention, archiving, and restore jobs for enterprise data ops."
        icon={<Database size={20} />}
      />

      <OperationsHubNav current="/settings/data" />

      <nav className={styles.hubLinks} aria-label="Connected data">
        <Link className={styles.hubLink} to="/data/lineage">
          Data Lineage
        </Link>
        <Link className={styles.hubLink} to="/integrations/marketplace">
          Integration Marketplace
        </Link>
      </nav>

      <div className={g.toolbar}>
        <Button size="sm" variant="primary" onClick={() => queueMockImport('csv')}>
          CSV import (mock)
        </Button>
        <Button size="sm" variant="secondary" onClick={() => queueMockImport('excel')}>
          Excel import (mock)
        </Button>
        <Button size="sm" variant="secondary" onClick={() => queueMockImport('api')}>
          API import (mock)
        </Button>
      </div>

      <div className={g.metricGrid}>
        {dataQuality.map((metric) => (
          <div key={metric.id} className={g.metric}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <span className={g.muted} style={{ display: 'block', marginTop: 4 }}>
              {metric.detail}
            </span>
          </div>
        ))}
      </div>

      <div className={styles.split}>
        <section className={g.panel}>
          <h2>Data sources</h2>
          <ul className={g.list}>
            {dataSources.map((source) => (
              <li key={source.id} className={g.listItem}>
                <span>
                  <strong>{source.name}</strong>
                  <br />
                  <span className={g.muted}>
                    {source.kind} · {source.owner} · {source.records} records
                    {source.lastSyncAt ? ` · ${formatRelativeTime(source.lastSyncAt)}` : ''}
                  </span>
                </span>
                <Badge variant={source.status === 'connected' ? 'success' : source.status === 'degraded' ? 'warning' : 'neutral'}>
                  {source.status}
                </Badge>
              </li>
            ))}
          </ul>
        </section>

        <aside className={g.panel}>
          <h2>Failed import queue</h2>
          {failed.length === 0 ? (
            <p className={g.muted}>No failed imports.</p>
          ) : (
            <ul className={g.list}>
              {failed.map((job) => (
                <li key={job.id} className={g.listItem}>
                  <span>
                    <strong>{job.title}</strong>
                    <br />
                    <span className={g.muted}>{job.detail}</span>
                  </span>
                  <Button size="sm" variant="secondary" onClick={() => retryDataJob(job.id)}>
                    Retry
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>

      <section className={g.panel}>
        <h2>Import / export / archive / restore jobs</h2>
        <ul className={g.list}>
          {dataJobs.map((job) => (
            <li key={job.id} className={g.listItem}>
              <span>
                <strong>{job.title}</strong>
                <br />
                <span className={g.muted}>
                  {job.kind} · {job.detail} · Attempt {job.attempt}/{job.maxAttempts}
                </span>
              </span>
              <div className={g.toolbar}>
                <Badge variant={jobVariant(job.status)}>{job.status}</Badge>
                {(job.status === 'failed' || job.status === 'retrying') && (
                  <Button size="sm" variant="ghost" onClick={() => retryDataJob(job.id)}>
                    Retry
                  </Button>
                )}
                <time dateTime={job.createdAt}>{formatRelativeTime(job.createdAt)}</time>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className={styles.split}>
        <section className={g.panel}>
          <h2>Data retention & archiving</h2>
          <ul className={g.list}>
            {retentionPolicies.map((policy) => (
              <li key={policy.id} className={g.listItem}>
                <span>
                  <strong>{policy.name}</strong>
                  <br />
                  <span className={g.muted}>
                    Retain {policy.retentionDays}d · Archive after {policy.archiveAfterDays}d · {policy.appliesTo}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <h3>Duplicate detection</h3>
          <ul className={g.list}>
            {duplicates.map((item) => (
              <li key={item.id} className={g.listItem}>
                <span>
                  <strong>
                    {item.entity} · {item.count} candidates
                  </strong>
                  <br />
                  <span className={g.muted}>
                    {item.sample} · {item.confidence}% confidence
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className={g.panel}>
          <h2>Record history</h2>
          <ul className={g.list}>
            {recordHistory.map((item) => (
              <li key={item.id} className={g.listItem}>
                <span>
                  <strong>{item.entity}</strong>
                  <br />
                  <span className={g.muted}>
                    {item.action} · {item.actor}
                  </span>
                </span>
                <time dateTime={item.at}>{formatRelativeTime(item.at)}</time>
              </li>
            ))}
          </ul>
          <h3>Validation reports</h3>
          <p className={g.muted}>Latest policy validation: 3 warnings · 0 blockers. Scheduled imports run nightly at 06:00.</p>
        </section>
      </div>
    </PageContainer>
  )
}
