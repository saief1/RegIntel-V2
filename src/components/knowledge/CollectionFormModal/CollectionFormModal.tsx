import { useId, useState, type FormEvent } from 'react'
import { Button } from '../../ui/Button/Button'
import { Input } from '../../ui/Input/Input'
import { Modal } from '../../ui/Modal/Modal'
import { Textarea } from '../../ui/Textarea/Textarea'
import styles from './CollectionFormModal.module.css'

interface CollectionFormModalProps {
  open: boolean
  mode: 'create' | 'rename'
  initialName?: string
  initialDescription?: string
  onSubmit: (name: string, description: string) => void
  onCancel: () => void
}

/** Create/rename form for a collection — name + description, shared by Knowledge Home and the Collections page. */
export function CollectionFormModal({
  open,
  mode,
  initialName = '',
  initialDescription = '',
  onSubmit,
  onCancel,
}: CollectionFormModalProps) {
  return (
    <Modal open={open} onClose={onCancel} title={mode === 'create' ? 'New collection' : 'Rename collection'} size="sm">
      {/* Remount on open so initial values never need an effect-based reset. */}
      {open && (
        <CollectionFormBody
          key={`${mode}-${initialName}-${initialDescription}`}
          mode={mode}
          initialName={initialName}
          initialDescription={initialDescription}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      )}
    </Modal>
  )
}

function CollectionFormBody({
  mode,
  initialName,
  initialDescription,
  onSubmit,
  onCancel,
}: {
  mode: 'create' | 'rename'
  initialName: string
  initialDescription: string
  onSubmit: (name: string, description: string) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(initialName)
  const [description, setDescription] = useState(initialDescription)
  const nameFieldId = useId()
  const descriptionFieldId = useId()

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onSubmit(trimmed, description.trim())
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label htmlFor={nameFieldId} className={styles.label}>
          Name
        </label>
        <Input
          id={nameFieldId}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Q4 Regulatory Review"
          autoFocus
          required
        />
      </div>
      <div className={styles.field}>
        <label htmlFor={descriptionFieldId} className={styles.label}>
          Description <span className={styles.optional}>(optional)</span>
        </label>
        <Textarea
          id={descriptionFieldId}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="What is this collection for?"
          rows={3}
        />
      </div>
      <div className={styles.actions}>
        <Button variant="secondary" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={name.trim().length === 0}>
          {mode === 'create' ? 'Create collection' : 'Save changes'}
        </Button>
      </div>
    </form>
  )
}
