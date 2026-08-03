import { Link } from 'react-router-dom'
import styles from './analytics.module.css'

const LINKS = [
  { to: '/reports', label: 'Executive Dashboard' },
  { to: '/reports/command', label: 'Command Center' },
  { to: '/reports/analytics', label: 'Analytics Center' },
  { to: '/reports/kpis', label: 'KPI Builder' },
  { to: '/reports/predictive', label: 'Predictive' },
  { to: '/reports/board', label: 'Board Studio' },
  { to: '/reports/benchmark', label: 'Benchmarking' },
] as const

export function ReportsHubNav({ current }: { current?: string }) {
  return (
    <nav className={styles.hubLinks} aria-label="Enterprise intelligence areas">
      {LINKS.filter((link) => link.to !== current).map((link) => (
        <Link key={link.to} className={styles.hubLink} to={link.to}>
          {link.label}
        </Link>
      ))}
    </nav>
  )
}
