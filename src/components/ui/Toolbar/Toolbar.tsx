import type { HTMLAttributes } from 'react'
import styles from './Toolbar.module.css'

interface ToolbarProps extends HTMLAttributes<HTMLDivElement> {
  justify?: 'start' | 'end' | 'between'
}

export function Toolbar({ justify = 'start', className, ...rest }: ToolbarProps) {
  return <div className={[styles.toolbar, styles[justify], className].filter(Boolean).join(' ')} {...rest} />
}
