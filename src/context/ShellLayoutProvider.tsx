import { useState, type ReactNode } from 'react'
import { useIsMobile, useIsTablet } from '../hooks/useMediaQuery'
import { useLocalStorageState } from '../hooks/useLocalStorageState'
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut'
import { ShellLayoutContext, type ShellLayoutContextValue } from './ShellLayoutContext'

export function ShellLayoutProvider({ children }: { children: ReactNode }) {
  const isTablet = useIsTablet()
  const isMobile = useIsMobile()

  const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorageState('ri-sidebar-collapsed', false)
  const [isSidebarDrawerOpen, setSidebarDrawerOpen] = useState(false)
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false)

  // The AI panel defaults open on desktop and closed on tablet/mobile, but
  // stays user-toggleable — so instead of an effect, we adjust its state
  // during render whenever the breakpoint itself changes (see "Adjusting
  // state when a prop changes" in the React docs).
  const [prevIsTablet, setPrevIsTablet] = useState(isTablet)
  const [isAIPanelOpen, setAIPanelOpen] = useState(!isTablet)
  if (isTablet !== prevIsTablet) {
    setPrevIsTablet(isTablet)
    setAIPanelOpen(!isTablet)
  }

  useKeyboardShortcut({ key: 'k', meta: true }, () => setCommandPaletteOpen(true))

  const value: ShellLayoutContextValue = {
    isTablet,
    isMobile,
    sidebarCollapsed,
    toggleSidebarCollapsed: () => setSidebarCollapsed((current) => !current),
    isSidebarDrawerOpen,
    openSidebarDrawer: () => setSidebarDrawerOpen(true),
    closeSidebarDrawer: () => setSidebarDrawerOpen(false),
    isAIPanelOpen,
    toggleAIPanel: () => setAIPanelOpen((current) => !current),
    isCommandPaletteOpen,
    openCommandPalette: () => setCommandPaletteOpen(true),
    closeCommandPalette: () => setCommandPaletteOpen(false),
  }

  return <ShellLayoutContext.Provider value={value}>{children}</ShellLayoutContext.Provider>
}
