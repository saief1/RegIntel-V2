import { Badge, type BadgeVariant } from '../../ui/Badge/Badge'
import type { RiskLevel } from '../../../types/work'

const LABELS: Record<RiskLevel, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
}

const VARIANTS: Record<RiskLevel, BadgeVariant> = {
  low: 'success',
  medium: 'warning',
  high: 'error',
  critical: 'error',
}

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  return <Badge variant={VARIANTS[risk]}>{LABELS[risk]} risk</Badge>
}
