import type { ReactNode } from 'react'
import { clsx as cx } from 'clsx'
import styles from './KnowledgeGrid.module.css'

interface KnowledgeGridProps {
  children: ReactNode
  className?: string
  /** aria-label for the grid landmark when it isn't already described by a preceding heading. */
  'aria-label'?: string
}

/** Responsive card grid shared by Knowledge Home sections and the Regulation Library's grid view. */
export function KnowledgeGrid({ children, className, 'aria-label': ariaLabel }: KnowledgeGridProps) {
  return (
    <div className={cx(styles.grid, className)} aria-label={ariaLabel}>
      {children}
    </div>
  )
}
