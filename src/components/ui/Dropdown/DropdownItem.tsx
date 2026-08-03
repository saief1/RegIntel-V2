import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { clsx as cx } from 'clsx'
import styles from './DropdownItem.module.css'

interface DropdownItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode
  destructive?: boolean
}

export function DropdownItem({
  icon,
  destructive = false,
  disabled = false,
  className,
  children,
  ...rest
}: DropdownItemProps) {
  return (
    <button
      type="button"
      role={disabled ? undefined : 'menuitem'}
      tabIndex={disabled ? undefined : -1}
      disabled={disabled}
      className={cx(styles.item, destructive && styles.destructive, className)}
      {...rest}
    >
      {icon && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </button>
  )
}

export function DropdownLabel({ children }: { children: ReactNode }) {
  return <div className={styles.label}>{children}</div>
}

export function DropdownSeparator() {
  return <div className={styles.separator} role="separator" />
}
