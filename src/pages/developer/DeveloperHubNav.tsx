import { Link } from 'react-router-dom'
import styles from './developer.module.css'

const LINKS = [
  { to: '/developer', label: 'Developer Portal' },
  { to: '/developer/api', label: 'API Explorer' },
  { to: '/developer/apps', label: 'API Keys & Apps' },
  { to: '/developer/webhooks', label: 'Webhooks' },
  { to: '/developer/sdk', label: 'SDKs & Resources' },
  { to: '/settings/api', label: 'Legacy API Platform' },
] as const

export function DeveloperHubNav({ current }: { current?: string }) {
  return (
    <nav className={styles.hubLinks} aria-label="Developer platform">
      {LINKS.filter((link) => link.to !== current).map((link) => (
        <Link key={link.to} className={styles.hubLink} to={link.to}>
          {link.label}
        </Link>
      ))}
    </nav>
  )
}
