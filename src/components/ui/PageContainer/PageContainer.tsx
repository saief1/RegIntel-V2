import type { HTMLAttributes } from 'react'
import { clsx as cx } from 'clsx'
import styles from './PageContainer.module.css'

/** Constrains routed page content to the standard reading width with consistent padding. */
export function PageContainer({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx(styles.container, className)} {...rest} />
}
