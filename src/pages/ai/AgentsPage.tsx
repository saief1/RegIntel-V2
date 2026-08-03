import { Bot } from 'lucide-react'
import { Link } from 'react-router-dom'
import g from '../../components/governance/governance.module.css'
import { Badge } from '../../components/ui/Badge/Badge'
import { Button } from '../../components/ui/Button/Button'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { useConnected } from '../../hooks/useConnected'
import { formatRelativeTime } from '../../utils/date'
import styles from '../connected/connected.module.css'
import { impactVariant } from '../connected/statusBadge'

export function AgentsPage() {
  const { agents, toggleAgent, runAgentScan } = useConnected()
  const active = agents.filter((a) => a.status === 'active').length
  const avgHealth = Math.round(agents.reduce((sum, a) => sum + a.healthScore, 0) / Math.max(agents.length, 1))
  const publications = agents.reduce((sum, a) => sum + a.newPublications, 0)

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        title="Continuous AI Monitoring"
        description="Regulator-specific agents that scan for publications, impact, and recommended actions."
        icon={<Bot size={20} />}
      />

      <nav className={styles.hubLinks} aria-label="Connected enterprise areas">
        <Link className={styles.hubLink} to="/ai">
          AI Workspace
        </Link>
        <Link className={styles.hubLink} to="/settings/integrations">
          Integrations
        </Link>
        <Link className={styles.hubLink} to="/regulatory-changes">
          Regulatory Changes
        </Link>
      </nav>

      <section className={g.panel} aria-label="Agent health dashboard">
        <h2>Agent health</h2>
        <div className={g.metricGrid}>
          <div className={g.metric}>
            <span>Active agents</span>
            <strong>
              {active}/{agents.length}
            </strong>
          </div>
          <div className={g.metric}>
            <span>Avg health score</span>
            <strong>{avgHealth}</strong>
          </div>
          <div className={g.metric}>
            <span>New publications</span>
            <strong>{publications}</strong>
          </div>
          <div className={g.metric}>
            <span>Critical impact</span>
            <strong>{agents.filter((a) => a.potentialImpact === 'critical').length}</strong>
          </div>
        </div>
      </section>

      <div className={g.grid}>
        {agents.map((agent) => (
          <article key={agent.id} className={g.card} style={{ cursor: 'default' }}>
            <div className={g.meta}>
              <Badge variant={agent.status === 'active' ? 'success' : agent.status === 'error' ? 'error' : 'neutral'}>
                {agent.status}
              </Badge>
              <Badge variant={impactVariant(agent.potentialImpact)}>{agent.potentialImpact} impact</Badge>
              {agent.status === 'active' && <span className={styles.syncDot} aria-label="Monitoring live" />}
            </div>
            <h3>
              {agent.regulator}{' '}
              <span className={g.muted} style={{ fontWeight: 400 }}>
                · {agent.region}
              </span>
            </h3>
            <div className={styles.detailGrid}>
              <div className={styles.field}>
                <label>Last scan</label>
                <p>{formatRelativeTime(agent.lastScanAt)}</p>
              </div>
              <div className={styles.field}>
                <label>New publications</label>
                <p>{agent.newPublications}</p>
              </div>
              <div className={styles.field}>
                <label>Confidence</label>
                <p>{agent.confidence}%</p>
              </div>
              <div className={styles.field}>
                <label>Health</label>
                <p>{agent.healthScore}</p>
              </div>
            </div>
            <div>
              <p className={g.muted} style={{ marginBottom: 6 }}>
                Recommended actions
              </p>
              <ul className={g.list}>
                {agent.recommendedActions.map((action) => (
                  <li key={action} className={g.listItem}>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className={g.muted} style={{ marginBottom: 6 }}>
                Generated tasks
              </p>
              <ul className={g.list}>
                {agent.generatedTaskTitles.map((title) => (
                  <li key={title} className={g.listItem}>
                    <span>{title}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className={g.toolbar}>
              <Button size="sm" variant="secondary" onClick={() => toggleAgent(agent.id)}>
                {agent.status === 'active' ? 'Pause' : 'Resume'}
              </Button>
              <Button size="sm" variant="primary" onClick={() => runAgentScan(agent.id)}>
                Run scan
              </Button>
            </div>
          </article>
        ))}
      </div>
    </PageContainer>
  )
}
