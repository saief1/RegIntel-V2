import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateImplementationTasks } from '../../../utils/aiWorkActions'
import { useWork } from '../../../hooks/useWork'
import { Button } from '../../ui/Button/Button'
import { Modal } from '../../ui/Modal/Modal'
import { SmartEstimateBadge } from '../SmartEstimateBadge/SmartEstimateBadge'
import styles from './AiTaskGeneratorModal.module.css'

interface AiTaskGeneratorModalProps {
  open: boolean
  prompt: string
  onClose: () => void
}

export function AiTaskGeneratorModal({ open, prompt, onClose }: AiTaskGeneratorModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Implementation Tasks" size="md">
      {open && <AiTaskGeneratorBody key={prompt} prompt={prompt} onClose={onClose} />}
    </Modal>
  )
}

function AiTaskGeneratorBody({ prompt, onClose }: { prompt: string; onClose: () => void }) {
  const navigate = useNavigate()
  const { createTasksFromLabels } = useWork()
  const seed = useMemo(() => generateImplementationTasks(prompt), [prompt])
  const [selected, setSelected] = useState<Record<string, boolean>>(() => {
    const next: Record<string, boolean> = {}
    for (const item of seed.items) next[item] = true
    return next
  })

  const selectedLabels = seed.items.filter((item) => selected[item])

  function toggle(label: string) {
    setSelected((current) => ({ ...current, [label]: !current[label] }))
  }

  function selectAll(value: boolean) {
    const next: Record<string, boolean> = {}
    for (const item of seed.items) next[item] = value
    setSelected(next)
  }

  function createSelected() {
    const created = createTasksFromLabels(selectedLabels, {
      linkedRegulation: seed.linkedRegulation,
      estimate: seed.estimate,
      description: `From AI analysis: ${seed.title}`,
      aiGenerated: true,
    })
    onClose()
    if (created[0]) navigate(`/work/tasks/${created[0].id}`)
    else navigate('/work')
  }

  return (
    <div className={styles.body}>
      <p className={styles.subtitle}>{seed.title}</p>
      {seed.estimate && <SmartEstimateBadge estimate={seed.estimate} />}
      <div className={styles.toolbar}>
        <Button size="sm" variant="ghost" onClick={() => selectAll(true)}>
          Select all
        </Button>
        <Button size="sm" variant="ghost" onClick={() => selectAll(false)}>
          Deselect
        </Button>
      </div>
      <ul className={styles.list}>
        {seed.items.map((item) => (
          <li key={item}>
            <label className={styles.item}>
              <input type="checkbox" checked={Boolean(selected[item])} onChange={() => toggle(item)} />
              <span>{item}</span>
            </label>
          </li>
        ))}
      </ul>
      <div className={styles.actions}>
        <Button variant="secondary" onClick={onClose}>
          Dismiss
        </Button>
        <Button variant="primary" onClick={createSelected} disabled={selectedLabels.length === 0}>
          Create {selectedLabels.length} tasks
        </Button>
      </div>
    </div>
  )
}
