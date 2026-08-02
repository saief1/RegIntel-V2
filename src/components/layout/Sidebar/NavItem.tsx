import { cx } from '../../../lib/classNames'
import type { NavItemConfig } from './nav-items'
import styles from './NavItem.module.css'

interface NavItemProps {
  item: NavItemConfig
  isActive: boolean
  onSelect: (id: string) => void
}

export function NavItem({ item, isActive, onSelect }: NavItemProps) {
  const Icon = item.icon

  return (
    <button
      type="button"
      className={cx(styles.item, isActive && styles.itemActive)}
      aria-current={isActive ? 'page' : undefined}
      onClick={() => onSelect(item.id)}
    >
      <Icon className={styles.icon} />
      <span className={styles.label}>{item.label}</span>
    </button>
  )
}
