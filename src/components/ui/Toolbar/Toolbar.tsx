import type { HTMLAttributes } from 'react'
import { clsx as cx } from 'clsx'
import styles from './Toolbar.module.css'

interface ToolbarProps extends HTMLAttributes<HTMLDivElement> {
  justify?: 'start' | 'end' | 'between'
}

export function Toolbar({ justify = 'start', className, ...rest }: ToolbarProps) {
  return <div className={cx(styles.toolbar, styles[justify], className)} {...rest} />
}
