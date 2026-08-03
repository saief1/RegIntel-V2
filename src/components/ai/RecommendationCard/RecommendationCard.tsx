import { X } from 'lucide-react'
import type { AiRecommendation } from '../../../types/ai'
import { Badge } from '../../ui/Badge/Badge'
import { Button } from '../../ui/Button/Button'
import { IconButton } from '../../ui/IconButton/IconButton'
import { ConfidenceBadge } from '../ConfidenceBadge/ConfidenceBadge'
import styles from './RecommendationCard.module.css'

const PRIORITY_VARIANT = {
  urgent: 'error',
  high: 'error',
  medium: 'warning',
  low: 'neutral',
} as const

interface RecommendationCardProps {
  recommendation: AiRecommendation
  onAction: () => void
  onDismiss: () => void
}

export function RecommendationCard({ recommendation, onAction, onDismiss }: RecommendationCardProps) {
  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <div className={styles.badges}>
          <Badge variant={PRIORITY_VARIANT[recommendation.priority]}>{recommendation.priority} priority</Badge>
          <ConfidenceBadge value={recommendation.confidence} />
        </div>
        <IconButton label="Dismiss recommendation" onClick={onDismiss}>
          <X size={14} />
        </IconButton>
      </header>
      <h3 className={styles.title}>{recommendation.title}</h3>
      <p className={styles.reason}>{recommendation.reason}</p>
      <Button size="sm" onClick={onAction}>
        {recommendation.actionLabel}
      </Button>
    </article>
  )
}
