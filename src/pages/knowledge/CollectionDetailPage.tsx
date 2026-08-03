import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Bookmark, ChevronLeft, FolderOpen, MoreHorizontal, Pencil, Pin, Plus, Trash2 } from 'lucide-react'
import { useKnowledge } from '../../hooks/useKnowledge'
import { AddDocumentsModal } from '../../components/knowledge/AddDocumentsModal/AddDocumentsModal'
import { EmptyKnowledgeState } from '../../components/knowledge/EmptyKnowledgeState/EmptyKnowledgeState'
import { KnowledgeList } from '../../components/knowledge/KnowledgeList/KnowledgeList'
import { useCollectionDialogs } from '../../components/knowledge/useCollectionDialogs'
import { Button } from '../../components/ui/Button/Button'
import { Dropdown } from '../../components/ui/Dropdown/Dropdown'
import { DropdownItem, DropdownLabel, DropdownSeparator } from '../../components/ui/Dropdown/DropdownItem'
import { IconButton } from '../../components/ui/IconButton/IconButton'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { Tooltip } from '../../components/ui/Tooltip/Tooltip'
import styles from './CollectionDetailPage.module.css'

export function CollectionDetailPage() {
  const { collectionId } = useParams<{ collectionId: string }>()
  const navigate = useNavigate()
  const {
    collections,
    documents,
    favoriteDocumentIds,
    pinnedDocumentIds,
    toggleDocumentFavorite,
    toggleDocumentPinned,
    toggleCollectionFavorite,
    toggleCollectionPinned,
    addDocumentToCollection,
    removeDocumentFromCollection,
    moveDocumentToCollection,
  } = useKnowledge()
  const { dialogs, openRename, openDelete } = useCollectionDialogs()
  const [addModalOpen, setAddModalOpen] = useState(false)

  const collection = collections.find((candidate) => candidate.id === collectionId)

  if (!collection) {
    return (
      <div className={styles.notFound}>
        <EmptyKnowledgeState
          title="Collection not found"
          description="This collection may have been deleted or the link is out of date."
          action={
            <Button variant="secondary" onClick={() => navigate('/knowledge/collections')}>
              Back to collections
            </Button>
          }
        />
      </div>
    )
  }

  const collectionDocuments = collection.documentIds
    .map((id) => documents.find((document) => document.id === id))
    .filter((document): document is NonNullable<typeof document> => Boolean(document))

  const otherCollections = collections.filter((candidate) => candidate.id !== collection.id)

  return (
    <PageContainer>
      <Link to="/knowledge/collections" className={styles.backLink}>
        <ChevronLeft size={14} aria-hidden="true" />
        Collections
      </Link>

      <PageHeader
        title={collection.name}
        description={collection.description || 'No description yet.'}
        icon={<FolderOpen size={20} />}
        actions={
          <>
            <Tooltip content={collection.isPinned ? 'Unpin collection' : 'Pin collection'} side="bottom">
              <IconButton
                label={collection.isPinned ? 'Unpin collection' : 'Pin collection'}
                aria-pressed={collection.isPinned}
                className={collection.isPinned ? styles.actionActive : undefined}
                onClick={() => toggleCollectionPinned(collection.id)}
              >
                <Pin size={16} fill={collection.isPinned ? 'currentColor' : 'none'} />
              </IconButton>
            </Tooltip>
            <Tooltip content={collection.isFavorite ? 'Remove from favorites' : 'Add to favorites'} side="bottom">
              <IconButton
                label={collection.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                aria-pressed={collection.isFavorite}
                className={collection.isFavorite ? styles.actionActive : undefined}
                onClick={() => toggleCollectionFavorite(collection.id)}
              >
                <Bookmark size={16} fill={collection.isFavorite ? 'currentColor' : 'none'} />
              </IconButton>
            </Tooltip>
            <Dropdown
              align="end"
              trigger={
                <IconButton label="Collection options">
                  <MoreHorizontal size={16} />
                </IconButton>
              }
            >
              {(close) => (
                <>
                  <DropdownItem
                    icon={<Pencil size={14} />}
                    onClick={() => {
                      close()
                      openRename(collection)
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
                      openDelete(collection)
                    }}
                  >
                    Delete collection
                  </DropdownItem>
                </>
              )}
            </Dropdown>
            <Button variant="primary" leadingIcon={<Plus size={14} />} onClick={() => setAddModalOpen(true)}>
              Add documents
            </Button>
          </>
        }
      />

      {collectionDocuments.length === 0 ? (
        <EmptyKnowledgeState
          icon={<FolderOpen size={20} />}
          title="This collection is empty"
          description="Add regulations from the library to start building this collection."
          action={
            <Button variant="secondary" leadingIcon={<Plus size={14} />} onClick={() => setAddModalOpen(true)}>
              Add documents
            </Button>
          }
        />
      ) : (
        <KnowledgeList
          documents={collectionDocuments}
          getHref={(document) => `/knowledge/library/${document.id}`}
          favoriteDocumentIds={favoriteDocumentIds}
          pinnedDocumentIds={pinnedDocumentIds}
          onToggleFavorite={toggleDocumentFavorite}
          onTogglePinned={toggleDocumentPinned}
          renderRowActions={(document) => (
            <Dropdown
              align="end"
              trigger={
                <IconButton label={`More options for ${document.title}`}>
                  <MoreHorizontal size={14} />
                </IconButton>
              }
            >
              {(close) => (
                <>
                  {otherCollections.length > 0 && (
                    <>
                      <DropdownLabel>Move to</DropdownLabel>
                      {otherCollections.map((target) => (
                        <DropdownItem
                          key={target.id}
                          onClick={() => {
                            close()
                            moveDocumentToCollection(document.id, collection.id, target.id)
                          }}
                        >
                          {target.name}
                        </DropdownItem>
                      ))}
                      <DropdownSeparator />
                    </>
                  )}
                  <DropdownItem
                    icon={<Trash2 size={14} />}
                    destructive
                    onClick={() => {
                      close()
                      removeDocumentFromCollection(collection.id, document.id)
                    }}
                  >
                    Remove from collection
                  </DropdownItem>
                </>
              )}
            </Dropdown>
          )}
        />
      )}

      <AddDocumentsModal
        open={addModalOpen}
        documents={documents}
        selectedIds={collection.documentIds}
        onToggle={(documentId) =>
          collection.documentIds.includes(documentId)
            ? removeDocumentFromCollection(collection.id, documentId)
            : addDocumentToCollection(collection.id, documentId)
        }
        onClose={() => setAddModalOpen(false)}
      />
      {dialogs}
    </PageContainer>
  )
}
