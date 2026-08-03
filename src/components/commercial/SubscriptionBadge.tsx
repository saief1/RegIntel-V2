import { Link } from 'react-router-dom'
import { useCommercial } from '../../hooks/useCommercial'
import styles from '../../pages/commercial/commercial.module.css'

/** Compact subscription indicator for the shell header (hidden on narrow screens). */
export function SubscriptionBadge() {
  const { subscription, trialDaysLeft } = useCommercial()
  const label =
    subscription.status === 'trial'
      ? `${subscription.planLabel} · ${trialDaysLeft}d trial`
      : subscription.planLabel

  return (
    <Link className={styles.subBadge} to="/settings/billing" aria-label={`Subscription: ${label}`}>
      {label}
    </Link>
  )
}
