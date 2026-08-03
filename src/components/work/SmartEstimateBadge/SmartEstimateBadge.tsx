import type { SmartEstimate } from '../../../types/work'
import styles from './SmartEstimateBadge.module.css'

export function SmartEstimateBadge({ estimate }: { estimate: SmartEstimate }) {
  return (
    <div className={styles.badge} data-impact={estimate.businessImpact.toLowerCase()}>
      <span className={styles.impact}>{estimate.businessImpact} risk</span>
      <span className={styles.meta}>
        Recommended {estimate.recommendedDays} days · Estimated {estimate.estimatedHours} hours
      </span>
    </div>
  )
}
