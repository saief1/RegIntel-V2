import { Siren } from 'lucide-react'
import g from '../../components/governance/governance.module.css'
import { Badge } from '../../components/ui/Badge/Badge'
import { Button } from '../../components/ui/Button/Button'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { Select } from '../../components/ui/Select/Select'
import { useProdOps } from '../../hooks/useProdOps'
import type { IncidentStatus } from '../../types/prodops'
import { formatRelativeTime } from '../../utils/date'
import { ProdOpsHubNav } from './ProdOpsHubNav'
import styles from './operations.module.css'

function severityVariant(severity: string) {
  if (severity === 'critical') return 'error' as const
  if (severity === 'high') return 'warning' as const
  if (severity === 'medium') return 'accent' as const
  return 'neutral' as const
}

const LIFECYCLE: IncidentStatus[] = ['open', 'investigating', 'monitoring', 'resolved', 'closed']

export function IncidentsPage() {
  const { incidents, selectedIncidentId, selectIncident, updateIncidentStatus, services, globalStatus } = useProdOps()
  const selected = incidents.find((item) => item.id === selectedIncidentId) ?? incidents[0]

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        title="Incident Management"
        description="Track severity, lifecycle, customer impact, mitigation, and postmortems with a status page preview."
        icon={<Siren size={20} />}
      />

      <ProdOpsHubNav current="/operations/incidents" />

      <div className={styles.split}>
        <section aria-label="Incident list">
          <div className={g.grid}>
            {incidents.map((item) => (
              <button
                key={item.id}
                type="button"
                className={g.card}
                aria-pressed={selected?.id === item.id}
                onClick={() => selectIncident(item.id)}
              >
                <div className={g.meta}>
                  <Badge variant={severityVariant(item.severity)}>{item.severity}</Badge>
                  <Badge variant="neutral">{item.status}</Badge>
                </div>
                <h3>{item.title}</h3>
                <p className={g.muted}>
                  {item.id.toUpperCase()} · Owner {item.owner} · Updated {formatRelativeTime(item.updatedAt)}
                </p>
              </button>
            ))}
          </div>
        </section>

        <aside className={g.stack}>
          {selected && (
            <section className={g.panel}>
              <header className={g.row}>
                <div>
                  <h2>{selected.title}</h2>
                  <p className={g.muted}>{selected.id.toUpperCase()}</p>
                </div>
                <Badge variant={severityVariant(selected.severity)}>{selected.severity}</Badge>
              </header>

              <div className={styles.lifecycle} aria-label="Incident lifecycle">
                {LIFECYCLE.map((stage) => (
                  <div key={stage} className={selected.status === stage ? styles.stageActive : styles.stage}>
                    {stage}
                  </div>
                ))}
              </div>

              <label className={styles.formGrid} style={{ display: 'block' }}>
                Update status
                <Select
                  aria-label="Incident status"
                  value={selected.status}
                  onChange={(e) => updateIncidentStatus(selected.id, e.target.value as IncidentStatus)}
                >
                  {LIFECYCLE.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </Select>
              </label>

              <h3>Owner</h3>
              <p className={g.muted}>{selected.owner}</p>
              <h3>Impacted services</h3>
              <p className={g.muted}>{selected.impactedServices.join(', ')}</p>
              <h3>Customer impact</h3>
              <p className={g.muted}>{selected.customerImpact}</p>
              <h3>Root cause</h3>
              <p className={g.muted}>{selected.rootCause}</p>
              <h3>Mitigation</h3>
              <p className={g.muted}>{selected.mitigation}</p>
              <h3>Postmortem</h3>
              <p className={g.muted}>{selected.postmortem}</p>
              <h3>AI summary</h3>
              <p className={g.muted}>{selected.aiSummary}</p>
              <h3>Attachments</h3>
              {selected.attachments.length === 0 ? (
                <p className={g.muted}>No attachments.</p>
              ) : (
                <ul className={g.list}>
                  {selected.attachments.map((file) => (
                    <li key={file.id} className={g.listItem}>
                      <span>{file.name}</span>
                      <span className={g.muted}>{file.sizeLabel}</span>
                    </li>
                  ))}
                </ul>
              )}
              <h3>Timeline</h3>
              <ul className={g.list}>
                {selected.timeline.map((entry) => (
                  <li key={entry.id} className={g.listItem}>
                    <span>
                      <strong>{entry.actor}</strong>
                      <br />
                      <span className={g.muted}>{entry.note}</span>
                    </span>
                    <time dateTime={entry.at}>{formatRelativeTime(entry.at)}</time>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className={styles.statusPage} aria-label="Status page preview">
            <header className={g.row}>
              <h2>Status page preview</h2>
              <Badge variant={globalStatus === 'operational' ? 'success' : 'warning'}>{globalStatus}</Badge>
            </header>
            <p className={g.muted}>Public-facing summary (mock).</p>
            <ul className={g.list}>
              {services.map((svc) => (
                <li key={svc.id} className={g.listItem}>
                  <span>{svc.name}</span>
                  <Badge variant={svc.status === 'operational' ? 'success' : svc.status === 'degraded' ? 'warning' : 'error'}>
                    {svc.status}
                  </Badge>
                </li>
              ))}
            </ul>
            <Button size="sm" variant="secondary" disabled>
              Publish status update
            </Button>
          </section>
        </aside>
      </div>
    </PageContainer>
  )
}
