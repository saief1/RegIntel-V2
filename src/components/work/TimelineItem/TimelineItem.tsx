import { clsx as cx } from 'clsx'
import type { TimelineEvent, WorkUser } from '../../../types/work'
import { formatRelativeTime } from '../../../utils/date'
import styles from './TimelineItem.module.css'

interface TimelineItemProps {
  event: TimelineEvent
  actor?: WorkUser
  isLast?: boolean
}

export function TimelineItem({ event, actor, isLast = false }: TimelineItemProps) {
  return (
    <li className={cx(styles.item, isLast && styles.last)}>
      <span className={styles.rail} aria-hidden="true">
        <span className={styles.dot} data-type={event.type} />
      </span>
      <div className={styles.body}>
        <div className={styles.header}>
          <p className={styles.title}>{event.title}</p>
          <time className={styles.time} dateTime={event.createdAt}>
            {formatRelativeTime(event.createdAt)}
          </time>
        </div>
        {event.description && <p className={styles.description}>{event.description}</p>}
        {actor && <p className={styles.actor}>{actor.name}</p>}
      </div>
    </li>
  )
}
