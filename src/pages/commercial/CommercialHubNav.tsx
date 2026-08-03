import { Link } from 'react-router-dom'
import styles from './commercial.module.css'

const LINKS = [
  { to: '/settings/billing', label: 'Billing' },
  { to: '/customer', label: 'Customer Portal' },
  { to: '/partners', label: 'Partners' },
  { to: '/settings/usage', label: 'Usage' },
  { to: '/settings/licensing', label: 'Licensing' },
] as const

export function CommercialHubNav({ current }: { current?: string }) {
  return (
    <nav className={styles.hubLinks} aria-label="Commercial platform">
      {LINKS.filter((link) => link.to !== current).map((link) => (
        <Link key={link.to} className={styles.hubLink} to={link.to}>
          {link.label}
        </Link>
      ))}
    </nav>
  )
}
