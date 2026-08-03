import { Skeleton } from '../../ui/Skeleton/Skeleton'
import styles from './RouteFallback.module.css'

export function RouteFallback() {
  return (
    <div className={styles.root} role="status" aria-label="Loading page">
      <Skeleton height={28} width="30%" />
      <Skeleton height={16} width="50%" />
      <Skeleton height={180} radius="lg" />
    </div>
  )
}
