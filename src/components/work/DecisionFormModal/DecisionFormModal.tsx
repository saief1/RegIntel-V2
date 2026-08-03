import { useId, useState, type FormEvent } from 'react'
import type { DecisionOutcome } from '../../../types/work'
import { Button } from '../../ui/Button/Button'
import { Modal } from '../../ui/Modal/Modal'
import { Select } from '../../ui/Select/Select'
import { Textarea } from '../../ui/Textarea/Textarea'
import styles from './DecisionFormModal.module.css'

interface DecisionFormModalProps {
  open: boolean
  onSubmit: (values: { outcome: DecisionOutcome; reason: string }) => void
  onCancel: () => void
}

export function DecisionFormModal({ open, onSubmit, onCancel }: DecisionFormModalProps) {
  return (
    <Modal open={open} onClose={onCancel} title="Record decision" size="sm">
      {open && <DecisionFormBody onSubmit={onSubmit} onCancel={onCancel} />}
    </Modal>
  )
}

function DecisionFormBody({
  onSubmit,
  onCancel,
}: {
  onSubmit: (values: { outcome: DecisionOutcome; reason: string }) => void
  onCancel: () => void
}) {
  const [outcome, setOutcome] = useState<DecisionOutcome>('defer')
  const [reason, setReason] = useState('')
  const reasonId = useId()

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!reason.trim()) return
    onSubmit({ outcome, reason: reason.trim() })
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label htmlFor={`${reasonId}-outcome`}>Outcome</label>
        <Select id={`${reasonId}-outcome`} value={outcome} onChange={(e) => setOutcome(e.target.value as DecisionOutcome)}>
          <option value="approve">Approve</option>
          <option value="reject">Reject</option>
          <option value="escalate">Escalate</option>
          <option value="defer">Defer</option>
          <option value="remediate">Remediate</option>
        </Select>
      </div>
      <div className={styles.field}>
        <label htmlFor={reasonId}>Reason</label>
        <Textarea id={reasonId} value={reason} onChange={(e) => setReason(e.target.value)} rows={4} required autoFocus />
      </div>
      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={!reason.trim()}>
          Record decision
        </Button>
      </div>
    </form>
  )
}
