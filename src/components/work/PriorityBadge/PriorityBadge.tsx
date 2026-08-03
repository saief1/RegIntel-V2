import { Badge, type BadgeVariant } from '../../ui/Badge/Badge'
import type { Priority } from '../../../types/work'

const LABELS: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
}

const VARIANTS: Record<Priority, BadgeVariant> = {
  low: 'neutral',
  medium: 'accent',
  high: 'warning',
  urgent: 'error',
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <Badge variant={VARIANTS[priority]}>{LABELS[priority]}</Badge>
}
