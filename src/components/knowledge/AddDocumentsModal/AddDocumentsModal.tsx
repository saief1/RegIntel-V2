import { useMemo, useState } from 'react'
import { Check, Plus } from 'lucide-react'
import { clsx as cx } from 'clsx'
import type { KnowledgeDocument } from '../../../types/knowledge'
import { Modal } from '../../ui/Modal/Modal'
import { SearchField } from '../../ui/SearchField/SearchField'
import { kindLabel } from '../statusBadge'
import styles from './AddDocumentsModal.module.css'

interface AddDocumentsModalProps {
  open: boolean
  documents: KnowledgeDocument[]
  selectedIds: string[]
  onToggle: (documentId: string) => void
  onClose: () => void
}

/** Library picker used to add documents to a collection. Toggling a row immediately updates membership. */
export function AddDocumentsModal({ open, documents, selectedIds, onToggle, onClose }: AddDocumentsModalProps) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return documents
    return documents.filter((document) => `${document.title} ${document.category} ${document.jurisdiction}`.toLowerCase().includes(normalized))
  }, [documents, query])

  return (
    <Modal open={open} onClose={onClose} title="Add documents to collection" size="lg" bodyClassName={styles.body}>
      <div className={styles.searchRow}>
        <SearchField
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search the library..."
          aria-label="Search the library"
        />
      </div>
      <ul className={styles.list}>
        {filtered.length === 0 && <li className={styles.empty}>No documents match your search.</li>}
        {filtered.map((document) => {
          const selected = selectedIds.includes(document.id)
          return (
            <li key={document.id}>
              <button type="button" className={styles.row} onClick={() => onToggle(document.id)}>
                <span className={styles.rowText}>
                  <span className={styles.rowTitle}>{document.title}</span>
                  <span className={styles.rowMeta}>
                    {kindLabel(document.kind)} · {document.jurisdiction}
                  </span>
                </span>
                <span className={cx(styles.rowToggle, selected && styles.rowToggleActive)} aria-hidden="true">
                  {selected ? <Check size={14} /> : <Plus size={14} />}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </Modal>
  )
}
