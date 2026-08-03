import { checklistProgress } from '../../../utils/smartDueDates'
import styles from './ChecklistProgress.module.css'

interface ChecklistProgressProps {
  items: { done: boolean }[]
  compact?: boolean
}

export function ChecklistProgress({ items, compact = false }: ChecklistProgressProps) {
  const percent = checklistProgress(items)
  return (
    <div className={compact ? styles.compact : styles.wrap} aria-label={`Checklist ${percent}% complete`}>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${percent}%` }} />
      </div>
      <span className={styles.label}>{percent}%</span>
    </div>
  )
}
