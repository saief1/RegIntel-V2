import { Link } from 'react-router-dom'
import styles from './operations.module.css'

const LINKS = [
  { to: '/operations', label: 'Operations Center' },
  { to: '/settings/data', label: 'Data Management' },
  { to: '/settings/security', label: 'Security Center' },
  { to: '/audit', label: 'Audit Center' },
  { to: '/automation', label: 'Automation Studio' },
  { to: '/automation/canvas', label: 'Workflow Canvas' },
  { to: '/integrations/marketplace', label: 'Marketplace' },
  { to: '/system', label: 'System Health' },
  { to: '/settings/admin', label: 'Admin Console' },
] as const

export function OperationsHubNav({ current }: { current?: string }) {
  return (
    <nav className={styles.hubLinks} aria-label="Enterprise operations areas">
      {LINKS.filter((link) => link.to !== current).map((link) => (
        <Link key={link.to} className={styles.hubLink} to={link.to}>
          {link.label}
        </Link>
      ))}
    </nav>
  )
}
