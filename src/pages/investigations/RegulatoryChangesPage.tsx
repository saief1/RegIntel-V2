import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Scale } from 'lucide-react'
import { RegulatoryChangeCard } from '../../components/investigations/RegulatoryChangeCard/RegulatoryChangeCard'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { SearchField } from '../../components/ui/SearchField/SearchField'
import { Select } from '../../components/ui/Select/Select'
import { useInvestigations } from '../../hooks/useInvestigations'
import type { RegulatoryChangeStatus } from '../../types/investigations'
import styles from './RegulatoryChangesPage.module.css'

export function RegulatoryChangesPage() {
  const navigate = useNavigate()
  const { changes, getUser } = useInvestigations()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<RegulatoryChangeStatus | 'all'>('all')

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return [...changes]
      .filter((item) => {
        if (status !== 'all' && item.status !== status) return false
        if (!normalized) return true
        return `${item.title} ${item.summary} ${item.jurisdiction} ${item.category}`.toLowerCase().includes(normalized)
      })
      .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
  }, [changes, query, status])

  return (
    <PageContainer>
      <div className={styles.page}>
        <PageHeader
          icon={<Scale size={20} />}
          title="Regulatory change hub"
          description="Track recent regulatory changes, pending reviews, impact assessments, and assigned reviewers."
          actions={
            <button type="button" className={styles.link} onClick={() => navigate('/investigations')}>
              Investigations
            </button>
          }
        />

        <div className={styles.toolbar}>
          <SearchField
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search regulatory changes"
            aria-label="Search regulatory changes"
          />
          <Select
            value={status}
            onChange={(event) => setStatus(event.target.value as RegulatoryChangeStatus | 'all')}
            aria-label="Status"
          >
            <option value="all">All statuses</option>
            <option value="new">New</option>
            <option value="pending_review">Pending review</option>
            <option value="assessing">Assessing</option>
            <option value="remediating">Remediating</option>
            <option value="completed">Completed</option>
            <option value="deferred">Deferred</option>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <p className={styles.empty}>No regulatory changes match this filter.</p>
        ) : (
          <div className={styles.grid}>
            {filtered.map((change) => (
              <RegulatoryChangeCard
                key={change.id}
                change={change}
                reviewerName={getUser(change.reviewerId)?.name ?? 'Unassigned'}
              />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  )
}
