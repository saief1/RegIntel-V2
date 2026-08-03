import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BarChart3, Sparkles } from 'lucide-react'
import g from '../../components/governance/governance.module.css'
import { Button } from '../../components/ui/Button/Button'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { useGovernance } from '../../hooks/useGovernance'
import { useWork } from '../../hooks/useWork'
import type { ExportFormat, ReportKind } from '../../types/governance'
import { formatRelativeTime } from '../../utils/date'
import { isOverdue } from '../../utils/smartDueDates'
import connected from '../connected/connected.module.css'
import styles from './ReportsPage.module.css'

export function ReportsPage() {
  const navigate = useNavigate()
  const {
    policies,
    approvals,
    mappings,
    risks,
    reviewWarnings,
    impactAnalyses,
    reports,
    generateReport,
    can,
  } = useGovernance()
  const { tasks } = useWork()
  const [lastExport, setLastExport] = useState<string>('')

  const metrics = useMemo(() => {
    const published = policies.filter((item) => item.status === 'published').length
    const coverage =
      mappings.reduce((sum, item) => sum + item.coveragePercent, 0) / Math.max(mappings.length, 1)
    const openRisks = risks.filter((item) => item.severity === 'high' || item.severity === 'critical').length
    const approvalQueue = approvals.filter((item) => item.status === 'pending').length
    const overdue = tasks.filter((task) => isOverdue(task.dueDate, task.status)).length
    const highPriority = tasks.filter(
      (task) => (task.priority === 'high' || task.priority === 'urgent') && task.status !== 'completed',
    ).length
    const health = Math.max(0, Math.min(100, Math.round(coverage - openRisks * 4 - overdue * 3)))
    return { published, coverage: Math.round(coverage), openRisks, approvalQueue, overdue, highPriority, health }
  }, [approvals, mappings, policies, risks, tasks])

  function exportReport(kind: ReportKind, format: ExportFormat) {
    if (!can('export')) return
    const report = generateReport(kind, format)
    const body = [
      `# ${report.title}`,
      '',
      report.summary,
      '',
      `Compliance health: ${metrics.health}%`,
      `Policy coverage: ${metrics.coverage}%`,
      `Open high risks: ${metrics.openRisks}`,
      `Approval queue: ${metrics.approvalQueue}`,
      `Upcoming reviews: ${reviewWarnings.length}`,
    ].join('\n')
    void navigator.clipboard.writeText(body)
    setLastExport(`${report.title} copied as ${format.toUpperCase()} text package`)
  }

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        title="Executive Dashboard"
        description="Decision-ready governance posture for regulated financial institutions."
        icon={<BarChart3 size={20} />}
      />

      <nav className={connected.hubLinks} aria-label="Executive workspaces">
        <Link className={connected.hubLink} to="/reports/command">
          AI Command Center
        </Link>
        <Link className={connected.hubLink} to="/agents">
          AI Agents
        </Link>
        <Link className={connected.hubLink} to="/knowledge/graph">
          Knowledge Graph
        </Link>
      </nav>

      <section className={g.metricGrid} aria-label="Executive metrics">
        <article className={g.metric}>
          <span>Compliance Health</span>
          <strong>{metrics.health}%</strong>
        </article>
        <article className={g.metric}>
          <span>Open Risks</span>
          <strong>{metrics.openRisks}</strong>
        </article>
        <article className={g.metric}>
          <span>Policy Coverage</span>
          <strong>{metrics.coverage}%</strong>
        </article>
        <article className={g.metric}>
          <span>Upcoming Deadlines</span>
          <strong>{reviewWarnings.length}</strong>
        </article>
        <article className={g.metric}>
          <span>Approval Queue</span>
          <strong>{metrics.approvalQueue}</strong>
        </article>
        <article className={g.metric}>
          <span>High Priority Work</span>
          <strong>{metrics.highPriority}</strong>
        </article>
        <article className={g.metric}>
          <span>Board Readiness</span>
          <strong>{metrics.approvalQueue === 0 ? 'Ready' : 'In progress'}</strong>
        </article>
        <article className={g.metric}>
          <span>AI Insights</span>
          <strong>{impactAnalyses.length}</strong>
        </article>
      </section>

      <div className={styles.split}>
        <section className={g.panel}>
          <h2>
            <Sparkles size={16} aria-hidden="true" /> AI Impact Analysis
          </h2>
          <ul className={g.list}>
            {impactAnalyses.map((item) => (
              <li key={item.regulationId} className={g.listItem}>
                <div>
                  <strong>{item.regulationTitle}</strong>
                  <p className={g.muted}>
                    {item.affectedPolicies.length} policies · {item.affectedControls.length} controls ·{' '}
                    {item.estimatedWorkItems} work items · {item.estimatedHours}h
                  </p>
                  <p className={g.muted}>Vendors: {item.affectedVendors.join(', ')}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className={g.panel}>
          <h2>Approval queue</h2>
          <ul className={g.list}>
            {approvals
              .filter((item) => item.status === 'pending')
              .map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() =>
                      item.objectType === 'policy'
                        ? navigate(`/knowledge/policies/${item.objectId}`)
                        : navigate('/work')
                    }
                  >
                    <span>{item.title}</span>
                    <span>Review</span>
                  </button>
                </li>
              ))}
          </ul>
        </section>
      </div>

      <section className={g.panel}>
        <header className={g.row}>
          <h2>Reporting Engine</h2>
          {lastExport && <span className={g.muted}>{lastExport}</span>}
        </header>
        <div className={g.grid}>
          {(
            [
              ['board', 'Board reports'],
              ['executive_summary', 'Executive summaries'],
              ['compliance_status', 'Compliance status'],
              ['audit_evidence', 'Audit evidence packages'],
              ['policy_review', 'Policy review reports'],
              ['implementation', 'Regulatory implementation'],
            ] as const
          ).map(([kind, label]) => (
            <article key={kind} className={g.card} style={{ cursor: 'default' }}>
              <h3>{label}</h3>
              <div className={g.toolbar}>
                <Button size="sm" variant="secondary" disabled={!can('export')} onClick={() => exportReport(kind, 'pdf')}>
                  PDF
                </Button>
                <Button size="sm" variant="secondary" disabled={!can('export')} onClick={() => exportReport(kind, 'word')}>
                  Word
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={!can('export')}
                  onClick={() => exportReport(kind, 'powerpoint')}
                >
                  PowerPoint
                </Button>
              </div>
            </article>
          ))}
        </div>
        <ul className={g.list}>
          {reports.slice(0, 5).map((report) => (
            <li key={report.id} className={g.listItem}>
              <span>
                <strong>{report.title}</strong>
                <br />
                <span className={g.muted}>
                  {report.format} · {formatRelativeTime(report.createdAt)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </PageContainer>
  )
}
