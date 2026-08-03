import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { clsx as cx } from 'clsx'
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
