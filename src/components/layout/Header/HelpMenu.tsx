import { HelpCircle } from 'lucide-react'
import { Dropdown } from '../../ui/Dropdown/Dropdown'
import { IconButton } from '../../ui/IconButton/IconButton'
import styles from './HeaderMenu.module.css'

const SHORTCUTS: Array<{ keys: string; label: string }> = [
  { keys: '⌘K', label: 'Open global search' },
  { keys: '⌘S', label: 'Save current search' },
  { keys: '⌘\\', label: 'Toggle sidebar' },
  { keys: 'Esc', label: 'Close dialogs and menus' },
]

export function HelpMenu() {
  return (
    <Dropdown
      align="end"
      width={280}
      trigger={
        <IconButton label="Help">
          <HelpCircle size={18} />
        </IconButton>
      }
    >
      <div className={styles.panel}>
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
