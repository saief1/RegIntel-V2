import type { InputHTMLAttributes } from 'react'
import { cx } from '../../../lib/classNames'
import { SearchIcon } from '../../icons'
import styles from './SearchField.module.css'

type SearchFieldProps = InputHTMLAttributes<HTMLInputElement>

export function SearchField({ className, ...rest }: SearchFieldProps) {
  return (
    <label className={cx(styles.field, className)}>
      <SearchIcon className={styles.icon} />
      <input type="text" className={styles.input} {...rest} />
    </label>
  )
}
