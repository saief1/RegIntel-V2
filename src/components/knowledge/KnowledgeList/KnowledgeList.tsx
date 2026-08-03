import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Bookmark, Pin } from 'lucide-react'
import { clsx as cx } from 'clsx'
import type { KnowledgeDocument } from '../../../types/knowledge'
import { formatDate } from '../../../utils/date'
import { Badge } from '../../ui/Badge/Badge'
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../../ui/Table/Table'
import { kindLabel, statusBadgeVariant, statusLabel } from '../statusBadge'
import styles from './KnowledgeList.module.css'

interface KnowledgeListProps {
  documents: KnowledgeDocument[]
  getHref: (document: KnowledgeDocument) => string
  favoriteDocumentIds?: string[]
  pinnedDocumentIds?: string[]
  onToggleFavorite?: (id: string) => void
  onTogglePinned?: (id: string) => void
  /** Extra per-row control rendered after the built-in favorite/pin actions (e.g. a "Move to collection" menu). */
  renderRowActions?: (document: KnowledgeDocument) => ReactNode
}

/** Dense tabular presentation of the library, used by the Regulation Library's list view and Collections' member list. */
export function KnowledgeList({
  documents,
  getHref,
  favoriteDocumentIds = [],
  pinnedDocumentIds = [],
  onToggleFavorite,
  onTogglePinned,
  renderRowActions,
}: KnowledgeListProps) {
  return (
    <Table aria-label="Regulation library results">
      <TableHead>
        <TableRow>
          <TableHeaderCell>Title</TableHeaderCell>
          <TableHeaderCell>Jurisdiction</TableHeaderCell>
          <TableHeaderCell>Category</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell>Updated</TableHeaderCell>
          <TableHeaderCell aria-label="Actions" />
        </TableRow>
      </TableHead>
      <TableBody>
        {documents.map((document) => {
          const isFavorite = favoriteDocumentIds.includes(document.id)
          const isPinned = pinnedDocumentIds.includes(document.id)
          return (
            <TableRow key={document.id}>
              <TableCell>
                <Link to={getHref(document)} className={styles.titleLink}>
                  <span className={styles.title}>{document.title}</span>
                  <span className={styles.kind}>{kindLabel(document.kind)}</span>
                </Link>
              </TableCell>
              <TableCell>{document.jurisdiction}</TableCell>
              <TableCell>{document.category}</TableCell>
              <TableCell>
                <Badge variant={statusBadgeVariant(document.status)}>{statusLabel(document.status)}</Badge>
              </TableCell>
              <TableCell className={styles.updated}>{formatDate(document.lastUpdated)}</TableCell>
              <TableCell>
                <div className={styles.rowActions}>
                  {onTogglePinned && (
                    <button
                      type="button"
                      className={cx(styles.rowAction, isPinned && styles.rowActionActive)}
                      aria-pressed={isPinned}
                      aria-label={isPinned ? `Unpin ${document.title}` : `Pin ${document.title}`}
                      onClick={() => onTogglePinned(document.id)}
                    >
                      <Pin size={14} fill={isPinned ? 'currentColor' : 'none'} />
                    </button>
                  )}
                  {onToggleFavorite && (
                    <button
                      type="button"
                      className={cx(styles.rowAction, isFavorite && styles.rowActionActive)}
                      aria-pressed={isFavorite}
                      aria-label={isFavorite ? `Remove ${document.title} from favorites` : `Add ${document.title} to favorites`}
                      onClick={() => onToggleFavorite(document.id)}
                    >
                      <Bookmark size={14} fill={isFavorite ? 'currentColor' : 'none'} />
                    </button>
                  )}
                  {renderRowActions?.(document)}
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
