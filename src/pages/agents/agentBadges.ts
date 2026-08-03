import type { BadgeVariant } from '../../components/ui/Badge/Badge'
import type { AgentHealth, QueueItemState, QueuePriority, WorkforceAgentStatus } from '../../types/autonomous'

export function agentStatusVariant(status: WorkforceAgentStatus): BadgeVariant {
  switch (status) {
    case 'running':
      return 'accent'
    case 'active':
      return 'success'
    case 'error':
      return 'error'
    default:
      return 'neutral'
  }
}

export function healthVariant(health: AgentHealth): BadgeVariant {
  switch (health) {
    case 'healthy':
      return 'success'
    case 'degraded':
      return 'warning'
    default:
      return 'error'
  }
}

export function confidenceVariant(confidence: number): BadgeVariant {
  if (confidence >= 85) return 'success'
  if (confidence >= 70) return 'accent'
  if (confidence >= 55) return 'warning'
  return 'error'
}

export function queueStateVariant(state: QueueItemState): BadgeVariant {
  switch (state) {
    case 'completed':
    case 'approved':
      return 'success'
    case 'running':
    case 'pending_approval':
      return 'accent'
    case 'failed':
      return 'error'
    case 'waiting':
      return 'warning'
    default:
      return 'neutral'
  }
}

export function priorityVariant(priority: QueuePriority): BadgeVariant {
  switch (priority) {
    case 'critical':
      return 'error'
    case 'high':
      return 'warning'
    case 'medium':
      return 'accent'
    default:
      return 'neutral'
  }
}
