import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  Briefcase,
  CheckCircle2,
  Clock3,
  ListTodo,
  Plus,
  ShieldAlert,
} from 'lucide-react'
import { ActivityFeed } from '../../components/work/ActivityFeed/ActivityFeed'
import { CaseCard } from '../../components/work/CaseCard/CaseCard'
import { DecisionCard } from '../../components/work/DecisionCard/DecisionCard'
import { MetricCard } from '../../components/work/MetricCard/MetricCard'
import { Button } from '../../components/ui/Button/Button'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { SearchField } from '../../components/ui/SearchField/SearchField'
import { Select } from '../../components/ui/Select/Select'
import { SectionHeader } from '../../components/ui/SectionHeader/SectionHeader'
import { useWork } from '../../hooks/useWork'
import type { CaseStatus, Priority, RiskLevel } from '../../types/work'
import styles from './WorkDashboardPage.module.css'

type DashboardFilter = 'all' | 'open_reviews' | 'assigned' | 'due_today' | 'completed' | 'high_risk'

function isDueToday(isoDate: string): boolean {
  const today = new Date().toISOString().slice(0, 10)
  return isoDate.slice(0, 10) === today
}

export function WorkDashboardPage() {
  const navigate = useNavigate()
  const { cases, decisions, getUser, currentUserId } = useWork()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<CaseStatus | 'all'>('all')
  const [priority, setPriority] = useState<Priority | 'all'>('all')
  const [ownerId, setOwnerId] = useState<string | 'all'>('all')
  const [sort, setSort] = useState<'updated' | 'due' | 'risk'>('updated')
  const [metricFilter, setMetricFilter] = useState<DashboardFilter>('all')

  const metrics = useMemo(() => {
    const openReviews = cases.filter((item) => item.status === 'in_review' || item.status === 'open').length
    const assigned = cases.filter((item) => item.assigneeIds.includes(currentUserId)).length
    const dueToday = cases.filter((item) => isDueToday(item.dueDate) && item.status !== 'closed' && item.status !== 'completed').length
    const completed = cases.filter((item) => item.status === 'completed' || item.status === 'closed').length
    const highRisk = cases.filter((item) => item.risk === 'high' || item.risk === 'critical').length
    return { openReviews, assigned, dueToday, completed, highRisk }
  }, [cases, currentUserId])

  const filteredCases = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    let result = cases.filter((item) => {
      if (normalized && !`${item.title} ${item.caseNumber} ${item.summary}`.toLowerCase().includes(normalized)) return false
      if (status !== 'all' && item.status !== status) return false
      if (priority !== 'all' && item.priority !== priority) return false
      if (ownerId !== 'all' && item.ownerId !== ownerId) return false
      if (metricFilter === 'open_reviews' && !(item.status === 'open' || item.status === 'in_review')) return false
      if (metricFilter === 'assigned' && !item.assigneeIds.includes(currentUserId)) return false
      if (metricFilter === 'due_today' && !isDueToday(item.dueDate)) return false
      if (metricFilter === 'completed' && !(item.status === 'completed' || item.status === 'closed')) return false
      if (metricFilter === 'high_risk' && !(item.risk === 'high' || item.risk === 'critical')) return false
      return true
    })

    const riskRank: Record<RiskLevel, number> = { critical: 4, high: 3, medium: 2, low: 1 }
    result = [...result].sort((a, b) => {
      if (sort === 'due') return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      if (sort === 'risk') return riskRank[b.risk] - riskRank[a.risk]
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })
    return result
  }, [cases, query, status, priority, ownerId, sort, metricFilter, currentUserId])

  const recentDecisions = useMemo(
    () => [...decisions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3),
    [decisions],
  )

  const owners = useMemo(() => {
    const ids = [...new Set(cases.map((item) => item.ownerId))]
    return ids.map((id) => getUser(id)).filter((user): user is NonNullable<typeof user> => Boolean(user))
  }, [cases, getUser])

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        title="Work"
        description="Compliance workspace for reviews, cases, evidence, and decisions."
        icon={<Briefcase size={20} />}
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate('/work/cases')}>
              All cases
            </Button>
            <Button variant="primary" leadingIcon={<Plus size={14} />} onClick={() => navigate('/work/cases')}>
              Open case queue
            </Button>
          </>
        }
      />

      <section className={styles.metrics} aria-label="Work metrics">
        <MetricCard
          label="Open reviews"
          value={metrics.openReviews}
          icon={<ListTodo size={16} />}
          tone="accent"
          active={metricFilter === 'open_reviews'}
          onClick={() => setMetricFilter(metricFilter === 'open_reviews' ? 'all' : 'open_reviews')}
        />
        <MetricCard
          label="Assigned to you"
          value={metrics.assigned}
          icon={<Briefcase size={16} />}
          active={metricFilter === 'assigned'}
          onClick={() => setMetricFilter(metricFilter === 'assigned' ? 'all' : 'assigned')}
        />
        <MetricCard
          label="Due today"
          value={metrics.dueToday}
          icon={<Clock3 size={16} />}
          tone="warning"
          active={metricFilter === 'due_today'}
          onClick={() => setMetricFilter(metricFilter === 'due_today' ? 'all' : 'due_today')}
        />
        <MetricCard
          label="Completed"
          value={metrics.completed}
          icon={<CheckCircle2 size={16} />}
          tone="success"
          active={metricFilter === 'completed'}
          onClick={() => setMetricFilter(metricFilter === 'completed' ? 'all' : 'completed')}
        />
        <MetricCard
          label="High risk"
          value={metrics.highRisk}
          icon={<ShieldAlert size={16} />}
          tone="danger"
          active={metricFilter === 'high_risk'}
          onClick={() => setMetricFilter(metricFilter === 'high_risk' ? 'all' : 'high_risk')}
        />
      </section>

      <section className={styles.filters} aria-label="Filters">
        <SearchField
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search cases..."
          aria-label="Search cases"
        />
        <Select value={status} onChange={(e) => setStatus(e.target.value as CaseStatus | 'all')} aria-label="Status">
          <option value="all">All statuses</option>
          <option value="open">Open</option>
          <option value="in_review">In review</option>
          <option value="escalated">Escalated</option>
          <option value="completed">Completed</option>
          <option value="closed">Closed</option>
        </Select>
        <Select value={priority} onChange={(e) => setPriority(e.target.value as Priority | 'all')} aria-label="Priority">
          <option value="all">All priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </Select>
        <Select value={ownerId} onChange={(e) => setOwnerId(e.target.value)} aria-label="Owner">
          <option value="all">All owners</option>
          {owners.map((owner) => (
            <option key={owner.id} value={owner.id}>
              {owner.name}
            </option>
          ))}
        </Select>
        <Select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} aria-label="Sort">
          <option value="updated">Recently updated</option>
          <option value="due">Due date</option>
          <option value="risk">Risk</option>
        </Select>
      </section>

      <div className={styles.layout}>
        <section className={styles.mainColumn} aria-label="Cases">
          <SectionHeader title="Cases" description={`${filteredCases.length} matching`} as="h2" />
          {filteredCases.length === 0 ? (
            <p className={styles.empty}>No cases match your filters.</p>
          ) : (
            <div className={styles.caseGrid}>
              {filteredCases.map((workCase) => (
                <CaseCard
                  key={workCase.id}
                  workCase={workCase}
                  owner={getUser(workCase.ownerId)}
                  assignees={workCase.assigneeIds.map((id) => getUser(id)).filter((user): user is NonNullable<typeof user> => Boolean(user))}
                />
              ))}
            </div>
          )}
        </section>

        <aside className={styles.sideColumn}>
          <section className={styles.sidePanel}>
            <SectionHeader title="Quick actions" />
            <div className={styles.quickActions}>
              <Button variant="secondary" onClick={() => navigate('/work/cases')}>
                Browse case queue
              </Button>
              <Button variant="secondary" onClick={() => setMetricFilter('due_today')}>
                Focus due today
              </Button>
              <Button variant="secondary" onClick={() => setMetricFilter('high_risk')}>
                Review high risk
              </Button>
            </div>
          </section>

          <section className={styles.sidePanel}>
            <SectionHeader title="Recent decisions" />
            <div className={styles.decisionStack}>
              {recentDecisions.map((decision, index) => (
                <DecisionCard
                  key={decision.id}
                  decision={decision}
                  reviewer={getUser(decision.reviewerId)}
                  isLatest={index === 0}
                />
              ))}
            </div>
          </section>

          <section className={styles.sidePanel}>
            <SectionHeader
              title="Recent activity"
              as="h2"
              size="lg"
              actions={
                <span className={styles.activityHint}>
                  <AlertTriangle size={12} aria-hidden="true" /> Live feed
                </span>
              }
            />
            <ActivityFeed limit={6} />
          </section>
        </aside>
      </div>
    </PageContainer>
  )
}
