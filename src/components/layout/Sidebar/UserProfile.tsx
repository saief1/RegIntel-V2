import { Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Avatar } from '../../ui/Avatar/Avatar'
import { Dropdown } from '../../ui/Dropdown/Dropdown'
import { DropdownItem, DropdownLabel, DropdownSeparator } from '../../ui/Dropdown/DropdownItem'
import { Tooltip } from '../../ui/Tooltip/Tooltip'
import styles from './UserProfile.module.css'

interface UserProfileProps {
  collapsed?: boolean
  onNavigate?: () => void
}

/**
 * No authentication exists yet, so this intentionally never shows a
 * fabricated name or email — only the generic account/settings affordances
 * the shell actually supports today.
 */
export function UserProfile({ collapsed = false, onNavigate }: UserProfileProps) {
  const navigate = useNavigate()

  function goToSettings() {
    onNavigate?.()
    navigate('/settings')
  }

  if (collapsed) {
    return (
      <div className={styles.collapsedRow}>
        <Tooltip content="Account" side="right">
          <span className={styles.collapsedAvatar}>
            <Avatar />
          </span>
        </Tooltip>
        <Tooltip content="Settings" side="right">
          <button type="button" className={styles.iconButton} aria-label="Settings" onClick={goToSettings}>
            <Settings size={18} />
          </button>
        </Tooltip>
      </div>
    )
  }

  return (
    <Dropdown
      align="start"
      width={220}
      trigger={
        <button type="button" className={styles.trigger}>
          <Avatar />
          <span className={styles.identity}>
            <span className={styles.name}>Account</span>
            <span className={styles.status}>Not signed in</span>
          </span>
        </button>
      }
    >
      {(close) => (
        <>
          <DropdownLabel>Account</DropdownLabel>
          <DropdownItem
            icon={<Settings size={16} />}
            onClick={() => {
              close()
              goToSettings()
            }}
          >
            Settings
          </DropdownItem>
          <DropdownSeparator />
          <DropdownItem disabled>Sign-in coming soon</DropdownItem>
        </>
      )}
    </Dropdown>
  )
}
