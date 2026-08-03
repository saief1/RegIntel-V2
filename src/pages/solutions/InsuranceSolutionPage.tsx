import { useEffect } from 'react'
import { Shield } from 'lucide-react'
import g from '../../components/governance/governance.module.css'
import { Badge } from '../../components/ui/Badge/Badge'
import { Button } from '../../components/ui/Button/Button'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { useSolutions } from '../../hooks/useSolutions'
import { formatRelativeTime } from '../../utils/date'
import { SolutionsHubNav } from './SolutionsHubNav'
import styles from './solutions.module.css'

export function InsuranceSolutionPage() {
  const { insurance, setActiveSolutionId, selectTemplate, selectedTemplateId } = useSolutions()
  const selected = insurance.aiReviews.find((item) => item.id === selectedTemplateId) ?? insurance.aiReviews[0]

  useEffect(() => {
    setActiveSolutionId('insurance')
  }, [setActiveSolutionId])

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        title="Insurance Pack"
        description="Licensing, market conduct, claims, product governance, distribution, complaints, and sales supervision."
        icon={<Shield size={20} />}
      />

      <SolutionsHubNav current="/solutions/insurance" />

      <div className={g.meta}>
        <span className={styles.industryBadge}>Insurance</span>
        {insurance.modules.map((module) => (
          <Badge key={module} variant="neutral">
            {module}
          </Badge>
        ))}
      </div>

      <div className={g.metricGrid}>
        {insurance.metrics.map((metric) => (
          <div key={metric.id} className={g.metric}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <span className={g.muted}>{metric.hint}</span>
          </div>
        ))}
      </div>

      <div className={styles.split}>
        <section className={g.panel}>
          <h2>Agent supervision dashboard</h2>
          <ul className={g.list}>
            {insurance.agentSupervision.map((row) => (
              <li key={row.agent} className={g.listItem}>
                <span>
                  <strong>{row.agent}</strong>
                  <br />
                  <span className={g.muted}>
                    Reviews due {row.reviewsDue} · Complaints {row.complaints}
                  </span>
                </span>
                <Badge variant={row.status === 'escalated' ? 'error' : row.status === 'attention' ? 'warning' : 'success'}>
                  {row.status}
                </Badge>
              </li>
            ))}
          </ul>
        </section>

        <aside className={g.stack}>
          <section className={g.panel}>
            <h2>Review calendar</h2>
            <ul className={g.list}>
              {insurance.calendar.map((item) => (
                <li key={item.date + item.title} className={g.listItem}>
                  <span>{item.title}</span>
                  <time dateTime={item.date}>{formatRelativeTime(`${item.date}T12:00:00.000Z`)}</time>
                </li>
              ))}
            </ul>
          </section>

          <section className={g.panel}>
            <h2>AI policy review</h2>
            <ul className={g.list}>
              {insurance.aiReviews.map((item) => (
                <li key={item.id} className={g.listItem}>
                  <button type="button" className={styles.hubLink} onClick={() => selectTemplate(item.id)}>
                    {item.title}
                  </button>
                </li>
              ))}
            </ul>
            {selected && (
              <>
                <p className={g.muted}>{selected.prompt}</p>
                <Button size="sm" variant="secondary" disabled>
                  Run review (mock)
                </Button>
              </>
            )}
          </section>
        </aside>
      </div>
    </PageContainer>
  )
}
