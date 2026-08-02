import type { TextareaHTMLAttributes } from 'react'
import { cx } from '../../../lib/classNames'
import styles from './Textarea.module.css'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean
}

export function Textarea({ invalid = false, className, rows = 4, ...rest }: TextareaProps) {
  return (
    <textarea
      rows={rows}
      className={cx(styles.textarea, invalid && styles.invalid, className)}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  )
}
