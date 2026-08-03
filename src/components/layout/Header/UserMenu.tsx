import { Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Avatar } from '../../ui/Avatar/Avatar'
import { Dropdown } from '../../ui/Dropdown/Dropdown'
import { DropdownItem, DropdownLabel, DropdownSeparator } from '../../ui/Dropdown/DropdownItem'
import styles from './UserMenu.module.css'

export function UserMenu() {
  const navigate = useNavigate()

  return (
    <Dropdown
      align="end"
      width={220}
      trigger={
        <button type="button" className={styles.trigger} aria-label="Account menu">
          <Avatar />
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
              navigate('/settings')
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
