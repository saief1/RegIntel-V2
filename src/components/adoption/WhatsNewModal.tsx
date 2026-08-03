import { useAdoption } from '../../hooks/useAdoption'
import { Badge } from '../ui/Badge/Badge'
import { Button } from '../ui/Button/Button'
import styles from '../../pages/adoption/adoption.module.css'

/** "What's New" modal after releases (mock first-run / post-release). */
export function WhatsNewModal() {
  const { showWhatsNew, dismissWhatsNew, whatsNew } = useAdoption()
  if (!showWhatsNew) return null

  return (
    <div className={styles.modalBackdrop} role="presentation">
      <div
        className={styles.modalCard}
        role="dialog"
        aria-modal="true"
        aria-labelledby="whats-new-title"
      >
        <header style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
          <div>
            <h2 id="whats-new-title">What&apos;s New</h2>
            <p style={{ margin: '4px 0 0', color: 'var(--ri-color-text-muted)' }}>
              Feature discovery after the latest releases.
            </p>
          </div>
          <Button size="sm" variant="primary" onClick={dismissWhatsNew}>
            Got it
          </Button>
        </header>
        <ul style={{ listStyle: 'none', margin: '16px 0 0', padding: 0, display: 'grid', gap: 12 }}>
          {whatsNew.map((entry) => (
            <li key={entry.id} style={{ borderTop: '1px solid var(--ri-color-border)', paddingTop: 12 }}>
              <Badge variant="accent">{entry.version}</Badge>
              <strong style={{ display: 'block', marginTop: 6 }}>{entry.title}</strong>
              <span style={{ color: 'var(--ri-color-text-muted)', fontSize: 'var(--ri-font-size-body-sm)' }}>
                {entry.summary}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
