import { Link } from 'react-router-dom'
import { useCommercial } from '../../hooks/useCommercial'
import { Button } from '../ui/Button/Button'
import styles from '../../pages/commercial/commercial.module.css'

export function UsageWarningBanner() {
  const { showUsageWarning, dismissUsageWarning, metersNearLimit, billingNotifications, dismissBillingNotification } =
    useCommercial()

  if (!showUsageWarning && billingNotifications.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }} aria-label="Commercial alerts">
      {showUsageWarning && metersNearLimit.length > 0 && (
        <div className={styles.bannerWarning} role="status">
          <div>
            <strong>Usage nearing plan limits</strong>
            <p style={{ margin: '4px 0 0', fontSize: 'var(--ri-font-size-body-sm)' }}>
              {metersNearLimit.map((meter) => meter.label).join(', ')} — review consumption or upgrade.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link className={styles.hubLink} to="/settings/usage">
              View usage
            </Link>
            <Button size="sm" variant="ghost" onClick={dismissUsageWarning}>
              Dismiss
            </Button>
          </div>
        </div>
      )}
      {billingNotifications.map((item) => (
        <div
          key={item.id}
          className={item.tone === 'info' ? styles.bannerRow : styles.bannerWarning}
          role="status"
        >
          <div>
            <strong>{item.title}</strong>
            <p style={{ margin: '4px 0 0', fontSize: 'var(--ri-font-size-body-sm)' }}>{item.body}</p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {item.href && (
              <Link className={styles.hubLink} to={item.href}>
                Open
              </Link>
            )}
            {item.dismissible && (
              <Button size="sm" variant="ghost" onClick={() => dismissBillingNotification(item.id)}>
                Dismiss
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
