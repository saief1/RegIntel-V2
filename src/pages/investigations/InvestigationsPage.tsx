import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ShieldAlert } from 'lucide-react'
import { DashboardWidget } from '../../components/investigations/DashboardWidget/DashboardWidget'
import { DistributionBars, SimpleList } from '../../components/investigations/DashboardWidget/WidgetCharts'
import { InvestigationCard } from '../../components/investigations/InvestigationCard/InvestigationCard'
import { RegulatoryChangeCard } from '../../components/investigations/RegulatoryChangeCard/RegulatoryChangeCard'
import { MetricCard } from '../../components/work/MetricCard/MetricCard'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { SearchField } from '../../components/ui/SearchField/SearchField'
import { Select } from '../../components/ui/Select/Select'
import { SectionHeader } from '../../components/ui/SectionHeader/SectionHeader'
import { useInvestigations } from '../../hooks/useInvestigations'
import type { InvestigationPriority, InvestigationStatus, RiskScoreBand } from '../../types/investigations'
import { formatDate, formatRelativeTime } from '../../utils/date'
import {
  DEFAULT_INVESTIGATION_FILTERS,
  filterInvestigations,
  type InvestigationFilters,
} from '../../utils/investigationSearch'
import styles from './InvestigationsPage.module.css'

type QueueFilter = 'all' | 'open' | 'assigned' | 'high_priority' | 'recent' | 'closed'

