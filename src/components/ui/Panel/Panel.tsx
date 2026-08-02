import type { HTMLAttributes, ReactNode } from 'react'
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
    <div className={[styles.panel, styles[variant], className].filter(Boolean).join(' ')} {...rest}>
      {(title || actions) && (
        <div className={[styles.header, headerClassName].filter(Boolean).join(' ')}>
          <div className={styles.heading}>
            {icon}
            {title && <h2 className={styles.title}>{title}</h2>}
          </div>
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
      )}
      <div className={[styles.body, bodyClassName].filter(Boolean).join(' ')}>{children}</div>
    </div>
  )
}
