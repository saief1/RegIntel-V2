import { Link } from 'react-router-dom'
import styles from './ecosystem.module.css'

const LINKS = [
  { to: '/integrations', label: 'Integration Hub' },
  { to: '/integrations/marketplace', label: 'Marketplace' },
  { to: '/integrations/builder', label: 'Integration Builder' },
  { to: '/automation', label: 'Automation Studio' },
  { to: '/automation/canvas', label: 'Workflow Canvas' },
  { to: '/data/lineage', label: 'Data Lineage' },
  { to: '/reports/digital-twin', label: 'Digital Twin' },
] as const

export function EcosystemHubNav({ current }: { current?: string }) {
  return (
    <nav className={styles.hubLinks} aria-label="Connected enterprise areas">
      {LINKS.filter((link) => link.to !== current).map((link) => (
        <Link key={link.to} className={styles.hubLink} to={link.to}>
          {link.label}
        </Link>
      ))}
    </nav>
  )
}
