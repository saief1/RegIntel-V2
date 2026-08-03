import { useNavigate } from 'react-router-dom'
import type { Investigation } from '../../../types/investigations'
import { formatDate, formatRelativeTime } from '../../../utils/date'
import { PriorityBadge } from '../../work/PriorityBadge/PriorityBadge'
import { RiskBadge } from '../../work/RiskBadge/RiskBadge'
import { InvestigationStatusBadge } from '../InvestigationStatusBadge/InvestigationStatusBadge'
import styles from './InvestigationCard.module.css'

interface InvestigationCardProps {
  investigation: Investigation
  ownerName: string
}

export function InvestigationCard({ investigation, ownerName }: InvestigationCardProps) {
  const navigate = useNavigate()

  return (
    <button type="button" className={styles.card} onClick={() => navigate(`/investigations/${investigation.id}`)}>
      <header className={styles.header}>
        <span className={styles.caseId}>{investigation.caseId}</span>
        <div className={styles.badges}>
          <InvestigationStatusBadge status={investigation.status} />
          <PriorityBadge priority={investigation.priority} />
          <RiskBadge risk={investigation.riskBand} />
        </div>
      </header>
      <h3 className={styles.title}>{investigation.title}</h3>
      <p className={styles.meta}>
        <span>{ownerName}</span>
        <span aria-hidden="true">·</span>
        <span>{investigation.relatedRegulationTitle}</span>
      </p>
      <footer className={styles.footer}>
        <span>Risk {investigation.riskScore}</span>
        <span>Due {formatDate(investigation.dueDate)}</span>
        <time dateTime={investigation.updatedAt}>Updated {formatRelativeTime(investigation.updatedAt)}</time>
      </footer>
    </button>
  )
}
