import { useState } from 'react'
import { Gauge } from 'lucide-react'
import g from '../../components/governance/governance.module.css'
import { Badge } from '../../components/ui/Badge/Badge'
import { Button } from '../../components/ui/Button/Button'
import { Input } from '../../components/ui/Input/Input'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { Textarea } from '../../components/ui/Textarea/Textarea'
import { useAnalytics } from '../../hooks/useAnalytics'
import styles from './analytics.module.css'
import { ReportsHubNav } from './ReportsHubNav'

export function KpiBuilderPage() {
  const { kpis, createKpi, toggleKpiAlert, kpiCatalogMetrics, queueExport } = useAnalytics()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [formula, setFormula] = useState('')
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([kpiCatalogMetrics[0]])
  const [thresholdWarn, setThresholdWarn] = useState(80)
  const [thresholdCritical, setThresholdCritical] = useState(70)
  const [goal, setGoal] = useState(90)
  const [unit, setUnit] = useState('%')
  const [schedule, setSchedule] = useState('Weekly Monday 08:00')
  const [message, setMessage] = useState('')

  function toggleMetric(metric: string) {
    setSelectedMetrics((current) =>
      current.includes(metric) ? current.filter((item) => item !== metric) : [...current, metric],
    )
  }

  function onCreate() {
    const created = createKpi({
      name,
      description,
      formula: formula || `COMPOSE(${selectedMetrics.join(' + ')})`,
      metrics: selectedMetrics,
      thresholdWarn,
      thresholdCritical,
      goal,
      unit,
      alertEnabled: true,
      schedule,
      currentValue: Math.max(0, goal - 2),
    })
    setMessage(`Created KPI “${created.name}”.`)
    setName('')
    setDescription('')
    setFormula('')
  }

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        title="KPI Builder"
        description="Compose custom compliance KPIs with thresholds, alerts, goals, and scheduled reporting."
        icon={<Gauge size={20} />}
      />

      <ReportsHubNav current="/reports/kpis" />

      <div className={styles.split}>
        <section className={g.panel}>
          <h2>Build KPI</h2>
          <div className={styles.formGrid}>
            <label>
              Name
              <Input aria-label="KPI name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Open High-Risk Findings" />
            </label>
            <label>
              Unit
              <Input aria-label="Unit" value={unit} onChange={(e) => setUnit(e.target.value)} />
            </label>
            <label style={{ gridColumn: '1 / -1' }}>
              Description
              <Textarea aria-label="Description" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
            </label>
            <label style={{ gridColumn: '1 / -1' }}>
              Formula builder
              <Textarea
                aria-label="Formula"
                rows={2}
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                placeholder="COUNT(findings WHERE severity = high)"
              />
            </label>
            <label>
              Warn threshold
              <Input
                type="number"
                aria-label="Warn threshold"
                value={thresholdWarn}
                onChange={(e) => setThresholdWarn(Number(e.target.value))}
              />
            </label>
            <label>
              Critical threshold
              <Input
                type="number"
                aria-label="Critical threshold"
                value={thresholdCritical}
                onChange={(e) => setThresholdCritical(Number(e.target.value))}
              />
            </label>
            <label>
              Goal
              <Input type="number" aria-label="Goal" value={goal} onChange={(e) => setGoal(Number(e.target.value))} />
            </label>
            <label>
              Scheduled report
              <Input aria-label="Schedule" value={schedule} onChange={(e) => setSchedule(e.target.value)} />
            </label>
          </div>

          <h3>Drag-and-drop metrics</h3>
          <p className={g.muted}>Select metrics to include in the KPI composition.</p>
          <div className={styles.chipRow} role="group" aria-label="Metric catalog">
            {kpiCatalogMetrics.map((metric) => (
              <button
                key={metric}
                type="button"
                className={selectedMetrics.includes(metric) ? styles.chipActive : styles.chip}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('text/plain', metric)}
                onClick={() => toggleMetric(metric)}
              >
                {metric}
              </button>
            ))}
          </div>
          <div
            className={g.panel}
            style={{ marginTop: 12 }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              const metric = e.dataTransfer.getData('text/plain')
              if (metric) toggleMetric(metric)
            }}
            aria-label="KPI composition drop zone"
          >
            <h3>Composition</h3>
            {selectedMetrics.length === 0 ? (
              <p className={g.muted}>Drop or select metrics here.</p>
            ) : (
              <div className={styles.chipRow}>
                {selectedMetrics.map((metric) => (
                  <span key={metric} className={styles.chipActive}>
                    {metric}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className={g.toolbar}>
            <Button variant="primary" disabled={!name.trim() || selectedMetrics.length === 0} onClick={onCreate}>
              Create KPI
            </Button>
            {message && <span className={g.muted}>{message}</span>}
          </div>
        </section>

        <aside className={g.panel}>
          <header className={g.row}>
            <h2>Active KPIs</h2>
            <Button size="sm" variant="secondary" onClick={() => queueExport('KPI catalog', 'xlsx')}>
              Export Excel
            </Button>
          </header>
          <ul className={g.list}>
            {kpis.map((kpi) => {
              const max = Math.max(...kpi.trend.map((point) => point.value), 1)
              const status =
                kpi.unit === '%' || kpi.name.toLowerCase().includes('rate') || kpi.name.toLowerCase().includes('coverage')
                  ? kpi.currentValue <= kpi.thresholdCritical
                    ? 'critical'
                    : kpi.currentValue <= kpi.thresholdWarn
                      ? 'warning'
                      : 'ok'
                  : kpi.currentValue >= kpi.thresholdCritical
                    ? 'critical'
                    : kpi.currentValue >= kpi.thresholdWarn
                      ? 'warning'
                      : 'ok'
              return (
                <li key={kpi.id} className={g.listItem} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                  <div className={g.row}>
                    <span>
                      <strong>{kpi.name}</strong>
                      <br />
                      <span className={g.muted}>{kpi.description}</span>
                    </span>
                    <Badge variant={status === 'ok' ? 'success' : status === 'warning' ? 'warning' : 'error'}>
                      {kpi.currentValue}
                      {kpi.unit === '%' ? '%' : ` ${kpi.unit}`}
                    </Badge>
                  </div>
                  <p className={g.muted}>Formula: {kpi.formula}</p>
                  <p className={g.muted}>
                    Goal {kpi.goal}
                    {kpi.unit === '%' ? '%' : ''} · Warn {kpi.thresholdWarn} · Critical {kpi.thresholdCritical} ·{' '}
                    {kpi.schedule}
                  </p>
                  <div className={styles.bars} aria-label={`${kpi.name} trend`}>
                    {kpi.trend.map((point) => (
                      <div key={point.label} className={styles.barCol}>
                        <div className={styles.bar} style={{ height: `${Math.round((point.value / max) * 80)}px` }} />
                        <span className={styles.barLabel}>{point.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className={g.toolbar}>
                    <Button size="sm" variant="secondary" onClick={() => toggleKpiAlert(kpi.id)}>
                      {kpi.alertEnabled ? 'Disable alert' : 'Enable alert'}
                    </Button>
                    <Badge variant={kpi.alertEnabled ? 'accent' : 'neutral'}>
                      {kpi.alertEnabled ? 'Alert on' : 'Alert off'}
                    </Badge>
                  </div>
                </li>
              )
            })}
          </ul>
        </aside>
      </div>
    </PageContainer>
  )
}
