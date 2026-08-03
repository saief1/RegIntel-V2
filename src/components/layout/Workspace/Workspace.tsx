import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { clsx as cx } from 'clsx'
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
          <Outlet />
        </div>
      )}
    </main>
  )
}
