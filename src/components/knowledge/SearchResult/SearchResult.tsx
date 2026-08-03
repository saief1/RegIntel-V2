import type { ReactNode } from 'react'
import { clsx as cx } from 'clsx'
import styles from './SearchResult.module.css'

interface SearchResultProps {
  id: string
  icon: ReactNode
  title: string
  subtitle?: string
  meta?: ReactNode
  active?: boolean
  onClick: () => void
  onMouseEnter?: () => void
}

/** Single row within a Global Search results group (documents, regulations, collections, destinations). */
export function SearchResult({ id, icon, title, subtitle, meta, active = false, onClick, onMouseEnter }: SearchResultProps) {
  return (
    <li>
      <button
        type="button"
        id={id}
        role="option"
        aria-selected={active}
        className={cx(styles.result, active && styles.resultActive)}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
      >
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
        <span className={styles.text}>
          <span className={styles.title}>{title}</span>
          {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
        </span>
        {meta && <span className={styles.meta}>{meta}</span>}
      </button>
    </li>
  )
}
