import { useState } from 'react'
import type { TaskStatus, WorkTask } from '../../../types/work'
import { ActionTaskCard } from '../ActionTaskCard/ActionTaskCard'
import styles from './KanbanBoard.module.css'

const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: 'backlog', label: 'Backlog' },
  { id: 'todo', label: 'To Do' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'review', label: 'Review' },
  { id: 'blocked', label: 'Blocked' },
  { id: 'completed', label: 'Completed' },
]

interface KanbanBoardProps {
  tasks: WorkTask[]
  getOwnerName: (id: string) => string
  selectedIds: Set<string>
  onToggleSelect: (id: string) => void
  onMove: (taskId: string, status: TaskStatus) => void
}

export function KanbanBoard({ tasks, getOwnerName, selectedIds, onToggleSelect, onMove }: KanbanBoardProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null)

  return (
    <div className={styles.board} role="list" aria-label="Kanban board">
      {COLUMNS.map((column) => {
        const columnTasks = tasks.filter((task) => task.status === column.id)
        return (
          <section
            key={column.id}
            className={styles.column}
            aria-label={column.label}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (draggingId) onMove(draggingId, column.id)
              setDraggingId(null)
            }}
          >
            <header className={styles.columnHeader}>
              <h3>{column.label}</h3>
              <span>{columnTasks.length}</span>
            </header>
            <div className={styles.cards}>
              {columnTasks.map((task) => (
                <ActionTaskCard
                  key={task.id}
                  task={task}
                  ownerName={getOwnerName(task.ownerId)}
                  selected={selectedIds.has(task.id)}
                  onToggleSelect={onToggleSelect}
                  draggable
                  onDragStart={setDraggingId}
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
