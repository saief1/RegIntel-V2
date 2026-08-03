const ABSOLUTE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

/** Formats an ISO date string as "Jan 15, 2026". */
export function formatDate(iso: string): string {
  return ABSOLUTE_FORMATTER.format(new Date(iso))
}

const RELATIVE_FORMATTER = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' })
const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const WEEK = 7 * DAY
const MONTH = 30 * DAY

/** Formats an ISO date string relative to now, e.g. "3 days ago" or "in 2 months". */
export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const diffMs = new Date(iso).getTime() - now.getTime()
  const absMs = Math.abs(diffMs)

  if (absMs < MINUTE) return RELATIVE_FORMATTER.format(Math.round(diffMs / 1000), 'second')
  if (absMs < HOUR) return RELATIVE_FORMATTER.format(Math.round(diffMs / MINUTE), 'minute')
  if (absMs < DAY) return RELATIVE_FORMATTER.format(Math.round(diffMs / HOUR), 'hour')
  if (absMs < WEEK) return RELATIVE_FORMATTER.format(Math.round(diffMs / DAY), 'day')
  if (absMs < MONTH) return RELATIVE_FORMATTER.format(Math.round(diffMs / WEEK), 'week')
  return RELATIVE_FORMATTER.format(Math.round(diffMs / MONTH), 'month')
}
