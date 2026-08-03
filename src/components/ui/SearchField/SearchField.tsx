import type { InputHTMLAttributes } from 'react'
import { clsx as cx } from 'clsx'
import { Search } from 'lucide-react'
import styles from './SearchField.module.css'

interface SearchFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Optional keyboard-shortcut hint rendered at the trailing edge, e.g. "⌘K". */
  shortcut?: string
}

export function SearchField({ className, shortcut, ...rest }: SearchFieldProps) {
  return (
    <label className={cx(styles.field, className)}>
      <Search className={styles.icon} size={16} aria-hidden="true" />
      <input type="text" className={styles.input} {...rest} />
      {shortcut && <span className={styles.shortcut}>{shortcut}</span>}
    </label>
  )
}
