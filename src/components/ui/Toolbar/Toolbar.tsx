import type { HTMLAttributes } from 'react'
import { cx } from '../../../lib/classNames'
import styles from './Toolbar.module.css'

interface ToolbarProps extends HTMLAttributes<HTMLDivElement> {
  justify?: 'start' | 'end' | 'between'
}

export function Toolbar({ justify = 'start', className, ...rest }: ToolbarProps) {
  return <div className={cx(styles.toolbar, styles[justify], className)} {...rest} />
}
