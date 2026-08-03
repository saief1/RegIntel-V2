import { useAdoption } from '../../hooks/useAdoption'
import { Badge } from '../ui/Badge/Badge'
import { Button } from '../ui/Button/Button'
import { Modal } from '../ui/Modal/Modal'
import styles from './WhatsNewModal.module.css'

/** "What's New" modal after releases (mock first-run / post-release). */
export function WhatsNewModal() {
  const { showWhatsNew, dismissWhatsNew, whatsNew } = useAdoption()

  return (
    <Modal
      open={showWhatsNew}
      onClose={dismissWhatsNew}
      title="What's New"
      size="md"
      footer={
        <Button size="sm" variant="primary" onClick={dismissWhatsNew}>
          Got it
        </Button>
      }
    >
      <p className={styles.lead}>Feature discovery after the latest releases.</p>
      <ul className={styles.list}>
        {whatsNew.map((entry) => (
          <li key={entry.id} className={styles.item}>
            <Badge variant="accent">{entry.version}</Badge>
            <strong className={styles.itemTitle}>{entry.title}</strong>
            <span className={styles.itemSummary}>{entry.summary}</span>
          </li>
        ))}
      </ul>
    </Modal>
  )
}
