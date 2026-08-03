import type { Priority, TaskStatus } from '../../../types/work'
import { WORK_USERS } from '../../../data/work/users'
import { Button } from '../../ui/Button/Button'
import { Select } from '../../ui/Select/Select'
import styles from './BulkActionBar.module.css'

interface BulkActionBarProps {
  count: number
  onClear: () => void
  onAssign: (ownerId: string) => void
  onMove: (status: TaskStatus) => void
  onPriority: (priority: Priority) => void
  onDelete: () => void
  onExport: () => void
}

export function BulkActionBar({
  count,
  onClear,
  onAssign,
  onMove,
  onPriority,
  onDelete,
  onExport,
}: BulkActionBarProps) {
  if (count === 0) return null

  return (
    <div className={styles.bar} role="region" aria-label="Bulk actions">
      <span className={styles.count}>{count} selected</span>
      <Select
        aria-label="Assign owner"
        defaultValue=""
        onChange={(event) => {
          if (event.target.value) onAssign(event.target.value)
          event.target.value = ''
        }}
      >
        <option value="" disabled>
          Assign…
        </option>
        {WORK_USERS.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </Select>
      <Select
        aria-label="Move status"
        defaultValue=""
        onChange={(event) => {
          if (event.target.value) onMove(event.target.value as TaskStatus)
          event.target.value = ''
        }}
      >
        <option value="" disabled>
          Move…
        </option>
        <option value="backlog">Backlog</option>
        <option value="todo">To do</option>
        <option value="in_progress">In progress</option>
        <option value="review">Review</option>
        <option value="blocked">Blocked</option>
        <option value="completed">Completed</option>
      </Select>
      <Select
        aria-label="Change priority"
        defaultValue=""
        onChange={(event) => {
          if (event.target.value) onPriority(event.target.value as Priority)
          event.target.value = ''
        }}
      >
        <option value="" disabled>
          Priority…
        </option>
        <option value="urgent">Urgent</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </Select>
      <Button size="sm" variant="secondary" onClick={onExport}>
        Export
      </Button>
      <Button size="sm" variant="danger" onClick={onDelete}>
        Delete
      </Button>
      <Button size="sm" variant="ghost" onClick={onClear}>
        Clear
      </Button>
    </div>
  )
}
