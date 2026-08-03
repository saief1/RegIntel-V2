import { Link } from 'react-router-dom'
import styles from './adoption.module.css'

const LINKS = [
  { to: '/onboarding', label: 'Onboarding' },
  { to: '/help', label: 'Learning Center' },
  { to: '/customer-success', label: 'Customer Success' },
  { to: '/settings/tours', label: 'Product Tours' },
  { to: '/community', label: 'Community' },
] as const

export function AdoptionHubNav({ current }: { current?: string }) {
  return (
    <nav className={styles.hubLinks} aria-label="Customer experience">
      {LINKS.filter((link) => link.to !== current).map((link) => (
        <Link key={link.to} className={styles.hubLink} to={link.to}>
          {link.label}
        </Link>
      ))}
    </nav>
  )
}
