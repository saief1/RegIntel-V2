import { useMemo } from 'react'
import type { ActivityItem, TimelineEvent } from '../../../types/work'
import { formatRelativeTime } from '../../../utils/date'
import styles from './WorkTimelineView.module.css'

interface WorkTimelineViewProps {
  timeline: TimelineEvent[]
  activity: ActivityItem[]
  getActorName: (id: string) => string
}

export function WorkTimelineView({ timeline, activity, getActorName }: WorkTimelineViewProps) {
  const events = useMemo(() => {
    const fromTimeline = timeline.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description ?? getActorName(item.actorId),
      createdAt: item.createdAt,
    }))
    const fromActivity = activity.map((item) => ({
      id: item.id,
      title: item.title,
      description: `${getActorName(item.actorId)} · ${item.description}`,
      createdAt: item.createdAt,
    }))
    return [...fromTimeline, ...fromActivity]
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .slice(0, 40)
  }, [activity, getActorName, timeline])

  return (
    <ol className={styles.list} aria-label="Work timeline">
      {events.map((event) => {
        const time = new Date(event.createdAt)
        const clock = time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        return (
          <li key={event.id} className={styles.item}>
            <time className={styles.time} dateTime={event.createdAt}>
              {clock}
            </time>
            <div className={styles.body}>
              <strong>{event.title}</strong>
              <p>{event.description}</p>
              <span>{formatRelativeTime(event.createdAt)}</span>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
