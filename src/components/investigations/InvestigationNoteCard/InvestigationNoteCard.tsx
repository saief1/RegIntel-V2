import { Pin, Sparkles, Trash2 } from 'lucide-react'
import type { InvestigationNote } from '../../../types/investigations'
import { formatRelativeTime } from '../../../utils/date'
import { Badge } from '../../ui/Badge/Badge'
import { IconButton } from '../../ui/IconButton/IconButton'
import styles from './InvestigationNoteCard.module.css'

interface InvestigationNoteCardProps {
  note: InvestigationNote
  authorName: string
  onTogglePin: () => void
  onDelete: () => void
}

export function InvestigationNoteCard({ note, authorName, onTogglePin, onDelete }: InvestigationNoteCardProps) {
  return (
    <article className={styles.card} data-pinned={note.pinned || undefined}>
      <header className={styles.header}>
        <div className={styles.meta}>
          <strong>{authorName}</strong>
          <time dateTime={note.createdAt}>{formatRelativeTime(note.createdAt)}</time>
          <Badge variant={note.origin === 'ai' ? 'accent' : 'neutral'}>
            {note.origin === 'ai' ? (
              <>
                <Sparkles size={10} aria-hidden="true" /> AI generated
              </>
            ) : (
              'Manual'
            )}
          </Badge>
          {note.pinned && <Badge variant="warning">Pinned</Badge>}
        </div>
        <div className={styles.actions}>
          <IconButton label={note.pinned ? 'Unpin note' : 'Pin note'} onClick={onTogglePin}>
            <Pin size={14} />
          </IconButton>
          <IconButton label="Delete note" onClick={onDelete}>
            <Trash2 size={14} />
          </IconButton>
        </div>
      </header>
      <p className={styles.body}>{note.body}</p>
    </article>
  )
}
