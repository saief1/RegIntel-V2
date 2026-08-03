import { Link } from 'react-router-dom'
import styles from './operations.module.css'

const LINKS = [
  { to: '/operations', label: 'Operations Center' },
  { to: '/operations/incidents', label: 'Incidents' },
  { to: '/operations/backups', label: 'Backups & DR' },
  { to: '/operations/deployments', label: 'Deployments' },
  { to: '/operations/observability', label: 'Observability' },
  { to: '/system', label: 'System Health' },
] as const

export function ProdOpsHubNav({ current }: { current?: string }) {
  return (
    <nav className={styles.hubLinks} aria-label="Production operations">
      {LINKS.filter((link) => link.to !== current).map((link) => (
        <Link key={link.to} className={styles.hubLink} to={link.to}>
          {link.label}
        </Link>
      ))}
    </nav>
  )
}
