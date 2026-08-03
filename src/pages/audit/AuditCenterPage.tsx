import { useMemo, useState } from 'react'
import { ClipboardList } from 'lucide-react'
import g from '../../components/governance/governance.module.css'
import { Badge } from '../../components/ui/Badge/Badge'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { useOperations } from '../../hooks/useOperations'
import type { AuditLifecycleStage } from '../../types/operations'
import { formatRelativeTime } from '../../utils/date'
import { OperationsHubNav } from '../operations/OperationsHubNav'
import styles from '../operations/operations.module.css'

const STAGES: AuditLifecycleStage[] = ['planning', 'fieldwork', 'reporting', 'remediation', 'closed']

export function AuditCenterPage() {
  const { audits, findings, evidenceRequests, auditUniverse } = useOperations()
  const [selectedId, setSelectedId] = useState(audits[0]?.id ?? '')
  const selected = audits.find((item) => item.id === selectedId) ?? audits[0]

  const selectedFindings = useMemo(
    () => findings.filter((item) => item.auditId === selected?.id),
    [findings, selected?.id],
  )
  const selectedRequests = useMemo(
    () => evidenceRequests.filter((item) => item.auditId === selected?.id),
    [evidenceRequests, selected?.id],
  )

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        title="Audit & Compliance Center"
        description="Plan engagements, track findings, manage evidence requests, and collaborate with external auditors."
        icon={<ClipboardList size={20} />}
      />

      <OperationsHubNav current="/audit" />

      <section className={g.panel} aria-label="Audit lifecycle visualization">
        <h2>Audit lifecycle</h2>
        <div className={styles.lifecycle}>
          {STAGES.map((stage) => (
            <div key={stage} className={selected?.stage === stage ? styles.stageActive : styles.stage}>
              {stage}
              <div className={g.muted} style={{ marginTop: 4 }}>
                {audits.filter((audit) => audit.stage === stage).length}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className={styles.split}>
        <section className={g.panel}>
          <h2>Audit planning & engagements</h2>
          <ul className={g.list}>
            {audits.map((audit) => (
              <li key={audit.id} className={g.listItem}>
                <button
                  type="button"
                  onClick={() => setSelectedId(audit.id)}
                  style={{ all: 'unset', cursor: 'pointer', flex: 1 }}
                  aria-pressed={selected?.id === audit.id}
                >
                  <strong>{audit.title}</strong>
                  <br />
                  <span className={g.muted}>
                    {audit.owner} · Open findings {audit.findingsOpen}
                    {audit.endDate ? ` · Ends ${audit.endDate}` : ` · Started ${audit.startDate}`}
                  </span>
                </button>
                <Badge variant={audit.stage === 'closed' ? 'success' : 'accent'}>{audit.stage}</Badge>
              </li>
            ))}
          </ul>
        </section>

        <aside className={g.stack}>
          <section className={g.panel}>
            <h2>Audit universe</h2>
            <ul className={g.list}>
              {auditUniverse.map((item) => (
                <li key={item} className={g.listItem}>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
          <section className={g.panel}>
            <h2>External auditor portal (mock)</h2>
            <p className={g.muted}>
              Secure share for PwC engagement team. Access scoped to evidence requests and closed findings only.
            </p>
            <Badge variant="accent">Portal ready</Badge>
            <p className={g.muted} style={{ marginTop: 8 }}>
              Last auditor login · 2 hours ago
            </p>
          </section>
        </aside>
      </div>

      {selected && (
        <div className={styles.split}>
          <section className={g.panel}>
            <h2>
              Findings · {selected.title}
            </h2>
            <ul className={g.list}>
              {selectedFindings.length === 0 ? (
                <li className={g.listItem}>
                  <span className={g.muted}>No findings for this engagement.</span>
                </li>
              ) : (
                selectedFindings.map((finding) => (
                  <li key={finding.id} className={g.listItem} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                    <div className={g.row}>
                      <strong>{finding.title}</strong>
                      <Badge
                        variant={
                          finding.severity === 'critical' || finding.severity === 'high'
                            ? 'error'
                            : finding.severity === 'medium'
                              ? 'warning'
                              : 'neutral'
                        }
                      >
                        {finding.severity}
                      </Badge>
                    </div>
                    <p className={g.muted}>Recommendation: {finding.recommendation}</p>
                    {finding.correctiveAction && (
                      <p className={g.muted}>Corrective action: {finding.correctiveAction}</p>
                    )}
                    <Badge variant={finding.status === 'closed' ? 'success' : 'accent'}>{finding.status}</Badge>
                  </li>
                ))
              )}
            </ul>
          </section>

          <section className={g.panel}>
            <h2>Evidence requests & timeline</h2>
            <ul className={g.list}>
              {selectedRequests.map((request) => (
                <li key={request.id} className={g.listItem}>
                  <span>
                    <strong>{request.title}</strong>
                    <br />
                    <span className={g.muted}>Due {formatRelativeTime(request.dueAt)}</span>
                  </span>
                  <Badge
                    variant={
                      request.status === 'received' ? 'success' : request.status === 'overdue' ? 'error' : 'warning'
                    }
                  >
                    {request.status}
                  </Badge>
                </li>
              ))}
            </ul>
            <h3>Audit programs</h3>
            <p className={g.muted}>
              Standard programs attached: walkthroughs, sample testing, management interview checklist.
            </p>
          </section>
        </div>
      )}
    </PageContainer>
  )
}
