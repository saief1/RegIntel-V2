import type { BadgeVariant } from '../../components/ui/Badge/Badge'
import type { IntegrationHealth, IntegrationStatus, SyncQueueItem } from '../../types/connected'

export function statusVariant(status: IntegrationStatus): BadgeVariant {
  switch (status) {
    case 'connected':
      return 'success'
    case 'syncing':
      return 'accent'
    case 'degraded':
      return 'warning'
    case 'error':
      return 'error'
    default:
      return 'neutral'
  }
}

export function healthVariant(health: IntegrationHealth): BadgeVariant {
  switch (health) {
    case 'healthy':
      return 'success'
    case 'degraded':
      return 'warning'
    case 'unhealthy':
      return 'error'
    default:
      return 'neutral'
  }
}

export function queueVariant(status: SyncQueueItem['status']): BadgeVariant {
  switch (status) {
    case 'completed':
      return 'success'
    case 'running':
    case 'retrying':
      return 'accent'
    case 'failed':
      return 'error'
    default:
      return 'neutral'
  }
}

export function impactVariant(impact: 'low' | 'medium' | 'high' | 'critical'): BadgeVariant {
  switch (impact) {
    case 'critical':
    case 'high':
      return impact === 'critical' ? 'error' : 'warning'
    case 'medium':
      return 'accent'
    default:
      return 'neutral'
  }
}
