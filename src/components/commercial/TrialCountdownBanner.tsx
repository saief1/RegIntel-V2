import { Link } from 'react-router-dom'
import { useCommercial } from '../../hooks/useCommercial'
import { Button } from '../ui/Button/Button'
import styles from '../../pages/commercial/commercial.module.css'

export function TrialCountdownBanner() {
  const { showTrialBanner, dismissTrialBanner, subscription, trialDaysLeft } = useCommercial()
  if (!showTrialBanner || subscription.status !== 'trial') return null

  return (
    <div className={styles.bannerWarning} role="status" aria-label="Trial countdown">
      <div>
        <strong>Trial ends in {trialDaysLeft} days</strong>
        <p style={{ margin: '4px 0 0', fontSize: 'var(--ri-font-size-body-sm)' }}>
          {subscription.planLabel} trial renews as paid on{' '}
          {subscription.trialEndsAt ? new Date(subscription.trialEndsAt).toLocaleDateString() : '—'}. Review plan
          comparison and convert when ready.
        </p>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Link className={styles.hubLink} to="/settings/billing">
          Review billing
        </Link>
        <Button size="sm" variant="ghost" onClick={dismissTrialBanner}>
          Dismiss
        </Button>
      </div>
    </div>
  )
}
