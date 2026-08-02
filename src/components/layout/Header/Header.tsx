import { Avatar } from '../../ui/Avatar/Avatar'
import { IconButton } from '../../ui/IconButton/IconButton'
import { SearchField } from '../../ui/SearchField/SearchField'
import { Toolbar } from '../../ui/Toolbar/Toolbar'
import { BellIcon, ChevronDownIcon } from '../../icons'
import styles from './Header.module.css'

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.searchSlot}>
        <SearchField placeholder="Search" aria-label="Search" />
      </div>

      <Toolbar>
        <IconButton label="Notifications">
          <BellIcon />
        </IconButton>

        <button type="button" className={styles.profile}>
          <Avatar />
          <ChevronDownIcon width={14} height={14} className={styles.profileChevron} />
        </button>
      </Toolbar>
    </header>
  )
}
