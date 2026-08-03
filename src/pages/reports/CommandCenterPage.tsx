import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import g from '../../components/governance/governance.module.css'
import { Badge } from '../../components/ui/Badge/Badge'
import { Button } from '../../components/ui/Button/Button'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { useAutonomous } from '../../hooks/useAutonomous'
import { formatRelativeTime } from '../../utils/date'
import styles from '../agents/autonomous.module.css'

function toneClass(tone: 'neutral' | 'positive' | 'warning' | 'critical') {
  if (tone === 'positive') return styles.tonePositive
  if (tone === 'warning') return styles.toneWarning
  if (tone === 'critical') return styles.toneCritical
  return undefined
}

export function CommandCenterPage() {
  const { executiveCards, briefs, regenerateBrief, activityTimeline, agents, queue } = useAutonomous()
  const pendingApprovals = queue.filter((item) => item.state === 'pending_approval' || item.state === 'new').length
  const runningAgents = agents.filter((agent) => agent.status === 'running').length

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        title="Executive AI Command Center"
        description="Organization risk, compliance health, agent activity, and AI-generated executive briefs."
        icon={<Sparkles size={20} />}
      />

      <nav className={styles.hubLinks} aria-label="Autonomous platform areas">
        <Link className={styles.hubLink} to="/reports">
          Executive Dashboard
        </Link>
        <Link className={styles.hubLink} to="/reports/analytics">
          Analytics Center
        </Link>
        <Link className={styles.hubLink} to="/reports/board">
          Board Studio
        </Link>
        <Link className={styles.hubLink} to="/agents">
          AI Agents
        </Link>
        <Link className={styles.hubLink} to="/agents/queue">
          Work Queue
        </Link>
        <Link className={styles.hubLink} to="/knowledge/graph">
          Knowledge Graph
        </Link>
      </nav>

      <div className={g.metricGrid} aria-label="Live operating pulse">
        <div className={g.metric}>
          <span>Agents running</span>
          <strong>{runningAgents}</strong>
        </div>
        <div className={g.metric}>
          <span>Pending approvals</span>
          <strong>{pendingApprovals}</strong>
        </div>
        <div className={g.metric}>
          <span>Queue items</span>
          <strong>{queue.length}</strong>
        </div>
      </div>

      <section aria-label="Executive metric cards">
        <div className={g.grid}>
          {executiveCards.map((card) => (
            <article key={card.id} className={g.card} style={{ cursor: 'default' }}>
              <div className={g.meta}>
                <Badge variant={card.tone === 'critical' ? 'error' : card.tone === 'warning' ? 'warning' : card.tone === 'positive' ? 'success' : 'neutral'}>
                  {card.trend}
                </Badge>
              </div>
              <h3>{card.title}</h3>
              <p className={toneClass(card.tone)} style={{ fontSize: 'var(--ri-font-size-heading-m)', margin: 0, fontWeight: 600 }}>
                {card.value}
              </p>
              <p className={g.muted}>{card.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={g.panel}>
        <header className={g.row}>
          <h2>AI-generated briefs</h2>
        </header>
        <div className={g.grid}>
          {briefs.map((brief) => (
            <article key={brief.id} className={g.card} style={{ cursor: 'default' }}>
              <div className={g.meta}>
                <Badge variant="accent">{brief.kind}</Badge>
                <span className={g.muted}>Generated {formatRelativeTime(brief.generatedAt)}</span>
              </div>
              <h3>{brief.title}</h3>
              <p className={g.muted}>{brief.summary}</p>
              <ul className={g.list}>
                {brief.bullets.map((bullet) => (
                  <li key={bullet} className={g.listItem}>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
              <Button size="sm" variant="secondary" onClick={() => regenerateBrief(brief.kind)}>
                Regenerate
              </Button>
            </article>
          ))}
        </div>
      </section>

      <section className={g.panel}>
        <header className={g.row}>
          <h2>Agent activity timeline</h2>
          <Link className={styles.hubLink} to="/agents">
            Open agents
          </Link>
        </header>
        <ul className={g.list}>
          {activityTimeline.map((item) => (
            <li key={item.id} className={g.listItem}>
              <span>
                <strong>{item.title}</strong>
                <br />
                <span className={g.muted}>
                  {item.agentName} · {item.detail}
                </span>
              </span>
              <div className={g.toolbar}>
                {item.href && (
                  <Link className={styles.hubLink} to={item.href}>
                    View
                  </Link>
                )}
                <time dateTime={item.at}>{formatRelativeTime(item.at)}</time>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </PageContainer>
  )
}
