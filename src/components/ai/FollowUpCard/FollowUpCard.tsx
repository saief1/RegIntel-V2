import { ArrowRight } from 'lucide-react'
import styles from './FollowUpCard.module.css'

interface FollowUpCardProps {
  question: string
  onSelect: () => void
}

export function FollowUpCard({ question, onSelect }: FollowUpCardProps) {
  return (
    <button type="button" className={styles.card} onClick={onSelect}>
      <span className={styles.text}>{question}</span>
      <ArrowRight size={14} aria-hidden="true" />
    </button>
  )
}
