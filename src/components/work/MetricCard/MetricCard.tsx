import type { ReactNode } from 'react'
import { clsx as cx } from 'clsx'
import styles from './MetricCard.module.css'

interface MetricCardProps {
  label: string
  value: number | string
  hint?: string
  icon?: ReactNode
  tone?: 'default' | 'accent' | 'warning' | 'danger' | 'success'
  onClick?: () => void
  active?: boolean
}

export function MetricCard({ label, value, hint, icon, tone = 'default', onClick, active = false }: MetricCardProps) {
  const Tag = onClick ? 'button' : 'div'

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      className={cx(styles.card, styles[tone], active && styles.active, onClick && styles.clickable)}
      onClick={onClick}
      aria-pressed={onClick ? active : undefined}
    >
      <div className={styles.top}>
        <span className={styles.label}>{label}</span>
        {icon && <span className={styles.icon}>{icon}</span>}
      </div>
      <p className={styles.value}>{value}</p>
      {hint && <p className={styles.hint}>{hint}</p>}
    </Tag>
  )
}
