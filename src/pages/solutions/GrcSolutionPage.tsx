import { useEffect } from 'react'
import { Network } from 'lucide-react'
import g from '../../components/governance/governance.module.css'
import { Badge } from '../../components/ui/Badge/Badge'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { useSolutions } from '../../hooks/useSolutions'
import { formatRelativeTime } from '../../utils/date'
import { SolutionsHubNav } from './SolutionsHubNav'
import styles from './solutions.module.css'

export function GrcSolutionPage() {
  const { grc, setActiveSolutionId } = useSolutions()

  useEffect(() => {
    setActiveSolutionId('grc')
  }, [setActiveSolutionId])

  const matrixCells = Array.from({ length: 25 }, (_, index) => {
    const impact = 5 - Math.floor(index / 5)
    const likelihood = (index % 5) + 1
    const hit = grc.riskMatrix.find((risk) => risk.impact === impact && risk.likelihood === likelihood)
    return { impact, likelihood, hit }
  })

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        title="Enterprise GRC Pack"
        description="Enterprise risk, internal audit, policy, controls, SOX, operational risk, and business continuity."
        icon={<Network size={20} />}
      />

      <SolutionsHubNav current="/solutions/grc" />

      <div className={g.meta}>
        <span className={styles.industryBadge}>Corporate GRC</span>
        {grc.modules.map((module) => (
          <Badge key={module} variant="neutral">
            {module}
          </Badge>
        ))}
      </div>

      <div className={g.metricGrid}>
        {grc.metrics.map((metric) => (
          <div key={metric.id} className={g.metric}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <span className={g.muted}>{metric.hint}</span>
          </div>
        ))}
      </div>

      <div className={styles.split}>
        <section className={g.panel}>
          <h2>Risk matrix</h2>
          <div className={styles.matrix} role="img" aria-label="Risk matrix likelihood by impact">
            {matrixCells.map((cell) => (
              <div
                key={`${cell.likelihood}-${cell.impact}`}
                className={cell.hit ? `${styles.matrixCell} ${styles.matrixHit}` : styles.matrixCell}
                title={cell.hit?.label ?? `L${cell.likelihood}/I${cell.impact}`}
              >
                {cell.hit ? cell.hit.label : ''}
              </div>
            ))}
          </div>
          <p className={g.muted}>Highlighted cells show mapped top risks.</p>

          <h2>Control coverage</h2>
          <ul className={g.list}>
            {grc.controlCoverage.map((row) => (
              <li key={row.domain} className={g.listItem}>
                <span style={{ flex: 1 }}>
                  <strong>{row.domain}</strong>
                  <div className={styles.coverageBar} aria-hidden="true">
                    <div className={styles.coverageFill} style={{ width: `${row.pct}%` }} />
                  </div>
                </span>
                <Badge variant="neutral">{row.pct}%</Badge>
              </li>
            ))}
          </ul>
        </section>

        <aside className={g.stack}>
          <section className={g.panel}>
            <h2>Audit universe</h2>
            <ul className={g.list}>
              {grc.auditUniverse.map((item) => (
                <li key={item} className={g.listItem}>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
          <section className={g.panel}>
            <h2>Control testing</h2>
            <ul className={g.list}>
              {grc.controlTesting.map((item) => (
                <li key={item.control} className={g.listItem}>
                  <span>
                    <strong>{item.control}</strong>
                    <br />
                    <span className={g.muted}>{formatRelativeTime(`${item.lastTested}T12:00:00.000Z`)}</span>
                  </span>
                  <Badge
                    variant={item.result === 'Pass' ? 'success' : item.result === 'Fail' ? 'error' : 'warning'}
                  >
                    {item.result}
                  </Badge>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </PageContainer>
  )
}
