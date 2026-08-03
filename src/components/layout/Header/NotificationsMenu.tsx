import { Bell } from 'lucide-react'
import { Dropdown } from '../../ui/Dropdown/Dropdown'
import { IconButton } from '../../ui/IconButton/IconButton'
import styles from './HeaderMenu.module.css'

export function NotificationsMenu() {
  return (
    <Dropdown
      align="end"
      width={280}
      trigger={
        <IconButton label="Notifications">
          <Bell size={18} />
        </IconButton>
      }
    >
      <div className={styles.panel}>
        <p className={styles.title}>Notifications</p>
        <p className={styles.empty}>You're all caught up. No new notifications.</p>
      </div>
    </Dropdown>
  )
}
