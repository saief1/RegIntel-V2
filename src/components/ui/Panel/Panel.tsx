import type { HTMLAttributes, ReactNode } from 'react'
import { clsx as cx } from 'clsx'
import styles from './Panel.module.css'

interface PanelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode
  icon?: ReactNode
  actions?: ReactNode
  /**
   * `bordered` (default) renders a self-contained card with a full border and
   * radius. `flush` drops the border/radius so the panel can be composed into
   * a layout region (e.g. a full-height sidebar slot) that already owns its
   * own edge treatment.
   */
  variant?: 'bordered' | 'flush'
  /** Escape hatch for a consuming layout to adjust the header row (e.g. to align its height with a sibling region). */
  headerClassName?: string
  bodyClassName?: string
}

export function Panel({
  title,
  icon,
  actions,
  variant = 'bordered',
  headerClassName,
  bodyClassName,
  className,
  children,
  ...rest
}: PanelProps) {
  return (
    <div className={cx(styles.panel, styles[variant], className)} {...rest}>
      {(title || actions) && (
        <div className={cx(styles.header, headerClassName)}>
          <div className={styles.heading}>
            {icon}
            {title && <h2 className={styles.title}>{title}</h2>}
          </div>
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
      )}
      <div className={cx(styles.body, bodyClassName)}>{children}</div>
    </div>
  )
}
