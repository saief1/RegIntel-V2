import { createContext } from 'react'

export interface ShellLayoutContextValue {
  /** True below the desktop breakpoint (<1280px) — sidebar/AI panel become overlays. */
  isTablet: boolean
  /** True below the tablet breakpoint (<768px) — single-column layout. */
  isMobile: boolean

  /** Desktop icon-rail collapse, persisted across sessions. */
  sidebarCollapsed: boolean
  toggleSidebarCollapsed: () => void

  /** Tablet/mobile sidebar drawer visibility (not persisted — always closed on load). */
  isSidebarDrawerOpen: boolean
  openSidebarDrawer: () => void
  closeSidebarDrawer: () => void

  /** AI panel visibility. Open by default on desktop, closed by default on tablet/mobile. */
  isAIPanelOpen: boolean
  toggleAIPanel: () => void

  isCommandPaletteOpen: boolean
  openCommandPalette: () => void
  closeCommandPalette: () => void
}

export const ShellLayoutContext = createContext<ShellLayoutContextValue | null>(null)
