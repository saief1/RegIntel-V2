import { Check, Copy, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import type { WorkTask, WorkUser } from '../../../types/work'
import { formatDate } from '../../../utils/date'
import { Dropdown } from '../../ui/Dropdown/Dropdown'
import { DropdownItem, DropdownSeparator } from '../../ui/Dropdown/DropdownItem'
import { IconButton } from '../../ui/IconButton/IconButton'
import { PriorityBadge } from '../PriorityBadge/PriorityBadge'
import { StatusBadge } from '../StatusBadge/StatusBadge'
import styles from './TaskCard.module.css'

interface TaskCardProps {
  task: WorkTask
  owner?: WorkUser
  onComplete: () => void
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
  onToggleChecklist: (itemId: string) => void
}

export function TaskCard({ task, owner, onComplete, onEdit, onDuplicate, onDelete, onToggleChecklist }: TaskCardProps) {
  const doneCount = task.checklist.filter((item) => item.done).length

  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <h4 className={styles.title}>{task.title}</h4>
          <Dropdown
            align="end"
            trigger={
              <IconButton label={`Task options for ${task.title}`}>
                <MoreHorizontal size={16} />
              </IconButton>
            }
          >
            {(close) => (
              <>
                <DropdownItem
                  icon={<Pencil size={14} />}
                  onClick={() => {
                    close()
                    onEdit()
                  }}
                >
                  Edit
                </DropdownItem>
                <DropdownItem
                  icon={<Check size={14} />}
                  onClick={() => {
                    close()
                    onComplete()
                  }}
                >
                  Mark complete
                </DropdownItem>
                <DropdownItem
                  icon={<Copy size={14} />}
                  onClick={() => {
                    close()
                    onDuplicate()
                  }}
                >
                  Duplicate
                </DropdownItem>
                <DropdownSeparator />
                <DropdownItem
                  icon={<Trash2 size={14} />}
                  destructive
                  onClick={() => {
                    close()
                    onDelete()
                  }}
                >
                  Delete
                </DropdownItem>
              </>
            )}
          </Dropdown>
        </div>
        <div className={styles.badges}>
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
        </div>
      </header>
      {task.description && <p className={styles.description}>{task.description}</p>}
      {task.checklist.length > 0 && (
        <ul className={styles.checklist} aria-label="Checklist">
          {task.checklist.map((item) => (
            <li key={item.id}>
              <label className={styles.checkItem}>
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => onToggleChecklist(item.id)}
                />
                <span data-done={item.done || undefined}>{item.label}</span>
              </label>
            </li>
          ))}
        </ul>
      )}
      <footer className={styles.footer}>
        <span>{owner?.name ?? 'Unassigned'}</span>
        <span>Due {formatDate(task.dueDate)}</span>
        {task.checklist.length > 0 && (
          <span>
            {doneCount}/{task.checklist.length} checklist
          </span>
        )}
      </footer>
    </article>
  )
}
