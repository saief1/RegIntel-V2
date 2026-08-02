import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cx } from '../../../lib/classNames'
import styles from './IconButton.module.css'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  children: ReactNode
}

export function IconButton({ label, children, className, ...rest }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cx(styles.button, className)}
      {...rest}
    >
      {children}
    </button>
  )
}
