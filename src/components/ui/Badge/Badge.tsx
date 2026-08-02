import type { HTMLAttributes } from 'react'
import { cx } from '../../../lib/classNames'
import styles from './Badge.module.css'

export type BadgeVariant = 'neutral' | 'accent' | 'success' | 'warning' | 'error'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

export function Badge({ variant = 'neutral', className, children, ...rest }: BadgeProps) {
  return (
    <span className={cx(styles.badge, styles[variant], className)} {...rest}>
      {children}
    </span>
  )
}
