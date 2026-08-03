import { useState } from 'react'
import { Bot } from 'lucide-react'
import { Link } from 'react-router-dom'
import g from '../../components/governance/governance.module.css'
import { Badge } from '../../components/ui/Badge/Badge'
import { Button } from '../../components/ui/Button/Button'
import { EmptyState } from '../../components/ui/EmptyState/EmptyState'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { useAutonomous } from '../../hooks/useAutonomous'
import { formatRelativeTime } from '../../utils/date'
import { agentStatusVariant, confidenceVariant, healthVariant } from './agentBadges'
import styles from './autonomous.module.css'

export function AgentWorkspacePage() {
  const { agents, selectedAgentId, selectAgent, pauseAgent, resumeAgent, runAgentNow, activityTimeline } =
    useAutonomous()
  const selected = agents.find((agent) => agent.id === selectedAgentId) ?? agents[0]
  const [historyOpen, setHistoryOpen] = useState(true)

  const activeCount = agents.filter((a) => a.status === 'active' || a.status === 'running').length

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        title="AI Agents"
        description="Autonomous compliance workforce — monitor, analyze, assign, and track work with human approval checkpoints."
        icon={<Bot size={20} />}
      />

      <nav className={styles.hubLinks} aria-label="Autonomous platform areas">
        <Link className={styles.hubLink} to="/agents/builder">
          Agent Builder
        </Link>
        <Link className={styles.hubLink} to="/agents/queue">
          Work Queue
        </Link>
        <Link className={styles.hubLink} to="/knowledge/graph">
          Knowledge Graph
        </Link>
        <Link className={styles.hubLink} to="/reports/command">
          Command Center
        </Link>
        <Link className={styles.hubLink} to="/ai/agents">
          Continuous Monitoring
        </Link>
      </nav>

      <div className={g.metricGrid}>
        <div className={g.metric}>
          <span>Active workforce</span>
          <strong>
            {activeCount}/{agents.length}
          </strong>
        </div>
        <div className={g.metric}>
          <span>Queue depth</span>
          <strong>{agents.reduce((sum, a) => sum + a.queueDepth, 0)}</strong>
        </div>
        <div className={g.metric}>
          <span>Tasks completed</span>
          <strong>{agents.reduce((sum, a) => sum + a.tasksCompleted, 0)}</strong>
        </div>
      </div>

      <div className={styles.split}>
        <section aria-label="Workforce agents">
          {agents.length === 0 ? (
            <EmptyState title="No agents" description="Publish an agent from the Agent Builder to get started." />
          ) : (
            <div className={g.grid}>
              {agents.map((agent) => (
                <button
                  key={agent.id}
                  type="button"
                  className={g.card}
                  aria-pressed={selected?.id === agent.id}
                  onClick={() => selectAgent(agent.id)}
                >
                  <div className={g.meta}>
                    <Badge variant={agentStatusVariant(agent.status)}>{agent.status}</Badge>
                    <Badge variant={healthVariant(agent.health)}>{agent.health}</Badge>
                    <Badge variant={confidenceVariant(agent.confidence)}>{agent.confidence}% confidence</Badge>
                  </div>
                  <h3>{agent.name}</h3>
                  <p className={g.muted}>{agent.description}</p>
                  <p className={g.muted}>
                    Last run {agent.lastRunAt ? formatRelativeTime(agent.lastRunAt) : '—'} · Queue {agent.queueDepth}
                  </p>
                  {agent.currentJob && <p className={g.muted}>Current: {agent.currentJob}</p>}
                </button>
              ))}
            </div>
          )}
        </section>

        <aside className={g.stack}>
          {selected && (
            <section className={g.panel} aria-label={`${selected.name} details`}>
              <header className={g.row}>
                <div>
                  <h2>{selected.name}</h2>
                  <p className={g.muted}>{selected.role}</p>
                </div>
                <Badge variant={agentStatusVariant(selected.status)}>{selected.status}</Badge>
              </header>

              <div className={styles.detailGrid}>
                <div className={styles.field}>
                  <label>Health</label>
                  <p>{selected.health}</p>
                </div>
                <div className={styles.field}>
                  <label>Confidence</label>
                  <p>{selected.confidence}%</p>
                </div>
                <div className={styles.field}>
                  <label>Last run</label>
                  <p>{selected.lastRunAt ? formatRelativeTime(selected.lastRunAt) : '—'}</p>
                </div>
                <div className={styles.field}>
                  <label>Tasks completed</label>
                  <p>{selected.tasksCompleted}</p>
                </div>
                <div className={styles.field}>
                  <label>Queue</label>
                  <p>{selected.queueDepth}</p>
                </div>
                <div className={styles.field}>
                  <label>Current job</label>
                  <p>{selected.currentJob ?? 'Idle'}</p>
                </div>
                <div className={styles.field}>
                  <label>Next scheduled run</label>
                  <p>{selected.nextRunAt ? formatRelativeTime(selected.nextRunAt) : 'Not scheduled'}</p>
                </div>
                <div className={styles.field}>
                  <label>Cost / time estimate</label>
                  <p>
                    ${selected.estimatedCostUsd.toFixed(2)} · {selected.estimatedMinutes} min
                  </p>
                </div>
              </div>

              <div className={g.toolbar}>
                {selected.status === 'paused' ? (
                  <Button size="sm" variant="secondary" onClick={() => resumeAgent(selected.id)}>
                    Resume
                  </Button>
                ) : (
                  <Button size="sm" variant="secondary" onClick={() => pauseAgent(selected.id)}>
                    Pause
                  </Button>
                )}
                <Button size="sm" variant="primary" onClick={() => runAgentNow(selected.id)}>
                  Run Now
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setHistoryOpen((value) => !value)}>
                  {historyOpen ? 'Hide History' : 'View History'}
                </Button>
              </div>

              <h3>Explainability</h3>
              <p className={g.muted}>{selected.reasoningSummary}</p>

              {historyOpen && (
                <>
                  <h3>Execution history</h3>
                  <ul className={g.list}>
                    {selected.history.map((entry) => (
                      <li key={entry.id} className={g.listItem}>
                        <span>
                          <strong>{entry.result}</strong> · {entry.summary}
                          <br />
                          <span className={g.muted}>
                            {entry.durationMinutes} min · {entry.confidence}% confidence
                          </span>
                        </span>
                        <time dateTime={entry.at}>{formatRelativeTime(entry.at)}</time>
                      </li>
                    ))}
                  </ul>

                  <h3>Agent logs</h3>
                  <ul className={g.list}>
                    {selected.logs.map((entry) => (
                      <li key={entry.id} className={g.listItem}>
                        <span>
                          <Badge variant={entry.level === 'error' ? 'error' : entry.level === 'warning' ? 'warning' : 'neutral'}>
                            {entry.level}
                          </Badge>{' '}
                          {entry.message}
                        </span>
                        <time dateTime={entry.at}>{formatRelativeTime(entry.at)}</time>
                      </li>
                    ))}
                  </ul>

                  <h3>Retry history</h3>
                  {selected.retries.length === 0 ? (
                    <p className={g.muted}>No retries recorded.</p>
                  ) : (
                    <ul className={g.list}>
                      {selected.retries.map((entry) => (
                        <li key={entry.id} className={g.listItem}>
                          <span>
                            Attempt {entry.attempt} · {entry.reason}
                            <br />
                            <span className={g.muted}>{entry.outcome}</span>
                          </span>
                          <time dateTime={entry.at}>{formatRelativeTime(entry.at)}</time>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </section>
          )}

          <section className={g.panel}>
            <h2>Agent activity timeline</h2>
            <ul className={g.list}>
              {activityTimeline.slice(0, 8).map((item) => (
                <li key={item.id} className={g.listItem}>
                  <span>
                    <strong>{item.title}</strong>
                    <br />
                    <span className={g.muted}>
                      {item.agentName} · {item.detail}
                    </span>
                  </span>
                  <time dateTime={item.at}>{formatRelativeTime(item.at)}</time>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </PageContainer>
  )
}
