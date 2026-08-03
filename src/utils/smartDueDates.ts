import type { Priority, SmartEstimate, WorkItemKind } from '../types/work'

const PRIORITY_DAYS: Record<Priority, number> = {
  urgent: 3,
  high: 7,
  medium: 14,
  low: 21,
}

const PRIORITY_HOURS: Record<Priority, number> = {
  urgent: 6,
  high: 12,
  medium: 16,
  low: 24,
}

const KIND_IMPACT: Record<WorkItemKind, SmartEstimate['businessImpact']> = {
  task: 'Medium',
  project: 'High',
  policy_update: 'High',
  risk_review: 'Critical',
  evidence_request: 'Medium',
  board_item: 'High',
}

/** Local heuristic for AI-suggested due dates and effort — no backend. */
export function estimateSmartDue(
  priority: Priority = 'medium',
  kind: WorkItemKind = 'task',
  override?: Partial<SmartEstimate>,
): SmartEstimate {
  const recommendedDays = override?.recommendedDays ?? PRIORITY_DAYS[priority]
  const estimatedHours = override?.estimatedHours ?? PRIORITY_HOURS[priority]
  const businessImpact = override?.businessImpact ?? KIND_IMPACT[kind]
  return {
    recommendedDays,
    estimatedHours,
    businessImpact,
    summary:
      override?.summary ??
      `${businessImpact} risk · recommended ${recommendedDays} days · estimated ${estimatedHours} hours`,
  }
}

/** Returns an ISO date (YYYY-MM-DD) N days from today (UTC). */
export function dueDateFromDays(days: number, from = new Date()): string {
  const date = new Date(from)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export function isDueToday(isoDate: string, now = new Date()): boolean {
  return isoDate.slice(0, 10) === now.toISOString().slice(0, 10)
}

export function isOverdue(isoDate: string, status: string, now = new Date()): boolean {
  if (status === 'completed' || status === 'done') return false
  return isoDate.slice(0, 10) < now.toISOString().slice(0, 10)
}

export function isDueThisWeek(isoDate: string, now = new Date()): boolean {
  const due = new Date(`${isoDate.slice(0, 10)}T00:00:00.000Z`)
  const start = new Date(now)
  start.setUTCHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + 7)
  return due >= start && due < end
}

export function checklistProgress(items: { done: boolean }[]): number {
  if (items.length === 0) return 0
  const done = items.filter((item) => item.done).length
  return Math.round((done / items.length) * 100)
}
