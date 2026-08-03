import { FileText } from 'lucide-react'
import { clsx as cx } from 'clsx'
import type { Citation } from '../../../types/knowledge'
import styles from './CitationBadge.module.css'

interface CitationBadgeProps {
  citation: Citation
  index: number
  onOpen?: (citation: Citation) => void
  className?: string
}

/** Numbered inline source reference, used under AI Research answers and in "Related Regulations" lists. */
export function CitationBadge({ citation, index, onOpen, className }: CitationBadgeProps) {
  return (
    <button
      type="button"
      className={cx(styles.badge, className)}
      onClick={() => onOpen?.(citation)}
      title={citation.snippet}
    >
      <span className={styles.index} aria-hidden="true">
        {index}
      </span>
      <FileText size={12} aria-hidden="true" className={styles.icon} />
      <span className={styles.title}>{citation.documentTitle}</span>
    </button>
  )
}
