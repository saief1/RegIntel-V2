import { useId, useMemo, useState, type FormEvent } from 'react'
import type { AiActionType, Priority } from '../../../types/work'
import { AI_ACTION_OPTIONS, defaultTitleForAction } from '../../../utils/aiWorkActions'
import { dueDateFromDays, estimateSmartDue } from '../../../utils/smartDueDates'
import { WORK_USERS } from '../../../data/work/users'
import { useWork } from '../../../hooks/useWork'
import { Button } from '../../ui/Button/Button'
import { Input } from '../../ui/Input/Input'
import { Modal } from '../../ui/Modal/Modal'
import { Select } from '../../ui/Select/Select'
import { Textarea } from '../../ui/Textarea/Textarea'
import { SmartEstimateBadge } from '../SmartEstimateBadge/SmartEstimateBadge'
import styles from './AiActionModal.module.css'

interface AiActionModalProps {
  open: boolean
  action: AiActionType | null
  sourceTitle?: string
  sourceDescription?: string
  linkedRegulation?: string
  onClose: () => void
  onCreated?: (taskId: string) => void
}

export function AiActionModal({
  open,
  action,
  sourceTitle,
  sourceDescription,
  linkedRegulation,
  onClose,
  onCreated,
}: AiActionModalProps) {
  const option = AI_ACTION_OPTIONS.find((item) => item.type === action)
  return (
    <Modal open={open && Boolean(action)} onClose={onClose} title={option?.label ?? 'Create work'} size="md">
      {open && action && (
        <AiActionForm
          action={action}
          sourceTitle={sourceTitle}
          sourceDescription={sourceDescription}
          linkedRegulation={linkedRegulation}
          onClose={onClose}
          onCreated={onCreated}
        />
      )}
    </Modal>
  )
}

function AiActionForm({
  action,
  sourceTitle,
  sourceDescription,
  linkedRegulation,
  onClose,
  onCreated,
}: Omit<AiActionModalProps, 'open'> & { action: AiActionType }) {
  const { createFromAiAction, currentUserId } = useWork()
  const formId = useId()
  const option = AI_ACTION_OPTIONS.find((item) => item.type === action)
  const [title, setTitle] = useState(defaultTitleForAction(action, sourceTitle))
  const [description, setDescription] = useState(sourceDescription ?? '')
  const [ownerId, setOwnerId] = useState(currentUserId)
  const [priority, setPriority] = useState<Priority>('high')
  const [regulation, setRegulation] = useState(linkedRegulation ?? '')

  const estimate = useMemo(
    () => estimateSmartDue(priority, option?.kind ?? 'task'),
    [option?.kind, priority],
  )

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!title.trim()) return
    const task = createFromAiAction({
      action,
      title: title.trim(),
      description: description.trim() || undefined,
      ownerId,
      priority,
      linkedRegulation: regulation.trim() || undefined,
    })
    onCreated?.(task.id)
    onClose()
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <SmartEstimateBadge estimate={estimate} />
      <p className={styles.hint}>Suggested due date: {dueDateFromDays(estimate.recommendedDays)}</p>

      <div className={styles.field}>
        <label htmlFor={`${formId}-title`}>Title</label>
        <Input id={`${formId}-title`} value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
      </div>
      <div className={styles.field}>
        <label htmlFor={`${formId}-desc`}>Description</label>
        <Textarea id={`${formId}-desc`} value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
      </div>
      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor={`${formId}-owner`}>Owner</label>
          <Select id={`${formId}-owner`} value={ownerId} onChange={(e) => setOwnerId(e.target.value)}>
            {WORK_USERS.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </Select>
        </div>
        <div className={styles.field}>
          <label htmlFor={`${formId}-priority`}>Priority</label>
          <Select id={`${formId}-priority`} value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </Select>
        </div>
      </div>
      <div className={styles.field}>
        <label htmlFor={`${formId}-reg`}>Linked regulation</label>
        <Input id={`${formId}-reg`} value={regulation} onChange={(e) => setRegulation(e.target.value)} />
      </div>
      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {option?.label ?? 'Create'}
        </Button>
      </div>
    </form>
  )
}
