import { Link } from 'react-router-dom'
import type { WorkCase, WorkUser } from '../../../types/work'
import { formatDate, formatRelativeTime } from '../../../utils/date'
import { AvatarGroup } from '../AvatarGroup/AvatarGroup'
import { PriorityBadge } from '../PriorityBadge/PriorityBadge'
import { RiskBadge } from '../RiskBadge/RiskBadge'
import { StatusBadge } from '../StatusBadge/StatusBadge'
import styles from './CaseCard.module.css'

interface CaseCardProps {
  workCase: WorkCase
  owner?: WorkUser
  assignees: WorkUser[]
}

export function CaseCard({ workCase, owner, assignees }: CaseCardProps) {
  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <div className={styles.idRow}>
          <span className={styles.caseNumber}>{workCase.caseNumber}</span>
          <StatusBadge status={workCase.status} />
        </div>
        <Link to={`/work/cases/${workCase.id}`} className={styles.title}>
          {workCase.title}
        </Link>
      </header>
      <p className={styles.summary}>{workCase.summary}</p>
      <div className={styles.badges}>
        <RiskBadge risk={workCase.risk} />
        <PriorityBadge priority={workCase.priority} />
      </div>
      <footer className={styles.footer}>
        <div className={styles.owner}>
          <span className={styles.metaLabel}>Owner</span>
          <span>{owner?.name ?? 'Unassigned'}</span>
        </div>
        <AvatarGroup users={assignees} />
        <div className={styles.dates}>
          <span>Due {formatDate(workCase.dueDate)}</span>
          <span>Updated {formatRelativeTime(workCase.updatedAt)}</span>
        </div>
      </footer>
    </article>
  )
}
