import { Link } from 'react-router-dom'
import { Bookmark, FolderOpen, MoreHorizontal, Pencil, Pin, Trash2 } from 'lucide-react'
import { clsx as cx } from 'clsx'
import type { Collection } from '../../../types/knowledge'
import { formatRelativeTime } from '../../../utils/date'
import { Dropdown } from '../../ui/Dropdown/Dropdown'
import { DropdownItem, DropdownSeparator } from '../../ui/Dropdown/DropdownItem'
import { IconButton } from '../../ui/IconButton/IconButton'
import styles from './CollectionCard.module.css'

interface CollectionCardProps {
  collection: Collection
  href: string
  onToggleFavorite: () => void
  onTogglePinned: () => void
  onRename: () => void
  onDelete: () => void
  className?: string
}

/** Card presentation of a user collection, with favorite/pin state and a management menu. */
export function CollectionCard({
  collection,
  href,
  onToggleFavorite,
  onTogglePinned,
  onRename,
  onDelete,
  className,
}: CollectionCardProps) {
  return (
    <div className={cx(styles.card, className)}>
      <Link to={href} className={styles.link}>
        <div className={styles.icon} aria-hidden="true">
          <FolderOpen size={18} />
        </div>
        <div className={styles.text}>
          <h3 className={styles.title}>{collection.name}</h3>
          {collection.description && <p className={styles.description}>{collection.description}</p>}
        </div>
      </Link>

      <div className={styles.footer}>
        <span className={styles.count}>
          {collection.documentIds.length} {collection.documentIds.length === 1 ? 'item' : 'items'}
        </span>
        <span className={styles.dot} aria-hidden="true">
          ·
        </span>
        <span>Updated {formatRelativeTime(collection.updatedAt)}</span>
      </div>

      <div className={styles.actions}>
        <IconButton
          label={collection.isPinned ? 'Unpin collection' : 'Pin collection'}
          className={cx(styles.actionButton, collection.isPinned && styles.actionButtonActive)}
          aria-pressed={collection.isPinned}
          onClick={onTogglePinned}
        >
          <Pin size={14} fill={collection.isPinned ? 'currentColor' : 'none'} />
        </IconButton>
        <IconButton
          label={collection.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          className={cx(styles.actionButton, collection.isFavorite && styles.actionButtonActive)}
          aria-pressed={collection.isFavorite}
          onClick={onToggleFavorite}
        >
          <Bookmark size={14} fill={collection.isFavorite ? 'currentColor' : 'none'} />
        </IconButton>
        <Dropdown
          align="end"
          trigger={
            <IconButton label="Collection options" className={styles.actionButton}>
              <MoreHorizontal size={14} />
            </IconButton>
          }
        >
          {(close) => (
            <>
              <DropdownItem
                icon={<Pencil size={14} />}
                onClick={() => {
                  close()
                  onRename()
                }}
              >
                Rename
              </DropdownItem>
              <DropdownSeparator />
              <DropdownItem
                icon={<Trash2 size={14} />}
                destructive
                onClick={() => {
                  close()
                  onDelete()
                }}
              >
                Delete
              </DropdownItem>
            </>
          )}
        </Dropdown>
      </div>
    </div>
  )
}
