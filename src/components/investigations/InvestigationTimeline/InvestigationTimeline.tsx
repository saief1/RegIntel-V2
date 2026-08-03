import {
  Bot,
  ClipboardCheck,
  FilePlus2,
  MessageSquare,
  StickyNote,
  UserRound,
  Workflow,
} from 'lucide-react'
import type { InvestigationTimelineEvent, InvestigationTimelineType } from '../../../types/investigations'
import { formatRelativeTime } from '../../../utils/date'
import styles from './InvestigationTimeline.module.css'

const ICONS: Record<InvestigationTimelineType, typeof Bot> = {
  status_change: Workflow,
  comment: MessageSquare,
  evidence_added: FilePlus2,
  ai_recommendation: Bot,
  decision: ClipboardCheck,
  assignment: UserRound,
  note: StickyNote,
  task: ClipboardCheck,
}

interface InvestigationTimelineProps {
  events: InvestigationTimelineEvent[]
  getActorName: (id: string) => string
}

export function InvestigationTimeline({ events, getActorName }: InvestigationTimelineProps) {
  if (events.length === 0) {
    return <p className={styles.empty}>No timeline events yet.</p>
  }

  return (
    <ol className={styles.list} aria-label="Investigation timeline">
      {events.map((event) => {
        const Icon = ICONS[event.type]
        return (
          <li key={event.id} className={styles.item}>
            <span className={styles.icon} aria-hidden="true">
              <Icon size={14} />
            </span>
            <div className={styles.body}>
              <div className={styles.titleRow}>
                <strong>{event.title}</strong>
                <time dateTime={event.createdAt}>{formatRelativeTime(event.createdAt)}</time>
              </div>
              {event.description && <p className={styles.description}>{event.description}</p>}
              <p className={styles.actor}>{getActorName(event.actorId)}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
