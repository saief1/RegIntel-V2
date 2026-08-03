import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { clsx as cx } from 'clsx'
import { GlobalOnboardingChecklist } from '../../adoption/GlobalOnboardingChecklist'
import { WelcomeBanner } from '../../adoption/WelcomeBanner'
import { WhatsNewModal } from '../../adoption/WhatsNewModal'
import { TrialCountdownBanner } from '../../commercial/TrialCountdownBanner'
import { UsageWarningBanner } from '../../commercial/UsageWarningBanner'
import { MaintenanceBanner } from '../../operations/MaintenanceBanner'
import { Skeleton } from '../../ui/Skeleton/Skeleton'
import styles from './Workspace.module.css'

/** Brief, honest loading transition shown once while the shell mounts — not tied to any backend. */
const INITIAL_LOAD_MS = 420

export function Workspace() {
  const location = useLocation()
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => setInitializing(false), INITIAL_LOAD_MS)
    return () => window.clearTimeout(timer)
  }, [])

  const isFlushLayout = location.pathname === '/ai' || location.pathname.startsWith('/ai/')
  const hideAdoptionChrome =
    location.pathname.startsWith('/onboarding') ||
    location.pathname.startsWith('/help') ||
    location.pathname.startsWith('/customer-success') ||
    location.pathname.startsWith('/community') ||
    location.pathname.startsWith('/settings/tours')

  const hideCommercialChrome =
    location.pathname.startsWith('/settings/billing') ||
    location.pathname.startsWith('/settings/usage') ||
    location.pathname.startsWith('/settings/licensing') ||
    location.pathname === '/customer' ||
    location.pathname.startsWith('/customer/') ||
    location.pathname.startsWith('/partners')

  return (
    <main className={cx(styles.workspace, isFlushLayout && styles.flush)} aria-label="Workspace">
      {initializing ? (
        <div className={styles.skeletonPage} aria-hidden="true">
          <Skeleton height={28} width="35%" />
          <Skeleton height={16} width="55%" />
          <div className={styles.skeletonGrid}>
            <Skeleton height={112} radius="lg" />
            <Skeleton height={112} radius="lg" />
            <Skeleton height={112} radius="lg" />
          </div>
        </div>
      ) : (
        <div key={location.pathname} className={cx(styles.page, isFlushLayout && styles.flushPage)}>
          <MaintenanceBanner />
          {!isFlushLayout && !hideCommercialChrome && (
            <>
              <TrialCountdownBanner />
              <UsageWarningBanner />
            </>
          )}
          {!isFlushLayout && !hideAdoptionChrome && (
            <>
              <WelcomeBanner />
              <GlobalOnboardingChecklist />
            </>
          )}
          <Outlet />
          <WhatsNewModal />
        </div>
      )}
    </main>
  )
}
