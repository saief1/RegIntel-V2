import { useNavigate } from 'react-router-dom'
import { Bookmark, Briefcase, FileText, MessageSquare, Search, Star } from 'lucide-react'
import type { MemoryItem } from '../../../types/ai'
import { formatRelativeTime } from '../../../utils/date'
import styles from './MemoryCard.module.css'

const ICONS = {
  conversation: MessageSquare,
  knowledge: Star,
  evidence: FileText,
  bookmark: Bookmark,
  regulation: FileText,
  search: Search,
  case: Briefcase,
} as const

interface MemoryCardProps {
  item: MemoryItem
}

export function MemoryCard({ item }: MemoryCardProps) {
  const navigate = useNavigate()
  const Icon = ICONS[item.kind] ?? Bookmark

  return (
    <button
      type="button"
      className={styles.card}
      onClick={() => item.href && navigate(item.href)}
      disabled={!item.href}
    >
      <span className={styles.icon} aria-hidden="true">
        <Icon size={16} />
      </span>
      <span className={styles.body}>
        <span className={styles.title}>{item.title}</span>
        {item.detail && <span className={styles.subtitle}>{item.detail}</span>}
        <time className={styles.time} dateTime={item.createdAt}>
          {formatRelativeTime(item.createdAt)}
        </time>
      </span>
    </button>
  )
}
