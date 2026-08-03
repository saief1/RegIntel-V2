import { Link } from 'react-router-dom'
import { useWork } from '../../../hooks/useWork'
import { formatRelativeTime } from '../../../utils/date'
import styles from './ActivityFeed.module.css'

interface ActivityFeedProps {
  limit?: number
}

export function ActivityFeed({ limit }: ActivityFeedProps) {
  const { activity, getUser } = useWork()
  const items = limit ? activity.slice(0, limit) : activity

  if (items.length === 0) {
    return <p className={styles.empty}>No recent activity.</p>
  }

  return (
    <ol className={styles.feed} aria-label="Recent activity">
      {items.map((item, index) => {
        const actor = getUser(item.actorId)
        return (
          <li key={item.id} className={styles.item}>
            <span className={styles.rail} aria-hidden="true">
              <span className={styles.dot} />
              {index < items.length - 1 && <span className={styles.line} />}
            </span>
            <div className={styles.body}>
              <div className={styles.header}>
                <p className={styles.title}>{item.title}</p>
                <time dateTime={item.createdAt}>{formatRelativeTime(item.createdAt)}</time>
              </div>
              <p className={styles.description}>{item.description}</p>
              <p className={styles.meta}>
                {actor?.name ?? 'Someone'}
                {item.caseId && (
                  <>
                    {' · '}
                    <Link to={`/work/cases/${item.caseId}`}>View case</Link>
                  </>
                )}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
