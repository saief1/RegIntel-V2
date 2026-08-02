import type { SelectHTMLAttributes } from 'react'
import { ChevronDownIcon } from '../../icons'
import styles from './Select.module.css'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean
}

export function Select({ invalid = false, className, children, ...rest }: SelectProps) {
  return (
    <div className={[styles.wrapper, className].filter(Boolean).join(' ')}>
      <select
        className={[styles.select, invalid ? styles.invalid : ''].filter(Boolean).join(' ')}
        aria-invalid={invalid || undefined}
        {...rest}
      >
        {children}
      </select>
      <ChevronDownIcon className={styles.chevron} width={16} height={16} />
    </div>
  )
}
