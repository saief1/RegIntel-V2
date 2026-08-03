import { FileText, Link2, StickyNote, BookOpen } from 'lucide-react'
import type { EvidenceItem } from '../../../types/work'
import { formatRelativeTime } from '../../../utils/date'
import { StatusBadge } from '../StatusBadge/StatusBadge'
import styles from './EvidenceCard.module.css'

const ICONS = {
  attachment: FileText,
  link: Link2,
  note: StickyNote,
  regulation: BookOpen,
} as const

interface EvidenceCardProps {
  evidence: EvidenceItem
  onOpenRegulation?: (documentId: string) => void
}

export function EvidenceCard({ evidence, onOpenRegulation }: EvidenceCardProps) {
  const Icon = ICONS[evidence.kind]
  const confidence = Math.round(evidence.confidence * 100)

  return (
    <article className={styles.card}>
      <div className={styles.icon} aria-hidden="true">
        <Icon size={16} />
      </div>
      <div className={styles.body}>
        <div className={styles.header}>
          {evidence.kind === 'regulation' && evidence.documentId && onOpenRegulation ? (
            <button type="button" className={styles.titleButton} onClick={() => onOpenRegulation(evidence.documentId!)}>
              {evidence.title}
            </button>
          ) : evidence.kind === 'link' && evidence.url ? (
            <a className={styles.titleLink} href={evidence.url} target="_blank" rel="noreferrer">
              {evidence.title}
            </a>
          ) : (
            <h4 className={styles.title}>{evidence.title}</h4>
          )}
          <StatusBadge status={evidence.status} />
        </div>
        {evidence.note && <p className={styles.note}>{evidence.note}</p>}
        <dl className={styles.meta}>
          <div>
            <dt>Source</dt>
            <dd>{evidence.source}</dd>
          </div>
          <div>
            <dt>Confidence</dt>
            <dd>{confidence}%</dd>
          </div>
          <div>
            <dt>Added</dt>
            <dd>
              <time dateTime={evidence.createdAt}>{formatRelativeTime(evidence.createdAt)}</time>
            </dd>
          </div>
        </dl>
      </div>
    </article>
  )
}
