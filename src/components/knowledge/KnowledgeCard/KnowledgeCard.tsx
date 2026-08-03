import { Link } from 'react-router-dom'
import { Bookmark, Pin } from 'lucide-react'
import { clsx as cx } from 'clsx'
import type { KnowledgeDocument } from '../../../types/knowledge'
import { formatRelativeTime } from '../../../utils/date'
import { Badge } from '../../ui/Badge/Badge'
import { kindLabel, statusBadgeVariant, statusLabel } from '../statusBadge'
import styles from './KnowledgeCard.module.css'

interface KnowledgeCardProps {
  document: KnowledgeDocument
  href: string
  isFavorite?: boolean
  isPinned?: boolean
  onToggleFavorite?: () => void
  onTogglePinned?: () => void
  className?: string
}

/** Grid presentation of a single library document — the primary building block of Knowledge Home and the Regulation Library. */
export function KnowledgeCard({
  document,
  href,
  isFavorite = false,
  isPinned = false,
  onToggleFavorite,
  onTogglePinned,
  className,
}: KnowledgeCardProps) {
  const visibleTags = document.tags.slice(0, 3)
  const hiddenTagCount = document.tags.length - visibleTags.length

  return (
    <Link to={href} className={cx(styles.card, className)}>
      <div className={styles.header}>
        <div className={styles.badges}>
          <Badge variant="neutral">{kindLabel(document.kind)}</Badge>
          <Badge variant={statusBadgeVariant(document.status)}>{statusLabel(document.status)}</Badge>
        </div>
        <div className={styles.quickActions}>
          {onTogglePinned && (
            <button
              type="button"
              className={cx(styles.quickAction, isPinned && styles.quickActionActive)}
              aria-pressed={isPinned}
              aria-label={isPinned ? 'Unpin regulation' : 'Pin regulation'}
              title={isPinned ? 'Unpin regulation' : 'Pin regulation'}
              onClick={(event) => {
                event.preventDefault()
                onTogglePinned()
              }}
            >
              <Pin size={14} fill={isPinned ? 'currentColor' : 'none'} />
            </button>
          )}
          {onToggleFavorite && (
            <button
              type="button"
              className={cx(styles.quickAction, isFavorite && styles.quickActionActive)}
              aria-pressed={isFavorite}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              onClick={(event) => {
                event.preventDefault()
                onToggleFavorite()
              }}
            >
              <Bookmark size={14} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>
      </div>

      <h3 className={styles.title}>{document.title}</h3>
      <p className={styles.summary}>{document.summary}</p>

      {visibleTags.length > 0 && (
        <ul className={styles.tags}>
          {visibleTags.map((tag) => (
            <li key={tag} className={styles.tag}>
              {tag}
            </li>
          ))}
          {hiddenTagCount > 0 && <li className={styles.tag}>+{hiddenTagCount}</li>}
        </ul>
      )}

      <div className={styles.footer}>
        <span className={styles.jurisdiction}>{document.jurisdiction}</span>
        <span className={styles.dot} aria-hidden="true">
          ·
        </span>
        <span>Updated {formatRelativeTime(document.lastUpdated)}</span>
      </div>
    </Link>
  )
}
