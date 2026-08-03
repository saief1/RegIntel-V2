import { useOperations } from '../../hooks/useOperations'
import { Button } from '../ui/Button/Button'
import styles from '../../pages/operations/operations.module.css'

export function MaintenanceBanner() {
  const { maintenanceMode, announcements, dismissAnnouncement, toggleMaintenanceMode } = useOperations()

  if (!maintenanceMode && announcements.length === 0) return null

  return (
    <div
      className={styles.page}
      style={{ gap: 'var(--ri-space-2)', padding: 'var(--ri-content-padding)', paddingBottom: 0 }}
      aria-label="System announcements"
    >
      {maintenanceMode && (
        <div className={styles.bannerWarning} role="status">
          <div>
            <strong>Maintenance mode</strong>
            <p style={{ margin: '4px 0 0', fontSize: 'var(--ri-font-size-body-sm)' }}>
              Non-critical writes are paused. Background retries continue for failed jobs.
            </p>
          </div>
          <Button size="sm" variant="secondary" onClick={toggleMaintenanceMode}>
            Exit maintenance
          </Button>
        </div>
      )}
      {announcements.map((item) => (
        <div
          key={item.id}
          className={
            item.tone === 'critical'
              ? styles.bannerCritical
              : item.tone === 'warning'
                ? styles.bannerWarning
                : styles.banner
          }
          role="status"
        >
          <div>
            <strong>{item.title}</strong>
            <p style={{ margin: '4px 0 0', fontSize: 'var(--ri-font-size-body-sm)' }}>{item.body}</p>
          </div>
          {item.dismissible && (
            <Button size="sm" variant="ghost" onClick={() => dismissAnnouncement(item.id)}>
              Dismiss
            </Button>
          )}
        </div>
      ))}
    </div>
  )
}
