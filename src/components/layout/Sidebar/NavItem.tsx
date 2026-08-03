import { NavLink } from 'react-router-dom'
import { clsx as cx } from 'clsx'
import type { NavItemConfig } from '../../../config/navigation'
import { Tooltip } from '../../ui/Tooltip/Tooltip'
import styles from './NavItem.module.css'

interface NavItemProps {
  item: NavItemConfig
  collapsed?: boolean
  onNavigate?: () => void
}

export function NavItem({ item, collapsed = false, onNavigate }: NavItemProps) {
  const Icon = item.icon

  const link = (
    <NavLink
      to={item.path}
      end={item.path === '/'}
      onClick={onNavigate}
      className={({ isActive }) => cx(styles.item, isActive && styles.itemActive, collapsed && styles.collapsed)}
    >
      <Icon size={18} className={styles.icon} aria-hidden="true" />
      {!collapsed && <span className={styles.label}>{item.label}</span>}
    </NavLink>
  )

  if (!collapsed) return link

  return (
    <Tooltip content={item.label} side="right">
      {link}
    </Tooltip>
  )
}
