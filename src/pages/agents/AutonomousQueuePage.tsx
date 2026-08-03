import { useMemo, useState } from 'react'
import { ListChecks } from 'lucide-react'
import { Link } from 'react-router-dom'
import g from '../../components/governance/governance.module.css'
import { Badge } from '../../components/ui/Badge/Badge'
import { Button } from '../../components/ui/Button/Button'
import { EmptyState } from '../../components/ui/EmptyState/EmptyState'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { Select } from '../../components/ui/Select/Select'
import { useAutonomous } from '../../hooks/useAutonomous'
import { useWork } from '../../hooks/useWork'
import type { QueueItemState } from '../../types/autonomous'
import { formatRelativeTime } from '../../utils/date'
import { confidenceVariant, priorityVariant, queueStateVariant } from './agentBadges'
import styles from './autonomous.module.css'

export function AutonomousQueuePage() {
  const {
    queue,
    agents,
    selectedQueueIds,
    toggleQueueSelection,
    clearQueueSelection,
    approveQueueItems,
    rejectQueueItems,
  } = useAutonomous()
  const { getUser } = useWork()
  const [stateFilter, setStateFilter] = useState<'all' | QueueItemState>('all')
  const [selectedId, setSelectedId] = useState<string | null>(queue[0]?.id ?? null)

  const filtered = useMemo(
    () => queue.filter((item) => stateFilter === 'all' || item.state === stateFilter),
    [queue, stateFilter],
  )
  const selected = filtered.find((item) => item.id === selectedId) ?? filtered[0]

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        title="Autonomous Work Queue"
        description="Every AI recommendation lands here for supervision, approval, and execution tracking."
        icon={<ListChecks size={20} />}
      />

      <nav className={styles.hubLinks} aria-label="Autonomous platform areas">
        <Link className={styles.hubLink} to="/agents">
          AI Agents
        </Link>
        <Link className={styles.hubLink} to="/agents/builder">
          Agent Builder
        </Link>
        <Link className={styles.hubLink} to="/reports/command">
          Command Center
        </Link>
      </nav>

      <div className={g.toolbar}>
        <Select
          aria-label="Filter by state"
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value as 'all' | QueueItemState)}
        >
          <option value="all">All states</option>
          {(
            ['new', 'pending_approval', 'approved', 'running', 'waiting', 'completed', 'failed'] as const
          ).map((state) => (
            <option key={state} value={state}>
              {state.replace(/_/g, ' ')}
            </option>
          ))}
        </Select>
        <Button
          size="sm"
          variant="primary"
          disabled={selectedQueueIds.length === 0}
          onClick={() => approveQueueItems(selectedQueueIds)}
        >
          Bulk approve
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={selectedQueueIds.length === 0}
          onClick={() => rejectQueueItems(selectedQueueIds)}
        >
          Bulk reject
        </Button>
        <Button size="sm" variant="ghost" disabled={selectedQueueIds.length === 0} onClick={clearQueueSelection}>
          Clear selection
        </Button>
      </div>

      <div className={styles.split}>
        <section className={g.panel}>
          <h2>Queue</h2>
          {filtered.length === 0 ? (
            <EmptyState title="Queue empty" description="No autonomous recommendations match this filter." />
          ) : (
            <ul className={g.list}>
              {filtered.map((item) => {
                const agent = agents.find((candidate) => candidate.id === item.agentId)
                return (
                  <li key={item.id} className={g.listItem}>
                    <label className={styles.checkboxRow} style={{ flex: 1, alignItems: 'flex-start' }}>
                      <input
                        type="checkbox"
                        checked={selectedQueueIds.includes(item.id)}
                        onChange={() => toggleQueueSelection(item.id)}
                        aria-label={`Select ${item.title}`}
                      />
                      <button
                        type="button"
                        onClick={() => setSelectedId(item.id)}
                        style={{
                          all: 'unset',
                          cursor: 'pointer',
                          display: 'block',
                          width: '100%',
                        }}
                      >
                        <strong>{item.title}</strong>
                        <br />
                        <span className={g.muted}>
                          {agent?.name ?? item.agentId} · {getUser(item.ownerId)?.name ?? item.ownerId}
                        </span>
                      </button>
                    </label>
                    <div className={g.toolbar}>
                      <Badge variant={priorityVariant(item.priority)}>{item.priority}</Badge>
                      <Badge variant={queueStateVariant(item.state)}>{item.state.replace(/_/g, ' ')}</Badge>
                      <Badge variant={confidenceVariant(item.confidence)}>{item.confidence}%</Badge>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <aside className={g.panel} aria-label="Queue item detail">
          {selected ? (
            <>
              <header className={g.row}>
                <h2>{selected.title}</h2>
                <Badge variant={queueStateVariant(selected.state)}>{selected.state.replace(/_/g, ' ')}</Badge>
              </header>
              <div className={styles.detailGrid}>
                <div className={styles.field}>
                  <label>Priority</label>
                  <p>{selected.priority}</p>
                </div>
                <div className={styles.field}>
                  <label>Confidence</label>
                  <p>{selected.confidence}%</p>
                </div>
                <div className={styles.field}>
                  <label>Estimated time</label>
                  <p>{selected.estimatedMinutes} min</p>
                </div>
                <div className={styles.field}>
                  <label>Estimated cost</label>
                  <p>${selected.estimatedCostUsd.toFixed(2)}</p>
                </div>
                <div className={styles.field}>
                  <label>Owner</label>
                  <p>{getUser(selected.ownerId)?.name ?? selected.ownerId}</p>
                </div>
                <div className={styles.field}>
                  <label>Agent</label>
                  <p>{agents.find((a) => a.id === selected.agentId)?.name ?? selected.agentId}</p>
                </div>
                <div className={styles.field}>
                  <label>Linked regulation</label>
                  <p>{selected.linkedRegulation ?? '—'}</p>
                </div>
                <div className={styles.field}>
                  <label>Linked policy</label>
                  <p>{selected.linkedPolicy ?? '—'}</p>
                </div>
              </div>
              <h3>Suggested actions</h3>
              <ul className={g.list}>
                {selected.suggestedActions.map((action) => (
                  <li key={action} className={g.listItem}>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
              <h3>AI reasoning</h3>
              <p className={g.muted}>{selected.reasoningSummary}</p>
              {selected.approvalRequired && (
                <p className={g.muted}>Human approval checkpoint required before execution.</p>
              )}
              <div className={g.toolbar}>
                <Button size="sm" variant="primary" onClick={() => approveQueueItems([selected.id])}>
                  Approve
                </Button>
                <Button size="sm" variant="secondary" onClick={() => rejectQueueItems([selected.id])}>
                  Reject
                </Button>
              </div>
              <p className={g.muted}>Updated {formatRelativeTime(selected.updatedAt)}</p>
            </>
          ) : (
            <EmptyState title="Select an item" description="Choose a queue recommendation to inspect details." />
          )}
        </aside>
      </div>
    </PageContainer>
  )
}
