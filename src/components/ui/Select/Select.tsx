import type { SelectHTMLAttributes } from 'react'
import { cx } from '../../../lib/classNames'
import { ChevronDownIcon } from '../../icons'
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
      <ChevronDownIcon className={styles.chevron} width={16} height={16} />
    </div>
  )
}
