import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileStack, GanttChart, LayoutGrid, List } from 'lucide-react'
import g from '../../components/governance/governance.module.css'
import { Badge } from '../../components/ui/Badge/Badge'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { useGovernance } from '../../hooks/useGovernance'
import { useWork } from '../../hooks/useWork'
import { formatDate } from '../../utils/date'
import styles from './PoliciesPage.module.css'

type ViewMode = 'grid' | 'list' | 'timeline'

export function PoliciesPage() {
  const navigate = useNavigate()
  const { policies, departments, reviewWarnings, getVersions } = useGovernance()
  const { getUser } = useWork()
  const [view, setView] = useState<ViewMode>('grid')

  const timeline = useMemo(
    () => [...policies].sort((a, b) => +new Date(a.nextReviewDate) - +new Date(b.nextReviewDate)),
    [policies],
  )

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        title="Policy Workspace"
        description="Manage the full policy lifecycle — ownership, reviews, approvals, and linked controls."
        icon={<FileStack size={20} />}
        actions={
          <div className={g.tabs} role="tablist" aria-label="Policy views">
            {(
              [
                ['grid', 'Grid', LayoutGrid],
                ['list', 'List', List],
                ['timeline', 'Timeline', GanttChart],
              ] as const
            ).map(([id, label, Icon]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={view === id}
                className={view === id ? g.tabActive : g.tab}
                onClick={() => setView(id)}
              >
                <Icon size={14} aria-hidden="true" /> {label}
              </button>
            ))}
          </div>
        }
      />

      {reviewWarnings.length > 0 && (
        <div className={g.panel}>
          <h2>AI review warnings</h2>
          <ul className={g.list}>
            {reviewWarnings.slice(0, 4).map((item) => (
              <li key={item.policyId}>
                <button type="button" onClick={() => navigate(`/knowledge/policies/${item.policyId}`)}>
                  <span>
                    {item.title} · review in {item.daysUntil} days
                  </span>
                  <span>{formatDate(item.nextReviewDate)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {view === 'grid' && (
        <div className={g.grid}>
          {policies.map((policy) => (
            <button
              key={policy.id}
              type="button"
              className={g.card}
              onClick={() => navigate(`/knowledge/policies/${policy.id}`)}
            >
              <div className={g.meta}>
                <Badge variant={policy.status === 'published' ? 'success' : 'warning'}>{policy.status}</Badge>
                <span>{getVersions(policy.id).find((item) => item.isCurrent)?.label ?? 'Current'}</span>
              </div>
              <h3>{policy.title}</h3>
              <div className={g.meta}>
                <span>{getUser(policy.ownerId)?.name}</span>
                <span>{departments.find((d) => d.id === policy.departmentId)?.name}</span>
              </div>
              <div className={g.meta}>
                <span>Effective {formatDate(policy.effectiveDate)}</span>
                <span>Next review {formatDate(policy.nextReviewDate)}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {view === 'list' && (
        <ul className={g.list}>
          {policies.map((policy) => (
            <li key={policy.id}>
              <button type="button" onClick={() => navigate(`/knowledge/policies/${policy.id}`)}>
                <span>
                  <strong>{policy.title}</strong>
                  <span className={g.muted}>
                    {' '}
                    · {getUser(policy.ownerId)?.name} · {policy.approvalStatus}
                  </span>
                </span>
                <span>{policy.status}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {view === 'timeline' && (
        <ol className={styles.timeline}>
          {timeline.map((policy) => (
            <li key={policy.id}>
              <time dateTime={policy.nextReviewDate}>{formatDate(policy.nextReviewDate)}</time>
              <button type="button" onClick={() => navigate(`/knowledge/policies/${policy.id}`)}>
                <strong>{policy.title}</strong>
                <span>
                  {policy.reviewCadence} review · {getUser(policy.ownerId)?.name}
                </span>
              </button>
            </li>
          ))}
        </ol>
      )}
    </PageContainer>
  )
}
