import { Command, Menu, PanelLeftClose, PanelLeftOpen, Sparkles } from 'lucide-react'
import { useShellLayout } from '../../../hooks/useShellLayout'
import { SubscriptionBadge } from '../../commercial/SubscriptionBadge'
import { GlobalStatusIndicator } from '../../operations/GlobalStatusIndicator'
import { SolutionSwitcher } from '../../solutions/SolutionSwitcher'
import { IconButton } from '../../ui/IconButton/IconButton'
import { SearchField } from '../../ui/SearchField/SearchField'
import { Toolbar } from '../../ui/Toolbar/Toolbar'
import { Tooltip } from '../../ui/Tooltip/Tooltip'
import { Breadcrumb } from './Breadcrumb'
import { HelpMenu } from './HelpMenu'
import { NotificationsMenu } from './NotificationsMenu'
import { UserMenu } from './UserMenu'
import styles from './Header.module.css'

export function Header() {
  const {
    isTablet,
    sidebarCollapsed,
    toggleSidebarCollapsed,
    openSidebarDrawer,
    isAIPanelOpen,
    toggleAIPanel,
    openCommandPalette,
  } = useShellLayout()

  return (
    <header className={styles.header}>
      <div className={styles.leading}>
        {isTablet ? (
          <IconButton label="Open navigation" onClick={openSidebarDrawer}>
            <Menu size={18} />
          </IconButton>
        ) : (
          <Tooltip content={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} side="bottom">
            <IconButton
              label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              onClick={toggleSidebarCollapsed}
            >
              {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </IconButton>
          </Tooltip>
        )}
        <Breadcrumb />
      </div>

      <div className={styles.searchSlot}>
        <SearchField
          placeholder="Search knowledge..."
          aria-label="Global search (opens with ⌘K)"
          shortcut="⌘K"
          readOnly
          onClick={openCommandPalette}
          onFocus={openCommandPalette}
        />
      </div>

      <Toolbar>
        <SolutionSwitcher />
        <SubscriptionBadge />
        <GlobalStatusIndicator />
        <Tooltip content="Command palette" side="bottom">
          <IconButton label="Open global search" onClick={openCommandPalette} className={styles.desktopOnly}>
            <Command size={18} />
          </IconButton>
        </Tooltip>
        <Tooltip content={isAIPanelOpen ? 'Hide AI panel' : 'Show AI panel'} side="bottom">
          <IconButton label={isAIPanelOpen ? 'Hide AI panel' : 'Show AI panel'} onClick={toggleAIPanel}>
            <Sparkles size={18} />
          </IconButton>
        </Tooltip>
        <NotificationsMenu />
        <HelpMenu />
        <UserMenu />
      </Toolbar>
    </header>
  )
}
