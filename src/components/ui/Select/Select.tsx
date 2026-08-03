import type { SelectHTMLAttributes } from 'react'
import { clsx as cx } from 'clsx'
import { ChevronDown } from 'lucide-react'
import styles from './Select.module.css'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean
}

export function Select({ invalid = false, className, children, ...rest }: SelectProps) {
  return (
    <div className={cx(styles.wrapper, className)}>
      <select
        className={cx(styles.select, invalid && styles.invalid)}
        aria-invalid={invalid || undefined}
        {...rest}
      >
        {children}
      </select>
      <ChevronDown className={styles.chevron} size={16} aria-hidden="true" />
    </div>
  )
}
