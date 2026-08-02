import type { ReactNode } from 'react'
import styles from './SectionHeader.module.css'

interface SectionHeaderProps {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  align?: 'start' | 'center'
  size?: 'lg' | 'xl'
}

export function SectionHeader({ title, description, actions, align = 'start', size = 'lg' }: SectionHeaderProps) {
  return (
    <div className={[styles.header, styles[align]].join(' ')}>
      <div className={styles.text}>
        <h1 className={[styles.title, styles[size]].join(' ')}>{title}</h1>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  )
}
