import type { ReactNode } from 'react'
import styles from './DashboardWidget.module.css'

interface DashboardWidgetProps {
  title: string
  children: ReactNode
  action?: ReactNode
}

export function DashboardWidget({ title, children, action }: DashboardWidgetProps) {
  return (
    <section className={styles.widget} aria-label={title}>
      <header className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        {action}
      </header>
      <div className={styles.body}>{children}</div>
    </section>
  )
}