export function InvestigationsPage() {
  const navigate = useNavigate()
  const { investigations, changes, activity, currentUserId, getUser } = useInvestigations()
  const [queue, setQueue] = useState<QueueFilter>('all')
  const [filters, setFilters] = useState<InvestigationFilters>(DEFAULT_INVESTIGATION_FILTERS)

  const metrics = useMemo(() => {
    const open = investigations.filter((item) => item.status !== 'closed').length
    const assigned = investigations.filter((item) => item.assigneeIds.includes(currentUserId)).length
    const highPriority = investigations.filter((item) => item.priority === 'high' || item.priority === 'urgent').length
    const closed = investigations.filter((item) => item.status === 'closed').length
    return { open, assigned, highPriority, closed, total: investigations.length }
  }, [investigations, currentUserId])

  const filtered = useMemo(() => {
    let result = filterInvestigations(investigations, filters)
    if (queue === 'open') result = result.filter((item) => item.status === 'open' || item.status === 'in_progress')
    if (queue === 'assigned') result = result.filter((item) => item.assigneeIds.includes(currentUserId))
    if (queue === 'high_priority') result = result.filter((item) => item.priority === 'high' || item.priority === 'urgent')
    if (queue === 'closed') result = result.filter((item) => item.status === 'closed')
    if (queue === 'recent') {
      result = [...result].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)).slice(0, 6)
    } else {
      result = [...result].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
    }
    return result
  }, [investigations, filters, queue, currentUserId])

  const riskDistribution = useMemo(() => {
    const bands: RiskScoreBand[] = ['critical', 'high', 'medium', 'low']
    return bands.map((label) => ({
      label,
      value: investigations.filter((item) => item.riskBand === label).length,
    }))
  }, [investigations])

  const statusDistribution = useMemo(() => {
    const statuses: InvestigationStatus[] = ['open', 'in_progress', 'pending_review', 'escalated', 'closed']
    return statuses.map((label) => ({
      label: label.replace('_', ' '),
      value: investigations.filter((item) => item.status === label).length,
    }))
  }, [investigations])

  const jurisdictions = useMemo(
    () => [...new Set(investigations.map((item) => item.jurisdiction))],
    [investigations],
  )
  const regulations = useMemo(
    () =>
      [...new Map(investigations.map((item) => [item.relatedRegulationId, item.relatedRegulationTitle])).entries()].map(
        ([id, title]) => ({ id, title }),
      ),
    [investigations],
  )

  const upcoming = useMemo(
    () =>
      [...investigations]
        .filter((item) => item.status !== 'closed')
        .sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate))
        .slice(0, 5)
        .map((item) => ({ label: item.caseId, detail: formatDate(item.dueDate) })),
    [investigations],
  )

  const recentActivity = useMemo(
    () =>
      [...activity]
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
        .slice(0, 5)
        .map((item) => ({ label: item.title, detail: formatRelativeTime(item.createdAt) })),
    [activity],
  )

  const recentChanges = useMemo(
    () => [...changes].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)).slice(0, 3),
    [changes],
  )

  function patchFilters(patch: Partial<InvestigationFilters>) {
    setFilters((current) => ({ ...current, ...patch }))
  }

  return (
    <PageContainer>
      <div className={styles.page}>
        <PageHeader
          icon={<ShieldAlert size={20} />}
          title="Investigations"
          description="Enterprise investigation workspace for compliance officers, investigators, and regulatory teams."
          actions={
            <button type="button" className={styles.linkButton} onClick={() => navigate('/regulatory-changes')}>
              Regulatory changes
            </button>
          }
        />

        <div className={styles.metrics}>
          <MetricCard label="Open investigations" value={metrics.open} tone="accent" active={queue === 'open'} onClick={() => setQueue('open')} />
          <MetricCard label="Assigned to me" value={metrics.assigned} active={queue === 'assigned'} onClick={() => setQueue('assigned')} />
          <MetricCard label="High priority" value={metrics.highPriority} tone="danger" active={queue === 'high_priority'} onClick={() => setQueue('high_priority')} />
          <MetricCard label="Recently updated" value={metrics.total} active={queue === 'recent'} onClick={() => setQueue('recent')} />
          <MetricCard label="Closed" value={metrics.closed} tone="success" active={queue === 'closed'} onClick={() => setQueue('closed')} />
        </div>

        <section className={styles.filters} aria-label="Investigation search">
          <SearchField
            value={filters.query}
            onChange={(event) => patchFilters({ query: event.target.value })}
            placeholder="Search investigations"
            aria-label="Search investigations"
          />
          <Select value={filters.status} onChange={(event) => patchFilters({ status: event.target.value as InvestigationStatus | 'all' })} aria-label="Status">
            <option value="all">All statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In progress</option>
            <option value="pending_review">Pending review</option>
            <option value="escalated">Escalated</option>
            <option value="closed">Closed</option>
          </Select>
          <Select value={filters.ownerId} onChange={(event) => patchFilters({ ownerId: event.target.value })} aria-label="Owner">
            <option value="all">All owners</option>
            {['u-01', 'u-02', 'u-03'].map((id) => (
              <option key={id} value={id}>
                {getUser(id)?.name}
              </option>
            ))}
          </Select>
          <Select value={filters.priority} onChange={(event) => patchFilters({ priority: event.target.value as InvestigationPriority | 'all' })} aria-label="Priority">
            <option value="all">All priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </Select>
          <Select value={filters.risk} onChange={(event) => patchFilters({ risk: event.target.value as RiskScoreBand | 'all' })} aria-label="Risk">
            <option value="all">All risk</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </Select>
          <Select value={filters.regulationId} onChange={(event) => patchFilters({ regulationId: event.target.value })} aria-label="Regulation">
            <option value="all">All regulations</option>
            {regulations.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </Select>
          <Select value={filters.jurisdiction} onChange={(event) => patchFilters({ jurisdiction: event.target.value })} aria-label="Jurisdiction">
            <option value="all">All jurisdictions</option>
            {jurisdictions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
          <input
            type="date"
            className={styles.date}
            value={filters.dateFrom}
            onChange={(event) => patchFilters({ dateFrom: event.target.value })}
            aria-label="Created from"
          />
          <input
            type="date"
            className={styles.date}
            value={filters.dateTo}
            onChange={(event) => patchFilters({ dateTo: event.target.value })}
            aria-label="Created to"
          />
          {(queue !== 'all' || filters.query) && (
            <button type="button" className={styles.reset} onClick={() => { setQueue('all'); setFilters(DEFAULT_INVESTIGATION_FILTERS) }}>
              <Search size={14} aria-hidden="true" />
              Reset
            </button>
          )}
        </section>

        <div className={styles.layout}>
          <div className={styles.main}>
            <SectionHeader title="Investigation queue" as="h2" description={`${filtered.length} investigations`} />
            {filtered.length === 0 ? (
              <p className={styles.empty}>No investigations match these filters.</p>
            ) : (
              <div className={styles.grid}>
                {filtered.map((investigation) => (
                  <InvestigationCard
                    key={investigation.id}
                    investigation={investigation}
                    ownerName={getUser(investigation.ownerId)?.name ?? 'Unassigned'}
                  />
                ))}
              </div>
            )}
          </div>

          <aside className={styles.side}>
            <DashboardWidget title="Investigation metrics">
              <SimpleList
                items={[
                  { label: 'Open', detail: String(metrics.open) },
                  { label: 'Assigned to me', detail: String(metrics.assigned) },
                  { label: 'High priority', detail: String(metrics.highPriority) },
                ]}
              />
            </DashboardWidget>
            <DashboardWidget title="Risk distribution">
              <DistributionBars items={riskDistribution} />
            </DashboardWidget>
            <DashboardWidget title="Cases by status">
              <DistributionBars items={statusDistribution} />
            </DashboardWidget>
            <DashboardWidget title="Upcoming deadlines">
              <SimpleList items={upcoming} />
            </DashboardWidget>
            <DashboardWidget title="Recent activity">
              <SimpleList items={recentActivity} />
            </DashboardWidget>
            <DashboardWidget
              title="Recent regulatory changes"
              action={
                <button type="button" className={styles.inlineLink} onClick={() => navigate('/regulatory-changes')}>
                  View all
                </button>
              }
            >
              <div className={styles.changeStack}>
                {recentChanges.map((change) => (
                  <RegulatoryChangeCard
                    key={change.id}
                    change={change}
                    reviewerName={getUser(change.reviewerId)?.name ?? 'Unassigned'}
                  />
                ))}
              </div>
            </DashboardWidget>
          </aside>
        </div>
      </div>
    </PageContainer>
  )
}
