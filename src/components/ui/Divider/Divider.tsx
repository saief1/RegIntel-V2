import { clsx as cx } from 'clsx'
import styles from './Divider.module.css'

interface DividerProps {
  orientation?: 'horizontal' | 'vertical'
  className?: string
}

export function Divider({ orientation = 'horizontal', className }: DividerProps) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cx(styles.divider, styles[orientation], className)}
    />
  )
}
