import type { ReactNode } from 'react'
import styles from './EmptyState.module.css'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  /**
   * Default `status` for empty/loading-adjacent content.
   * Pass `alert` for error-like empty states, or `null` to omit a live region.
   */
  role?: 'status' | 'alert' | null
}

/** Shared empty / placeholder surface. Prefer this (or NetworkErrorState) over one-off empty UIs. */
export function EmptyState({ icon, title, description, action, role = 'status' }: EmptyStateProps) {
  return (
    <div className={styles.emptyState} role={role ?? undefined}>
      {icon && (
        <div className={styles.icon} aria-hidden="true">
          {icon}
        </div>
      )}
      <p className={styles.title}>{title}</p>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  )
}
