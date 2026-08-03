import type { HTMLAttributes, KeyboardEvent } from 'react'
import { clsx as cx } from 'clsx'
import styles from './Card.module.css'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean
  interactive?: boolean
}

export function Card({
  elevated = false,
  interactive = false,
  className,
  onClick,
  onKeyDown,
  tabIndex,
  role,
  ...rest
}: CardProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(event)
    if (interactive && onClick && !event.defaultPrevented && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault()
      event.currentTarget.click()
    }
  }

  return (
    <div
      className={cx(styles.card, elevated && styles.elevated, interactive && styles.interactive, className)}
      onClick={onClick}
      onKeyDown={interactive ? handleKeyDown : onKeyDown}
      tabIndex={interactive ? (tabIndex ?? 0) : tabIndex}
      role={interactive ? (role ?? 'button') : role}
      {...rest}
    />
  )
}
