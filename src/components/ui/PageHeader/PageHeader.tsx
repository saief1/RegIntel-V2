import type { ReactNode } from 'react'
import { clsx as cx } from 'clsx'
import styles from './PageHeader.module.css'

interface PageHeaderProps {
  title: ReactNode
  description?: ReactNode
  icon?: ReactNode
  actions?: ReactNode
  className?: string
}

/**
 * Top-of-page chrome: icon, title, description and trailing actions.
 * Distinct from `SectionHeader`, which is used for centered hero copy and
 * in-page subsection headings.
 */
export function PageHeader({ title, description, icon, actions, className }: PageHeaderProps) {
  return (
    <header className={cx(styles.header, className)}>
      <div className={styles.heading}>
        {icon && (
          <span className={styles.icon} aria-hidden="true">
            {icon}
          </span>
        )}
        <div className={styles.text}>
          <h1 className={styles.title}>{title}</h1>
          {description && <p className={styles.description}>{description}</p>}
        </div>
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  )
}
