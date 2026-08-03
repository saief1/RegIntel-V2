import { HelpCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Dropdown } from '../../ui/Dropdown/Dropdown'
import { IconButton } from '../../ui/IconButton/IconButton'
import styles from './HeaderMenu.module.css'

const SHORTCUTS: Array<{ keys: string; label: string }> = [
  { keys: '⌘K', label: 'Open global search' },
  { keys: '⌘/', label: 'Focus AI input' },
  { keys: '⌘S', label: 'Save current search' },
  { keys: '⌘\\', label: 'Toggle sidebar' },
  { keys: 'Esc', label: 'Close panels and menus' },
]

const HELP_LINKS = [
  { to: '/help', label: 'Learning Center' },
  { to: '/onboarding', label: 'Guided Onboarding' },
  { to: '/customer-success', label: 'Customer Success' },
  { to: '/settings/tours', label: 'Product Tours' },
  { to: '/community', label: 'Community & Feedback' },
  { to: '/developer', label: 'Developer Portal' },
] as const

export function HelpMenu() {
  return (
    <Dropdown
      align="end"
      width={300}
      trigger={
        <IconButton label="Help">
          <HelpCircle size={18} />
        </IconButton>
      }
    >
      <div className={styles.panel}>
        <p className={styles.title}>Help & learning</p>
        <ul className={styles.shortcutList}>
          {HELP_LINKS.map((link) => (
            <li key={link.to} className={styles.shortcutRow}>
              <Link to={link.to}>{link.label}</Link>
            </li>
          ))}
        </ul>
        <p className={styles.title}>Keyboard shortcuts</p>
        <ul className={styles.shortcutList}>
          {SHORTCUTS.map((shortcut) => (
            <li key={shortcut.keys} className={styles.shortcutRow}>
              <span>{shortcut.label}</span>
              <kbd className={styles.kbd}>{shortcut.keys}</kbd>
            </li>
          ))}
        </ul>
      </div>
    </Dropdown>
  )
}
