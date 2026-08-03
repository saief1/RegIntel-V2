import { Activity } from 'lucide-react'
import g from '../../components/governance/governance.module.css'
import { Badge } from '../../components/ui/Badge/Badge'
import { Button } from '../../components/ui/Button/Button'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { useCommercial } from '../../hooks/useCommercial'
import { CommercialHubNav } from './CommercialHubNav'
import styles from './commercial.module.css'

export function UsagePage() {
  const {
    usageSnapshot,
    usageSeries,
    usageMeters,
    topUsers,
    featureAdoption,
    departmentUsage,
    exportUsageCsv,
    lastUsageExport,
  } = useCommercial()

  const maxAi = Math.max(...usageSeries.map((point) => point.aiRequests), 1)

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        title="Usage & Consumption Analytics"
        description="AI, API, storage, workflows, automation, reports, active users, and monthly trends."
        icon={<Activity size={20} />}
        actions={
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              exportUsageCsv()
            }}
          >
            Export CSV
          </Button>
        }
      />

      <CommercialHubNav current="/settings/usage" />

      {lastUsageExport && (
        <div className={styles.bannerRow} role="status">
          <div>
            <strong>CSV export ready (mock)</strong>
            <p style={{ margin: '4px 0 0', fontSize: 'var(--ri-font-size-body-sm)' }}>
              {lastUsageExport.split('\n').length - 1} monthly rows prepared in memory.
            </p>
          </div>
          <Badge variant="accent">usage-trends.csv</Badge>
        </div>
      )}

      <div className={g.metricGrid} aria-label="Usage snapshot">
        <div className={g.metric}>
          <span>AI requests</span>
          <strong>{usageSnapshot.aiRequests.toLocaleString()}</strong>
          <span className={g.muted}>This period</span>
        </div>
        <div className={g.metric}>
          <span>Copilot sessions</span>
          <strong>{usageSnapshot.copilotSessions.toLocaleString()}</strong>
          <span className={g.muted}>Sessions</span>
        </div>
        <div className={g.metric}>
          <span>API calls</span>
          <strong>{usageSnapshot.apiCalls.toLocaleString()}</strong>
          <span className={g.muted}>Calls</span>
        </div>
        <div className={g.metric}>
          <span>Storage</span>
          <strong>{usageSnapshot.storageGb} GB</strong>
          <span className={g.muted}>Consumed</span>
        </div>
        <div className={g.metric}>
          <span>Workflow executions</span>
          <strong>{usageSnapshot.workflowExecutions.toLocaleString()}</strong>
          <span className={g.muted}>Runs</span>
        </div>
        <div className={g.metric}>
          <span>Automation runs</span>
          <strong>{usageSnapshot.automationRuns.toLocaleString()}</strong>
          <span className={g.muted}>Runs</span>
        </div>
        <div className={g.metric}>
          <span>Reports</span>
          <strong>{usageSnapshot.reportsGenerated}</strong>
          <span className={g.muted}>Generated</span>
        </div>
        <div className={g.metric}>
          <span>Active users</span>
          <strong>{usageSnapshot.activeUsers}</strong>
          <span className={g.muted}>Peak {usageSnapshot.peakConcurrent}</span>
        </div>
      </div>

      <section className={g.panel}>
        <header className={g.row}>
          <h2>Monthly trends — AI requests</h2>
          <Badge variant="neutral">Chart (mock)</Badge>
        </header>
        <div className={styles.barChart} aria-label="AI request trend chart">
          {usageSeries.map((point) => (
            <div key={point.month} className={styles.barCol}>
              <div
                className={styles.bar}
                style={{ height: `${Math.max(8, Math.round((point.aiRequests / maxAi) * 100))}px` }}
                title={`${point.aiRequests.toLocaleString()} requests`}
              />
              <span className={styles.barLabel}>{point.month}</span>
            </div>
          ))}
        </div>
      </section>

      <div className={styles.split}>
        <div className={g.stack}>
          <section className={g.panel}>
            <h2>Usage timeline</h2>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>AI requests</th>
                    <th>API calls</th>
                    <th>Active users</th>
                  </tr>
                </thead>
                <tbody>
                  {usageSeries.map((point) => (
                    <tr key={point.month}>
                      <td>{point.month}</td>
                      <td>{point.aiRequests.toLocaleString()}</td>
                      <td>{point.apiCalls.toLocaleString()}</td>
                      <td>{point.activeUsers}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className={g.panel}>
            <h2>Plan meters</h2>
            <ul className={g.list}>
              {usageMeters.map((meter) => {
                const pct = Math.round((meter.used / Math.max(meter.limit, 1)) * 100)
                return (
                  <li key={meter.id} className={g.listItem}>
                    <span>
                      <strong>{meter.label}</strong>
                      <br />
                      <span className={g.muted}>
                        {meter.used.toLocaleString()} / {meter.limit.toLocaleString()} {meter.unit}
                      </span>
                    </span>
                    <Badge variant={pct >= meter.warnAtPct ? 'warning' : 'neutral'}>{pct}%</Badge>
                  </li>
                )
              })}
            </ul>
          </section>

          <section className={g.panel}>
            <h2>Department usage</h2>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Seats</th>
                    <th>AI</th>
                    <th>API</th>
                  </tr>
                </thead>
                <tbody>
                  {departmentUsage.map((row) => (
                    <tr key={row.id}>
                      <td>{row.department}</td>
                      <td>{row.seats}</td>
                      <td>{row.aiRequests.toLocaleString()}</td>
                      <td>{row.apiCalls.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <aside className={g.stack}>
          <section className={g.panel}>
            <h2>Top users</h2>
            <ul className={g.list}>
              {topUsers.map((user) => (
                <li key={user.id} className={g.listItem}>
                  <span>
                    <strong>{user.name}</strong>
                    <br />
                    <span className={g.muted}>{user.role}</span>
                  </span>
                  <Badge variant="accent">{user.actions} actions</Badge>
                </li>
              ))}
            </ul>
          </section>
          <section className={g.panel}>
            <h2>Feature adoption</h2>
            <ul className={g.list}>
              {featureAdoption.map((item) => (
                <li key={item.id} className={g.listItem}>
                  <span>
                    <strong>{item.feature}</strong>
                    <div className={styles.meterTrack} style={{ marginTop: 8 }} aria-hidden="true">
                      <div className={styles.meterFill} style={{ width: `${item.pct}%` }} />
                    </div>
                  </span>
                  <span>{item.pct}%</span>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </PageContainer>
  )
}
