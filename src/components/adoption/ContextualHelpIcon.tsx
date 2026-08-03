import { Link } from 'react-router-dom'
import { HelpCircle } from 'lucide-react'
import styles from '../../pages/adoption/adoption.module.css'

export function ContextualHelpIcon({ label, to = '/help' }: { label: string; to?: string }) {
  return (
    <Link className={styles.helpIcon} to={to} aria-label={`Help: ${label}`} title={label}>
      <HelpCircle size={16} />
    </Link>
  )
}
