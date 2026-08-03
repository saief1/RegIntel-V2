import { Badge } from '../../ui/Badge/Badge'

export function ConfidenceBadge({ value }: { value: number }) {
  const percent = Math.round(value * 100)
  const variant = percent >= 85 ? 'success' : percent >= 70 ? 'accent' : 'warning'
  return <Badge variant={variant}>{percent}% confidence</Badge>
}
