import type { InputHTMLAttributes } from 'react'
import { SearchIcon } from '../../icons'
import styles from './SearchField.module.css'

type SearchFieldProps = InputHTMLAttributes<HTMLInputElement>

export function SearchField({ className, ...rest }: SearchFieldProps) {
  return (
    <label className={[styles.field, className].filter(Boolean).join(' ')}>
      <SearchIcon className={styles.icon} />
      <input type="text" className={styles.input} {...rest} />
    </label>
  )
}
