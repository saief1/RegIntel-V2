import type { DecisionRecord, WorkUser } from '../../../types/work'
import { formatDate, formatRelativeTime } from '../../../utils/date'
import { Badge } from '../../ui/Badge/Badge'
import styles from './DecisionCard.module.css'

const OUTCOME_LABELS = {
  approve: 'Approve',
  reject: 'Reject',
  escalate: 'Escalate',
  defer: 'Defer',
  remediate: 'Remediate',
} as const

interface DecisionCardProps {
  decision: DecisionRecord
  reviewer?: WorkUser
  isLatest?: boolean
}

export function DecisionCard({ decision, reviewer, isLatest = false }: DecisionCardProps) {
  return (
    <article className={styles.card} data-latest={isLatest || undefined}>
      <header className={styles.header}>
        <div className={styles.outcomeRow}>
          <Badge variant={decision.outcome === 'approve' ? 'success' : decision.outcome === 'escalate' || decision.outcome === 'reject' ? 'error' : 'warning'}>
            {OUTCOME_LABELS[decision.outcome]}
          </Badge>
          <span className={styles.version}>v{decision.version}</span>
          {isLatest && <span className={styles.latest}>Latest</span>}
        </div>
        <time className={styles.time} dateTime={decision.createdAt} title={formatDate(decision.createdAt)}>
          {formatRelativeTime(decision.createdAt)}
        </time>
      </header>
      <p className={styles.reason}>{decision.reason}</p>
      <dl className={styles.meta}>
        <div>
          <dt>Reviewer</dt>
          <dd>{reviewer?.name ?? 'Unknown'}</dd>
        </div>
        <div>
          <dt>Supporting regs</dt>
          <dd>{decision.supportingDocumentIds.length}</dd>
        </div>
        <div>
          <dt>Evidence</dt>
          <dd>{decision.evidenceIds.length}</dd>
        </div>
      </dl>
    </article>
  )
}
