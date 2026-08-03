import { useEffect } from 'react'
import { Building2 } from 'lucide-react'
import g from '../../components/governance/governance.module.css'
import { Badge } from '../../components/ui/Badge/Badge'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { useSolutions } from '../../hooks/useSolutions'
import { SolutionsHubNav } from './SolutionsHubNav'
import styles from './solutions.module.css'

function heatClass(residual: string) {
  if (residual === 'low') return styles.heatLow
  if (residual === 'high') return styles.heatHigh
  return styles.heatMedium
}

export function BankingSolutionPage() {
  const { banking, setActiveSolutionId } = useSolutions()

  useEffect(() => {
    setActiveSolutionId('banking')
  }, [setActiveSolutionId])

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        title="Banking Pack"
        description="AML, sanctions, consumer protection, privacy, operational and third-party risk, reporting, and controls."
        icon={<Building2 size={20} />}
      />

      <SolutionsHubNav current="/solutions/banking" />

      <div className={g.meta}>
        <span className={styles.industryBadge}>Banking</span>
        {banking.modules.map((module) => (
          <Badge key={module} variant="neutral">
            {module}
          </Badge>
        ))}
      </div>

      <div className={g.metricGrid}>
        {banking.metrics.map((metric) => (
          <div key={metric.id} className={g.metric}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <span className={g.muted}>{metric.hint}</span>
          </div>
        ))}
      </div>

      <section className={g.panel}>
        <h2>Dashboards</h2>
        <div className={g.grid}>
          {banking.dashboards.map((panel) => (
            <article key={panel.id} className={g.card} style={{ cursor: 'default' }}>
              <h3>{panel.title}</h3>
              <p className={g.muted}>{panel.summary}</p>
              <ul className={g.list}>
                {panel.items.map((item) => (
                  <li key={item} className={g.listItem}>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className={g.panel}>
        <h2>Risk heatmap</h2>
        <div className={styles.heatGrid}>
          {banking.heatmap.map((cell) => (
            <div key={cell.area} className={`${styles.heatCell} ${heatClass(cell.residual)}`}>
              <strong>{cell.area}</strong>
              <br />
              Score {cell.score}
              <br />
              <Badge variant={cell.residual === 'high' ? 'error' : cell.residual === 'low' ? 'success' : 'warning'}>
                {cell.residual}
              </Badge>
            </div>
          ))}
        </div>
      </section>
    </PageContainer>
  )
}
