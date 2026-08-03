import type { ReactNode } from 'react'
import { clsx as cx } from 'clsx'
import styles from './SectionHeader.module.css'

type HeadingLevel = 'h1' | 'h2' | 'h3'

interface SectionHeaderProps {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  align?: 'start' | 'center'
  size?: 'lg' | 'xl'
  /** Document heading level for `title`. Defaults to `h1` since this component is most often used as a page-level hero. */
  as?: HeadingLevel
}

export function SectionHeader({
  title,
  description,
  actions,
  align = 'start',
  size = 'lg',
  as: HeadingTag = 'h1',
}: SectionHeaderProps) {
  return (
    <div className={cx(styles.header, styles[align])}>
      <div className={styles.text}>
        <HeadingTag className={cx(styles.title, styles[size])}>{title}</HeadingTag>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  )
}
