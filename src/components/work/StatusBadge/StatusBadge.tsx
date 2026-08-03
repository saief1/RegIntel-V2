import { Badge, type BadgeVariant } from '../../ui/Badge/Badge'
import type { CaseStatus, EvidenceStatus, TaskStatus } from '../../../types/work'

type StatusBadgeValue = CaseStatus | TaskStatus | EvidenceStatus

const LABELS: Record<StatusBadgeValue, string> = {
  open: 'Open',
  in_review: 'In review',
  escalated: 'Escalated',
  completed: 'Completed',
  closed: 'Closed',
  todo: 'To do',
  in_progress: 'In progress',
  blocked: 'Blocked',
  done: 'Done',
  pending: 'Pending',
  verified: 'Verified',
  rejected: 'Rejected',
}

const VARIANTS: Record<StatusBadgeValue, BadgeVariant> = {
  open: 'accent',
  in_review: 'warning',
  escalated: 'error',
  completed: 'success',
  closed: 'neutral',
  todo: 'neutral',
  in_progress: 'accent',
  blocked: 'error',
  done: 'success',
  pending: 'warning',
  verified: 'success',
  rejected: 'error',
}

export function StatusBadge({ status }: { status: StatusBadgeValue }) {
  return <Badge variant={VARIANTS[status]}>{LABELS[status]}</Badge>
}
