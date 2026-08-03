import { useMemo, useState } from 'react'
import { BarChart3 } from 'lucide-react'
import { Link } from 'react-router-dom'
import g from '../../components/governance/governance.module.css'
import { Badge } from '../../components/ui/Badge/Badge'
import { Button } from '../../components/ui/Button/Button'
import { Input } from '../../components/ui/Input/Input'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { Select } from '../../components/ui/Select/Select'
import { useAnalytics } from '../../hooks/useAnalytics'
import type { DateRangeKey } from '../../types/analytics'
import { formatRelativeTime } from '../../utils/date'
import styles from './analytics.module.css'
import { ReportsHubNav } from './ReportsHubNav'

function heatColor(score: number) {
  if (score >= 75) return 'rgb(220 38 38 / 22%)'
  if (score >= 60) return 'rgb(217 119 6 / 20%)'
  return 'rgb(22 163 74 / 16%)'
}

export function AnalyticsCenterPage() {
  const {
    metrics,
    heatmap,
    regulatoryTrend,
    departments,
    dateRange,
    setDateRange,
    businessUnit,
    setBusinessUnit,
    businessUnits,
    savedViews,
    activeViewId,
    applyView,
    saveCurrentView,
    toggleFavoriteView,
    toggleSharedView,
    exportQueue,
    queueExport,
    bookmarks,
    addBookmark,
    scheduledReports,
    toggleScheduledReport,
  } = useAnalytics()
  const [viewName, setViewName] = useState('')
  const [drill, setDrill] = useState<string | null>(null)

  const areas = useMemo(() => [...new Set(heatmap.map((cell) => cell.riskArea))], [heatmap])
  const depts = useMemo(() => [...new Set(heatmap.map((cell) => cell.department))], [heatmap])
  const maxTrend = Math.max(...regulatoryTrend.map((point) => point.value), 1)

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        title="Executive Analytics Center"
        description="Compliance posture, risk heat, capacity, and audit readiness for leadership review."
        icon={<BarChart3 size={20} />}
      />

      <ReportsHubNav current="/reports/analytics" />

      <div className={g.toolbar}>
        <Select aria-label="Date range" value={dateRange} onChange={(e) => setDateRange(e.target.value as DateRangeKey)}>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="ytd">Year to date</option>
        </Select>
        <Select aria-label="Business unit" value={businessUnit} onChange={(e) => setBusinessUnit(e.target.value)}>
          {businessUnits.map((unit) => (
            <option key={unit} value={unit}>
              {unit === 'all' ? 'All business units' : unit}
            </option>
          ))}
        </Select>
        <Button size="sm" variant="secondary" onClick={() => queueExport(`Analytics · ${dateRange} · ${businessUnit}`, 'pdf')}>
          Export PDF
        </Button>
        <Button size="sm" variant="secondary" onClick={() => queueExport(`Analytics · ${dateRange}`, 'csv')}>
          Export CSV
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => addBookmark(`Analytics ${dateRange}/${businessUnit}`, '/reports/analytics')}
        >
          Bookmark
        </Button>
      </div>

      <section className={g.metricGrid} aria-label="Executive analytics metrics">
        {metrics.map((metric) => (
          <button
            key={metric.id}
            type="button"
            className={g.metric}
            onClick={() => setDrill(metric.label)}
            style={{ textAlign: 'left', cursor: 'pointer', font: 'inherit' }}
          >
            <span>{metric.label}</span>
            <strong className={metric.tone === 'positive' ? styles.tonePositive : metric.tone === 'warning' ? styles.toneWarning : metric.tone === 'critical' ? styles.toneCritical : undefined}>
              {metric.value}
            </strong>
            <span className={g.muted} style={{ display: 'block', marginTop: 4 }}>
              {metric.delta}
            </span>
          </button>
        ))}
      </section>

      {drill && (
        <section className={g.panel} aria-live="polite">
          <header className={g.row}>
            <h2>Drill-down · {drill}</h2>
            <Button size="sm" variant="ghost" onClick={() => setDrill(null)}>
              Close
            </Button>
          </header>
          <p className={g.muted}>
            Filtered to {dateRange} · {businessUnit === 'all' ? 'all business units' : businessUnit}. Open linked
            operational views for remediation.
          </p>
          <div className={styles.hubLinks}>
            <Link className={styles.hubLink} to="/agents/queue">
              Work Queue
            </Link>
            <Link className={styles.hubLink} to="/reports/predictive">
              Predictive detail
            </Link>
            <Link className={styles.hubLink} to="/knowledge/graph">
              Knowledge Graph
            </Link>
          </div>
        </section>
      )}

      <div className={styles.split}>
        <section className={g.panel}>
          <h2>Risk heatmap</h2>
          <div className={styles.heatGrid} role="grid" aria-label="Department risk heatmap">
            <div className={styles.heatHead} />
            {areas.map((area) => (
              <div key={area} className={styles.heatHead} role="columnheader">
                {area}
              </div>
            ))}
            {depts.map((department) => (
              <div key={department} style={{ display: 'contents' }}>
                <div className={styles.heatLabel} role="rowheader">
                  {department}
                </div>
                {areas.map((area) => {
                  const cell = heatmap.find((item) => item.department === department && item.riskArea === area)
                  const score = cell?.score ?? 0
                  return (
                    <button
                      key={`${department}-${area}`}
                      type="button"
                      className={styles.heatCell}
                      style={{ background: heatColor(score) }}
                      onClick={() => setDrill(`${department} · ${area}`)}
                      aria-label={`${department} ${area} risk score ${score}`}
                    >
                      {score}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </section>

        <aside className={g.stack}>
          <section className={g.panel}>
            <h2>Regulatory trend</h2>
            <div className={styles.bars} role="img" aria-label="Regulatory change volume trend">
              {regulatoryTrend.map((point) => (
                <div key={point.label} className={styles.barCol}>
                  <div className={styles.bar} style={{ height: `${Math.round((point.value / maxTrend) * 100)}px` }} />
                  <span className={styles.barLabel}>
                    {point.label} ({point.value})
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className={g.panel}>
            <h2>Saved dashboard views</h2>
            <div className={g.toolbar}>
              <Input
                aria-label="New view name"
                placeholder="Save current filters as…"
                value={viewName}
                onChange={(e) => setViewName(e.target.value)}
              />
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  saveCurrentView(viewName)
                  setViewName('')
                }}
              >
                Save view
              </Button>
            </div>
            <ul className={g.list}>
              {savedViews.map((view) => (
                <li key={view.id} className={g.listItem}>
                  <span>
                    <strong>{view.name}</strong>
                    <br />
                    <span className={g.muted}>
                      {view.dateRange} · {view.businessUnit} · {view.permission}
                    </span>
                  </span>
                  <div className={g.toolbar}>
                    {activeViewId === view.id && <Badge variant="accent">Active</Badge>}
                    <Button size="sm" variant="ghost" onClick={() => applyView(view.id)}>
                      Apply
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => toggleFavoriteView(view.id)}>
                      {view.favorite ? 'Unfavorite' : 'Favorite'}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => toggleSharedView(view.id)}>
                      {view.shared ? 'Unshare' : 'Share'}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>

      <section className={g.panel}>
        <h2>Department performance</h2>
        <ul className={g.list}>
          {departments.map((dept) => (
            <li key={dept.id} className={g.listItem}>
              <button type="button" onClick={() => setDrill(dept.name)} style={{ all: 'unset', cursor: 'pointer', flex: 1 }}>
                <strong>{dept.name}</strong>
                <br />
                <span className={g.muted}>
                  Score {dept.score} · Coverage {dept.coverage}% · Approvals {dept.openApprovals} · Evidence{' '}
                  {dept.evidenceCompleteness}%
                </span>
              </button>
              <Badge variant={dept.score >= 80 ? 'success' : dept.score >= 70 ? 'warning' : 'error'}>{dept.score}</Badge>
            </li>
          ))}
        </ul>
      </section>

      <div className={styles.split}>
        <section className={g.panel}>
          <h2>Export queue</h2>
          <ul className={g.list}>
            {exportQueue.map((job) => (
              <li key={job.id} className={g.listItem}>
                <span>
                  <strong>{job.title}</strong>
                  <br />
                  <span className={g.muted}>
                    {job.format.toUpperCase()} · {job.destination}
                  </span>
                </span>
                <div className={g.toolbar}>
                  <Badge variant={job.status === 'ready' ? 'success' : job.status === 'failed' ? 'error' : 'accent'}>
                    {job.status}
                  </Badge>
                  <time dateTime={job.createdAt}>{formatRelativeTime(job.createdAt)}</time>
                </div>
              </li>
            ))}
          </ul>
        </section>
        <section className={g.panel}>
          <h2>Scheduled reports & bookmarks</h2>
          <ul className={g.list}>
            {scheduledReports.map((report) => (
              <li key={report.id} className={g.listItem}>
                <span>
                  <strong>{report.name}</strong>
                  <br />
                  <span className={g.muted}>
                    {report.cadence} · {report.format.toUpperCase()} · {report.recipients}
                  </span>
                </span>
                <Button size="sm" variant="secondary" onClick={() => toggleScheduledReport(report.id)}>
                  {report.enabled ? 'Disable' : 'Enable'}
                </Button>
              </li>
            ))}
          </ul>
          <h3>Executive bookmarks</h3>
          <ul className={g.list}>
            {bookmarks.map((item) => (
              <li key={item.id} className={g.listItem}>
                <Link className={styles.hubLink} to={item.href}>
                  {item.label}
                </Link>
                <time dateTime={item.createdAt}>{formatRelativeTime(item.createdAt)}</time>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </PageContainer>
  )
}
