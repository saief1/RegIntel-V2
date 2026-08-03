import { useId, useState, type FormEvent } from 'react'
import type { Priority, TaskStatus, WorkTask } from '../../../types/work'
import { WORK_USERS } from '../../../data/work/users'
import { Button } from '../../ui/Button/Button'
import { Input } from '../../ui/Input/Input'
import { Modal } from '../../ui/Modal/Modal'
import { Select } from '../../ui/Select/Select'
import { Textarea } from '../../ui/Textarea/Textarea'
import styles from './TaskFormModal.module.css'

interface TaskFormModalProps {
  open: boolean
  mode: 'create' | 'edit'
  initial?: Partial<WorkTask>
  onSubmit: (values: {
    title: string
    description: string
    status: TaskStatus
    priority: Priority
    ownerId: string
    dueDate: string
  }) => void
  onCancel: () => void
}

export function TaskFormModal({ open, mode, initial, onSubmit, onCancel }: TaskFormModalProps) {
  return (
    <Modal open={open} onClose={onCancel} title={mode === 'create' ? 'New task' : 'Edit task'} size="md">
      {open && (
        <TaskFormBody
          key={`${mode}-${initial?.id ?? 'new'}`}
          mode={mode}
          initial={initial}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      )}
    </Modal>
  )
}

function TaskFormBody({
  mode,
  initial,
  onSubmit,
  onCancel,
}: Omit<TaskFormModalProps, 'open'>) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [status, setStatus] = useState<TaskStatus>(initial?.status ?? 'todo')
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? 'medium')
  const [ownerId, setOwnerId] = useState(initial?.ownerId ?? WORK_USERS[0].id)
  const [dueDate, setDueDate] = useState(initial?.dueDate?.slice(0, 10) ?? new Date().toISOString().slice(0, 10))
  const titleId = useId()

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!title.trim()) return
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      ownerId,
      dueDate,
    })
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label htmlFor={titleId}>Title</label>
        <Input id={titleId} value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
      </div>
      <div className={styles.field}>
        <label htmlFor={`${titleId}-desc`}>Description</label>
        <Textarea id={`${titleId}-desc`} value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
      </div>
      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor={`${titleId}-status`}>Status</label>
          <Select id={`${titleId}-status`} value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}>
            <option value="backlog">Backlog</option>
            <option value="todo">To do</option>
            <option value="in_progress">In progress</option>
            <option value="review">Review</option>
            <option value="blocked">Blocked</option>
            <option value="completed">Completed</option>
          </Select>
        </div>
        <div className={styles.field}>
          <label htmlFor={`${titleId}-priority`}>Priority</label>
          <Select id={`${titleId}-priority`} value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </Select>
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor={`${titleId}-owner`}>Owner</label>
          <Select id={`${titleId}-owner`} value={ownerId} onChange={(e) => setOwnerId(e.target.value)}>
            {WORK_USERS.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </Select>
        </div>
        <div className={styles.field}>
          <label htmlFor={`${titleId}-due`}>Due date</label>
          <Input id={`${titleId}-due`} type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
        </div>
      </div>
      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={!title.trim()}>
          {mode === 'create' ? 'Create task' : 'Save changes'}
        </Button>
      </div>
    </form>
  )
}
