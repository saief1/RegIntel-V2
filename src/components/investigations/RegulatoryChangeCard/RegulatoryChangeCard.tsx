import { useNavigate } from 'react-router-dom'
import type { RegulatoryChange } from '../../../types/investigations'
import { formatDate } from '../../../utils/date'
import { RegulatoryChangeStatusBadge } from '../InvestigationStatusBadge/InvestigationStatusBadge'
import styles from './RegulatoryChangeCard.module.css'

interface RegulatoryChangeCardProps {
  change: RegulatoryChange
  reviewerName: string
}

export function RegulatoryChangeCard({ change, reviewerName }: RegulatoryChangeCardProps) {
  const navigate = useNavigate()

  return (
    <button type="button" className={styles.card} onClick={() => navigate(`/regulatory-changes/${change.id}`)}>
      <header className={styles.header}>
        <RegulatoryChangeStatusBadge status={change.status} />
        <span className={styles.jurisdiction}>{change.jurisdiction}</span>
      </header>
      <h3 className={styles.title}>{change.title}</h3>
      <p className={styles.summary}>{change.summary}</p>
      <footer className={styles.footer}>
        <span>{change.category}</span>
        <span>Reviewer {reviewerName}</span>
        <span>Effective {formatDate(change.effectiveDate)}</span>
      </footer>
    </button>
  )
}
