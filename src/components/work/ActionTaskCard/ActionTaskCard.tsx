import { useNavigate } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import type { WorkTask } from '../../../types/work'
import { formatDate } from '../../../utils/date'
import { ChecklistProgress } from '../ChecklistProgress/ChecklistProgress'
import { PriorityBadge } from '../PriorityBadge/PriorityBadge'
import { StatusBadge } from '../StatusBadge/StatusBadge'
import styles from './ActionTaskCard.module.css'

interface ActionTaskCardProps {
  task: WorkTask
  ownerName?: string
  selected?: boolean
  onToggleSelect?: (id: string) => void
  draggable?: boolean
  onDragStart?: (id: string) => void
}

export function ActionTaskCard({
  task,
  ownerName,
  selected = false,
  onToggleSelect,
  draggable = false,
  onDragStart,
}: ActionTaskCardProps) {
  const navigate = useNavigate()

  return (
    <article
      className={styles.card}
      data-selected={selected || undefined}
      draggable={draggable}
      onDragStart={() => onDragStart?.(task.id)}
    >
      <div className={styles.top}>
        {onToggleSelect && (
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={selected}
            aria-label={`Select ${task.title}`}
            onChange={() => onToggleSelect(task.id)}
            onClick={(event) => event.stopPropagation()}
          />
        )}
        <button type="button" className={styles.titleButton} onClick={() => navigate(`/work/tasks/${task.id}`)}>
          <span className={styles.title}>{task.title}</span>
        </button>
        {task.aiGenerated && (
          <span className={styles.aiBadge}>
            <Sparkles size={12} aria-hidden="true" />
            AI
          </span>
        )}
      </div>

      <div className={styles.meta}>
        <PriorityBadge priority={task.priority} />
        <StatusBadge status={task.status} />
        <span className={styles.due}>Due {formatDate(task.dueDate)}</span>
      </div>

      <div className={styles.footer}>
        <span className={styles.owner}>{ownerName ?? 'Unassigned'}</span>
        {task.linkedRegulation && <span className={styles.regulation}>{task.linkedRegulation}</span>}
      </div>

      {task.checklist.length > 0 && <ChecklistProgress items={task.checklist} compact />}
    </article>
  )
}
