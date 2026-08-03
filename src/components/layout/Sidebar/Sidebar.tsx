import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { clsx as cx } from 'clsx'
import { NAV_GROUPS, NAV_ITEMS } from '../../../config/navigation'
import { useShellLayout } from '../../../hooks/useShellLayout'
import { Tooltip } from '../../ui/Tooltip/Tooltip'
import { NavItem } from './NavItem'
import { OrgSwitcher } from './OrgSwitcher'
import { UserProfile } from './UserProfile'
import styles from './Sidebar.module.css'

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebarCollapsed, isTablet, isSidebarDrawerOpen, closeSidebarDrawer } =
    useShellLayout()

  // The icon-rail collapse only applies on desktop; on tablet/mobile the
  // sidebar is always a full-width drawer when it's open.
  const collapsed = sidebarCollapsed && !isTablet
  const isDrawerMode = isTablet

  function handleNavigate() {
    if (isDrawerMode) closeSidebarDrawer()
  }

  return (
    <>
      {isDrawerMode && (
        <div
          className={cx(styles.backdrop, isSidebarDrawerOpen && styles.backdropVisible)}
          onClick={closeSidebarDrawer}
          aria-hidden="true"
        />
      )}
      <aside
        className={cx(
          styles.sidebar,
          collapsed && styles.collapsed,
          isDrawerMode && styles.drawer,
          isDrawerMode && isSidebarDrawerOpen && styles.drawerOpen,
        )}
        aria-label="Primary"
        aria-hidden={isDrawerMode && !isSidebarDrawerOpen}
        inert={isDrawerMode && !isSidebarDrawerOpen}
      >
        <div className={cx(styles.brand, collapsed && styles.brandCollapsed)}>
          <span className={styles.brandMark} aria-hidden="true">
            R
          </span>
          {!collapsed && <span className={styles.brandName}>RegIntel Professional</span>}
          {!isDrawerMode && (
            <Tooltip content={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} side="right">
              <button
                type="button"
                className={styles.collapseToggle}
                onClick={toggleSidebarCollapsed}
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
              </button>
            </Tooltip>
          )}
        </div>

        {!collapsed && (
          <div className={styles.orgSwitcher}>
            <OrgSwitcher />
          </div>
        )}

        <nav className={styles.nav} aria-label="Sections">
          {NAV_GROUPS.map((group) => {
            const items = NAV_ITEMS.filter((item) => item.group === group.id)
            return (
              <div key={group.id} className={styles.group}>
                {!collapsed && <div className={styles.groupLabel}>{group.label}</div>}
                {items.map((item) => (
                  <NavItem key={item.id} item={item} collapsed={collapsed} onNavigate={handleNavigate} />
                ))}
              </div>
            )
          })}
        </nav>

        <div className={styles.footer}>
          <UserProfile collapsed={collapsed} onNavigate={handleNavigate} />
        </div>
      </aside>
    </>
  )
}
