import { Badge, type BadgeVariant } from '../../ui/Badge/Badge'
import type { InvestigationStatus, RegulatoryChangeStatus } from '../../../types/investigations'

const INV_LABELS: Record<InvestigationStatus, string> = {
  open: 'Open',
  in_progress: 'In progress',
  pending_review: 'Pending review',
  escalated: 'Escalated',
  closed: 'Closed',
}

const INV_VARIANTS: Record<InvestigationStatus, BadgeVariant> = {
  open: 'accent',
  in_progress: 'warning',
  pending_review: 'warning',
  escalated: 'error',
  closed: 'neutral',
}

const CHANGE_LABELS: Record<RegulatoryChangeStatus, string> = {
  new: 'New',
  pending_review: 'Pending review',
  assessing: 'Assessing',
  remediating: 'Remediating',
  completed: 'Completed',
  deferred: 'Deferred',
}

const CHANGE_VARIANTS: Record<RegulatoryChangeStatus, BadgeVariant> = {
  new: 'accent',
  pending_review: 'warning',
  assessing: 'warning',
  remediating: 'accent',
  completed: 'success',
  deferred: 'neutral',
}

export function InvestigationStatusBadge({ status }: { status: InvestigationStatus }) {
  return <Badge variant={INV_VARIANTS[status]}>{INV_LABELS[status]}</Badge>
}

export function RegulatoryChangeStatusBadge({ status }: { status: RegulatoryChangeStatus }) {
  return <Badge variant={CHANGE_VARIANTS[status]}>{CHANGE_LABELS[status]}</Badge>
}
