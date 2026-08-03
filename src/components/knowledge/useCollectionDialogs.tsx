import { useState } from 'react'
import { useKnowledge } from '../../hooks/useKnowledge'
import type { Collection } from '../../types/knowledge'
import { ConfirmDialog } from '../ui/ConfirmDialog/ConfirmDialog'
import { CollectionFormModal } from './CollectionFormModal/CollectionFormModal'

/**
 * Shared create/rename/delete dialog state for collections, so Knowledge
 * Home and the Collections page manage collection actions identically
 * instead of duplicating modal wiring.
 */
export function useCollectionDialogs() {
  const { createCollection, renameCollection, deleteCollection } = useKnowledge()
  const [createOpen, setCreateOpen] = useState(false)
  const [renameTarget, setRenameTarget] = useState<Collection | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Collection | null>(null)

  const dialogs = (
    <>
      <CollectionFormModal
        open={createOpen}
        mode="create"
        onSubmit={(name, description) => {
          createCollection(name, description)
          setCreateOpen(false)
        }}
        onCancel={() => setCreateOpen(false)}
      />
      <CollectionFormModal
        open={renameTarget !== null}
        mode="rename"
        initialName={renameTarget?.name}
        initialDescription={renameTarget?.description}
        onSubmit={(name, description) => {
          if (renameTarget) renameCollection(renameTarget.id, name, description)
          setRenameTarget(null)
        }}
        onCancel={() => setRenameTarget(null)}
      />
      <ConfirmDialog
        open={deleteTarget !== null}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This can't be undone. Documents inside will remain in the library."
        confirmLabel="Delete collection"
        destructive
        onConfirm={() => {
          if (deleteTarget) deleteCollection(deleteTarget.id)
          setDeleteTarget(null)
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )

  return {
    dialogs,
    openCreate: () => setCreateOpen(true),
    openRename: (collection: Collection) => setRenameTarget(collection),
    openDelete: (collection: Collection) => setDeleteTarget(collection),
  }
}
