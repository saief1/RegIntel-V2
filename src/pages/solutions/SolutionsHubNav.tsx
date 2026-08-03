import { Link } from 'react-router-dom'
import styles from './solutions.module.css'

const LINKS = [
  { to: '/solutions', label: 'Solution Marketplace' },
  { to: '/solutions/wealth', label: 'Wealth' },
  { to: '/solutions/banking', label: 'Banking' },
  { to: '/solutions/insurance', label: 'Insurance' },
  { to: '/solutions/grc', label: 'Corporate GRC' },
] as const

export function SolutionsHubNav({ current }: { current?: string }) {
  return (
    <nav className={styles.hubLinks} aria-label="Industry solutions">
      {LINKS.filter((link) => link.to !== current).map((link) => (
        <Link key={link.to} className={styles.hubLink} to={link.to}>
          {link.label}
        </Link>
      ))}
    </nav>
  )
}
