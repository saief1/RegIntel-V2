import { HeartHandshake } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ContextualHelpIcon } from '../../components/adoption/ContextualHelpIcon'
import g from '../../components/governance/governance.module.css'
import { Badge } from '../../components/ui/Badge/Badge'
import { Button } from '../../components/ui/Button/Button'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { useAdoption } from '../../hooks/useAdoption'
import { AdoptionHubNav } from './AdoptionHubNav'
import styles from './adoption.module.css'

export function CustomerSuccessPage() {
  const {
    successMetrics,
    checklist,
    toggleChecklistItem,
    recommendations,
    milestones,
    workspaceCompletionPct,
    nextSuggestions,
  } = useAdoption()

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        title="Customer Success Center"
        description="Adoption score, engagement, coverage, recommendations, and quarterly review coaching."
        icon={<HeartHandshake size={20} />}
        actions={<ContextualHelpIcon label="Customer success help" to="/help" />}
      />

      <AdoptionHubNav current="/customer-success" />

      <div className={g.metricGrid} aria-label="Customer success dashboard">
        {successMetrics.map((metric) => (
          <div key={metric.id} className={g.metric}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <span className={g.muted}>{metric.hint}</span>
          </div>
        ))}
      </div>

      <div className={styles.split}>
        <section className={g.panel}>
          <header className={g.row}>
            <h2>Success checklist</h2>
            <Badge variant="accent">{workspaceCompletionPct}% workspace</Badge>
          </header>
          <ul className={g.list}>
            {checklist.map((item) => (
              <li key={item.id} className={g.listItem}>
                <label style={{ display: 'inline-flex', gap: 8, alignItems: 'center', flex: 1 }}>
                  <input type="checkbox" checked={item.done} onChange={() => toggleChecklistItem(item.id)} />
                  {item.label}
                </label>
                {item.href && (
                  <Link className={styles.hubLink} to={item.href}>
                    Open
                  </Link>
                )}
              </li>
            ))}
          </ul>

          <h3>Suggested next steps</h3>
          <ul className={g.list}>
            {recommendations.map((item) => (
              <li key={item.id} className={g.listItem}>
                <span>
                  <strong>{item.title}</strong>
                  <br />
                  <span className={g.muted}>{item.detail}</span>
                </span>
                <Link className={styles.hubLink} to={item.href}>
                  Go
                </Link>
              </li>
            ))}
          </ul>

          <h3>AI — What should I do next?</h3>
          <ul className={g.list}>
            {nextSuggestions.map((item) => (
              <li key={item.id} className={g.listItem}>
                <span>
                  <strong>{item.title}</strong>
                  <br />
                  <span className={g.muted}>{item.detail}</span>
                </span>
                <Link className={styles.hubLink} to={item.href}>
                  Start
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <aside className={g.stack}>
          <section className={g.panel}>
            <h2>Success milestones</h2>
            <ul className={g.list}>
              {milestones.map((item) => (
                <li key={item.id} className={g.listItem}>
                  <span>
                    <strong>{item.title}</strong>
                    <br />
                    <span className={g.muted}>{item.detail}</span>
                  </span>
                  <Badge variant={item.achieved ? 'success' : 'neutral'}>
                    {item.achieved ? 'achieved' : 'pending'}
                  </Badge>
                </li>
              ))}
            </ul>
          </section>
          <section className={g.panel}>
            <h2>Quarterly review summary</h2>
            <p className={g.muted}>
              Mock Q2 review: adoption trending up after Wealth pack install. Focus next quarter on teammate invites,
              first automation, and KYC refresh campaign completion.
            </p>
            <Button size="sm" variant="secondary" disabled>
              Schedule QBR (mock)
            </Button>
          </section>
        </aside>
      </div>
    </PageContainer>
  )
}
