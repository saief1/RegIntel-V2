import { useMemo } from 'react'
import { Orbit } from 'lucide-react'
import g from '../../components/governance/governance.module.css'
import { Badge } from '../../components/ui/Badge/Badge'
import { Button } from '../../components/ui/Button/Button'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { useEcosystem } from '../../hooks/useEcosystem'
import { EcosystemHubNav } from '../ecosystem/EcosystemHubNav'
import styles from '../ecosystem/ecosystem.module.css'

export function DigitalTwinPage() {
  const { twinDepartments, simulations, selectedSimulationId, selectSimulation, twinForecast, activity } = useEcosystem()
  const selected = simulations.find((item) => item.id === selectedSimulationId) ?? simulations[0]
  const maxForecast = Math.max(...twinForecast.flatMap((point) => [point.baseline, point.simulated]), 1)

  const orgTotals = useMemo(() => {
    const reviewers = twinDepartments.reduce((sum, item) => sum + item.reviewers, 0)
    const risks = twinDepartments.reduce((sum, item) => sum + item.openRisks, 0)
    const workload = twinDepartments.reduce((sum, item) => sum + item.workloadHours, 0)
    const maturity = Math.round(twinDepartments.reduce((sum, item) => sum + item.maturity, 0) / twinDepartments.length)
    return { reviewers, risks, workload, maturity }
  }, [twinDepartments])

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        title="Executive Digital Twin"
        description="A simulated real-time model of the compliance organization for capacity and risk forecasting."
        icon={<Orbit size={20} />}
      />

      <EcosystemHubNav current="/reports/digital-twin" />

      <div className={g.metricGrid} aria-label="Organization map pulse">
        <div className={g.metric}>
          <span>Compliance maturity</span>
          <strong>{orgTotals.maturity}</strong>
        </div>
        <div className={g.metric}>
          <span>Active risks</span>
          <strong>{orgTotals.risks}</strong>
        </div>
        <div className={g.metric}>
          <span>Reviewers</span>
          <strong>{orgTotals.reviewers}</strong>
        </div>
        <div className={g.metric}>
          <span>Workload (hrs/wk)</span>
          <strong>{orgTotals.workload}</strong>
        </div>
      </div>

      <section className={g.panel}>
        <h2>Organization map</h2>
        <div className={g.grid}>
          {twinDepartments.map((dept) => (
            <article key={dept.id} className={g.card} style={{ cursor: 'default' }}>
              <div className={g.meta}>
                <Badge variant={dept.maturity >= 80 ? 'success' : 'warning'}>Maturity {dept.maturity}</Badge>
                <Badge variant="neutral">{dept.reviewers} reviewers</Badge>
              </div>
              <h3>{dept.name}</h3>
              <p className={g.muted}>
                Workload {dept.workloadHours}h · Open risks {dept.openRisks}
              </p>
              <p className={g.muted}>Bottleneck: {dept.bottleneck}</p>
            </article>
          ))}
        </div>
      </section>

      <div className={styles.split}>
        <section className={g.panel}>
          <h2>Simulations</h2>
          <div className={styles.chipRow} role="group" aria-label="Simulation scenarios">
            {simulations.map((sim) => (
              <button
                key={sim.id}
                type="button"
                className={selected?.id === sim.id ? styles.chipActive : styles.chip}
                onClick={() => selectSimulation(sim.id)}
              >
                {sim.label}
              </button>
            ))}
          </div>
          {selected && (
            <>
              <p className={g.muted} style={{ marginTop: 12 }}>
                {selected.description}
              </p>
              <div className={g.metricGrid}>
                <div className={g.metric}>
                  <span>Cycle time</span>
                  <strong>{selected.impact.cycleTimeDeltaPct}%</strong>
                </div>
                <div className={g.metric}>
                  <span>Risk score</span>
                  <strong>{selected.impact.riskDelta > 0 ? '+' : ''}{selected.impact.riskDelta}</strong>
                </div>
                <div className={g.metric}>
                  <span>Capacity</span>
                  <strong>{selected.impact.capacityDeltaPct > 0 ? '+' : ''}{selected.impact.capacityDeltaPct}%</strong>
                </div>
                <div className={g.metric}>
                  <span>Coverage</span>
                  <strong>{selected.impact.coverageDeltaPct > 0 ? '+' : ''}{selected.impact.coverageDeltaPct}%</strong>
                </div>
              </div>
              <p className={g.muted}>{selected.impact.summary}</p>
            </>
          )}
        </section>

        <aside className={g.panel}>
          <h2>Workload forecast</h2>
          <div className={styles.bars} role="img" aria-label="Baseline vs simulated workload">
            {twinForecast.map((point) => (
              <div key={point.label} className={styles.barCol}>
                <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 100 }}>
                  <div className={styles.bar} style={{ height: `${(point.baseline / maxForecast) * 90}px` }} title="Baseline" />
                  <div className={styles.barSim} style={{ height: `${(point.simulated / maxForecast) * 90}px` }} title="Simulated" />
                </div>
                <span className={styles.barLabel}>{point.label}</span>
              </div>
            ))}
          </div>
          <p className={g.muted}>Gray = baseline · Purple = selected simulation</p>
          <h3>Live ecosystem signals</h3>
          <ul className={g.list}>
            <li className={g.listItem}><span>AI agents active</span><strong>10</strong></li>
            <li className={g.listItem}><span>Automations enabled</span><strong>2</strong></li>
            <li className={g.listItem}><span>Material regulations</span><strong>3</strong></li>
            <li className={g.listItem}><span>Connector health issues</span><strong>2</strong></li>
          </ul>
        </aside>
      </div>

      <section className={g.panel}>
        <header className={g.row}>
          <h2>Unified activity timeline</h2>
          <Button size="sm" variant="ghost" onClick={() => selectSimulation(simulations[0]?.id ?? null)}>
            Reset simulation
          </Button>
        </header>
        <ul className={g.list}>
          {activity.map((item) => (
            <li key={item.id} className={g.listItem}>
              <span>
                <Badge variant="neutral">{item.source}</Badge>{' '}
                <strong>{item.title}</strong>
                <br />
                <span className={g.muted}>{item.detail}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </PageContainer>
  )
}
