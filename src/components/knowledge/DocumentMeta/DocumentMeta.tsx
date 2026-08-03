import { Calendar, Clock, MapPin, Tag as TagIcon } from 'lucide-react'
import { clsx as cx } from 'clsx'
import type { KnowledgeDocument } from '../../../types/knowledge'
import { formatDate } from '../../../utils/date'
import { Badge } from '../../ui/Badge/Badge'
import { statusBadgeVariant, statusLabel } from '../statusBadge'
import styles from './DocumentMeta.module.css'

interface DocumentMetaProps {
  document: KnowledgeDocument
  layout?: 'inline' | 'stacked'
  className?: string
}

/** Labeled metadata row for a document: jurisdiction, category, effective date, version, status, reading time. */
export function DocumentMeta({ document, layout = 'inline', className }: DocumentMetaProps) {
  return (
    <dl className={cx(styles.meta, styles[layout], className)}>
      <div className={styles.item}>
        <dt className={styles.label}>
          <MapPin size={14} aria-hidden="true" />
          Jurisdiction
        </dt>
        <dd className={styles.value}>{document.jurisdiction}</dd>
      </div>
      <div className={styles.item}>
        <dt className={styles.label}>
          <TagIcon size={14} aria-hidden="true" />
          Category
        </dt>
        <dd className={styles.value}>{document.category}</dd>
      </div>
      <div className={styles.item}>
        <dt className={styles.label}>
          <Calendar size={14} aria-hidden="true" />
          Effective date
        </dt>
        <dd className={styles.value}>{formatDate(document.effectiveDate)}</dd>
      </div>
      <div className={styles.item}>
        <dt className={styles.label}>Version</dt>
        <dd className={styles.value}>{document.version}</dd>
      </div>
      <div className={styles.item}>
        <dt className={styles.label}>Status</dt>
        <dd className={styles.value}>
          <Badge variant={statusBadgeVariant(document.status)}>{statusLabel(document.status)}</Badge>
        </dd>
      </div>
      <div className={styles.item}>
        <dt className={styles.label}>
          <Clock size={14} aria-hidden="true" />
          Reading time
        </dt>
        <dd className={styles.value}>{document.readingTimeMinutes} min</dd>
      </div>
    </dl>
  )
}
