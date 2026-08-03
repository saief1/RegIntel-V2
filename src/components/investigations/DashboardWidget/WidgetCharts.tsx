import styles from './DashboardWidget.module.css'

interface DistributionItem {
  label: string
  value: number
}

export function DistributionBars({ items }: { items: DistributionItem[] }) {
  const max = Math.max(...items.map((item) => item.value), 1)
  return (
    <div className={styles.bars}>
      {items.map((item) => (
        <div key={item.label} className={styles.barRow}>
          <span>{item.label}</span>
          <div className={styles.track} aria-hidden="true">
            <div className={styles.fill} style={{ width: `${(item.value / max) * 100}%` }} />
          </div>
          <span>{item.value}</span>
        </div>
      ))}
    </div>
  )
}

export function SimpleList({ items }: { items: { label: string; detail: string }[] }) {
  if (items.length === 0) return <p className={styles.listItem}>Nothing to show.</p>
  return (
    <ul className={styles.list}>
      {items.map((item) => (
        <li key={`${item.label}-${item.detail}`} className={styles.listItem}>
          <strong>{item.label}</strong>
          <span>{item.detail}</span>
        </li>
      ))}
    </ul>
  )
}
