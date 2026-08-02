import { useState } from 'react'
import { NAV_ITEMS } from './nav-items'
import { NavItem } from './NavItem'
import styles from './Sidebar.module.css'

export function Sidebar() {
  const [activeId, setActiveId] = useState(NAV_ITEMS[0].id)

  return (
    <aside className={styles.sidebar} aria-label="Primary">
      <div className={styles.brand}>
        <span className={styles.brandMark} aria-hidden="true">
          R
        </span>
        <span className={styles.brandName}>RegIntel Professional</span>
      </div>

      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.id} item={item} isActive={item.id === activeId} onSelect={setActiveId} />
        ))}
      </nav>
    </aside>
  )
}
