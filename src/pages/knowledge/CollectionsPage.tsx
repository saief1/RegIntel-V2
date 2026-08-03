import { useMemo, useState } from 'react'
import { FolderOpen, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useKnowledge } from '../../hooks/useKnowledge'
import { useLocalStorageState } from '../../hooks/useLocalStorageState'
import { useSimulatedLoad } from '../../hooks/useSimulatedLoad'
import { CollectionCard } from '../../components/knowledge/CollectionCard/CollectionCard'
import { EmptyKnowledgeState } from '../../components/knowledge/EmptyKnowledgeState/EmptyKnowledgeState'
import { KnowledgeGrid } from '../../components/knowledge/KnowledgeGrid/KnowledgeGrid'
import { KnowledgeToolbar, type KnowledgeViewMode } from '../../components/knowledge/KnowledgeToolbar/KnowledgeToolbar'
import { useCollectionDialogs } from '../../components/knowledge/useCollectionDialogs'
import { Badge } from '../../components/ui/Badge/Badge'
import { Button } from '../../components/ui/Button/Button'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { Skeleton } from '../../components/ui/Skeleton/Skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '../../components/ui/Table/Table'
import { formatRelativeTime } from '../../utils/date'
import styles from './CollectionsPage.module.css'

type SortOrder = 'updated' | 'created' | 'name'

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: 'updated', label: 'Recently updated' },
  { value: 'created', label: 'Recently created' },
  { value: 'name', label: 'Name (A–Z)' },
]

export function CollectionsPage() {
  const loading = useSimulatedLoad()
  const { collections, toggleCollectionFavorite, toggleCollectionPinned } = useKnowledge()
  const { dialogs, openCreate, openRename, openDelete } = useCollectionDialogs()

  const [query, setQuery] = useState('')
  const [sortOrder, setSortOrder] = useState<SortOrder>('updated')
  const [viewMode, setViewMode] = useLocalStorageState<KnowledgeViewMode>('ri-collections-view-mode', 'grid')

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    const result = normalized
      ? collections.filter((collection) => `${collection.name} ${collection.description}`.toLowerCase().includes(normalized))
      : [...collections]

    return result.sort((a, b) => {
      if (sortOrder === 'name') return a.name.localeCompare(b.name)
      if (sortOrder === 'created') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })
  }, [collections, query, sortOrder])

  if (loading) {
    return (
      <PageContainer>
        <div className={styles.skeletonHeader}>
          <Skeleton height={28} width="30%" />
          <Skeleton height={16} width="50%" />
        </div>
        <div className={styles.skeletonGrid}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={`collections-skeleton-${index}`} height={140} radius="lg" />
          ))}
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        title="Collections"
        description="Organize regulations into working sets for a project, review cycle, or team."
        icon={<FolderOpen size={20} />}
        actions={
          <Button variant="primary" leadingIcon={<Plus size={14} />} onClick={openCreate}>
            New collection
          </Button>
        }
      />

      {collections.length > 0 && (
        <div className={styles.toolbar}>
          <KnowledgeToolbar
            searchValue={query}
            onSearchChange={setQuery}
            searchPlaceholder="Search collections..."
            sortValue={sortOrder}
            onSortChange={(value) => setSortOrder(value as SortOrder)}
            sortOptions={SORT_OPTIONS}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            resultCount={filtered.length}
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyKnowledgeState
          icon={<FolderOpen size={20} />}
          title={collections.length === 0 ? 'No collections yet' : 'No collections match your search'}
          description={
            collections.length === 0
              ? 'Create your first collection to start organizing regulations.'
              : 'Try a different search term.'
          }
          action={
            collections.length === 0 && (
              <Button variant="secondary" leadingIcon={<Plus size={14} />} onClick={openCreate}>
                New collection
              </Button>
            )
          }
        />
      ) : viewMode === 'grid' ? (
        <KnowledgeGrid aria-label="Collections">
          {filtered.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              href={`/knowledge/collections/${collection.id}`}
              onToggleFavorite={() => toggleCollectionFavorite(collection.id)}
              onTogglePinned={() => toggleCollectionPinned(collection.id)}
              onRename={() => openRename(collection)}
              onDelete={() => openDelete(collection)}
            />
          ))}
        </KnowledgeGrid>
      ) : (
        <Table aria-label="Collections">
          <TableHead>
            <TableRow>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Items</TableHeaderCell>
              <TableHeaderCell>Updated</TableHeaderCell>
              <TableHeaderCell aria-label="Status" />
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((collection) => (
              <TableRow key={collection.id}>
                <TableCell>
                  <Link to={`/knowledge/collections/${collection.id}`} className={styles.nameLink}>
                    {collection.name}
                  </Link>
                </TableCell>
                <TableCell>{collection.documentIds.length}</TableCell>
                <TableCell>{formatRelativeTime(collection.updatedAt)}</TableCell>
                <TableCell>
                  <div className={styles.badgeRow}>
                    {collection.isPinned && <Badge variant="accent">Pinned</Badge>}
                    {collection.isFavorite && <Badge variant="neutral">Favorite</Badge>}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {dialogs}
    </PageContainer>
  )
}
