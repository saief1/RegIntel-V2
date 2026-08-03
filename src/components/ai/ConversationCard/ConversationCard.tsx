import { Bookmark, Pin, Star } from 'lucide-react'
import { clsx as cx } from 'clsx'
import type { Conversation } from '../../../types/ai'
import { formatRelativeTime } from '../../../utils/date'
import styles from './ConversationCard.module.css'

interface ConversationCardProps {
  conversation: Conversation
  active?: boolean
  onSelect: () => void
}

export function ConversationCard({ conversation, active = false, onSelect }: ConversationCardProps) {
  return (
    <button type="button" className={cx(styles.card, active && styles.active)} onClick={onSelect}>
      <span className={styles.titleRow}>
        <span className={styles.title}>{conversation.title}</span>
        <span className={styles.flags}>
          {conversation.isPinned && <Pin size={12} aria-label="Pinned" />}
          {conversation.isFavorite && <Star size={12} aria-label="Favorite" />}
          {conversation.isSaved && <Bookmark size={12} aria-label="Saved" />}
        </span>
      </span>
      <span className={styles.meta}>
        <time dateTime={conversation.updatedAt}>{formatRelativeTime(conversation.updatedAt)}</time>
        <span>{conversation.messages.length} messages</span>
      </span>
    </button>
  )
}
