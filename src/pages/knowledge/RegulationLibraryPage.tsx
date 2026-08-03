import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Library } from 'lucide-react'
import { useKnowledge } from '../../hooks/useKnowledge'
import { useLocalStorageState } from '../../hooks/useLocalStorageState'
import { useSimulatedLoad } from '../../hooks/useSimulatedLoad'
import { ALL_TAGS, CATEGORIES, JURISDICTIONS, STATUSES } from '../../data/documents'
import {
  DEFAULT_DOCUMENT_FILTERS,
  filterDocuments,
  sortDocuments,
  type DocumentFilters,
  type DocumentSortOrder,
} from '../../utils/knowledgeSearch'
import { EmptyKnowledgeState } from '../../components/knowledge/EmptyKnowledgeState/EmptyKnowledgeState'
import { FilterBar } from '../../components/knowledge/FilterBar/FilterBar'
import { KnowledgeGrid } from '../../components/knowledge/KnowledgeGrid/KnowledgeGrid'
import { KnowledgeCard } from '../../components/knowledge/KnowledgeCard/KnowledgeCard'
import { KnowledgeList } from '../../components/knowledge/KnowledgeList/KnowledgeList'
import { KnowledgeToolbar, type KnowledgeViewMode } from '../../components/knowledge/KnowledgeToolbar/KnowledgeToolbar'
import { Button } from '../../components/ui/Button/Button'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { Skeleton } from '../../components/ui/Skeleton/Skeleton'
import styles from './RegulationLibraryPage.module.css'

const SORT_OPTIONS: { value: DocumentSortOrder; label: string }[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'newest', label: 'Recently updated' },
  { value: 'effective-date', label: 'Effective date' },
  { value: 'title-asc', label: 'Title (A–Z)' },
]

const PAGE_SIZE = 9

export function RegulationLibraryPage() {
  const loading = useSimulatedLoad()
  const { documents, favoriteDocumentIds, pinnedDocumentIds, toggleDocumentFavorite, toggleDocumentPinned } =
    useKnowledge()

  const [filters, setFilters] = useState<DocumentFilters>(DEFAULT_DOCUMENT_FILTERS)
  const [sortOrder, setSortOrder] = useState<DocumentSortOrder>('newest')
  const [viewMode, setViewMode] = useLocalStorageState<KnowledgeViewMode>('ri-library-view-mode', 'grid')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => sortDocuments(filterDocuments(documents, filters), sortOrder), [documents, filters, sortOrder])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function updateFilters(next: Partial<DocumentFilters>) {
    setFilters((current) => ({ ...current, ...next }))
    setPage(1)
  }

  function toggleTag(tag: string) {
    updateFilters({ tags: filters.tags.includes(tag) ? filters.tags.filter((t) => t !== tag) : [...filters.tags, tag] })
  }

  if (loading) {
    return (
      <PageContainer>
        <div className={styles.skeletonHeader}>
          <Skeleton height={28} width="30%" />
          <Skeleton height={16} width="55%" />
        </div>
        <div className={styles.skeletonToolbar}>
          <Skeleton height={36} width="280px" />
          <Skeleton height={36} width="168px" />
        </div>
        <div className={styles.skeletonGrid}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={`lib-skeleton-${index}`} height={172} radius="lg" />
          ))}
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        title="Regulation Library"
        description="Search, filter, and browse the full set of regulations, guidance, and bulletins tracked in your workspace."
        icon={<Library size={20} />}
      />

      <div className={styles.controls}>
        <KnowledgeToolbar
          searchValue={filters.query}
          onSearchChange={(value) => updateFilters({ query: value })}
          searchPlaceholder="Search the library..."
          sortValue={sortOrder}
          onSortChange={(value) => setSortOrder(value as DocumentSortOrder)}
          sortOptions={SORT_OPTIONS}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          resultCount={filtered.length}
        />
        <FilterBar
          filters={filters}
          categories={CATEGORIES}
          jurisdictions={JURISDICTIONS}
          statuses={STATUSES}
          tags={ALL_TAGS}
          onCategoryChange={(value) => updateFilters({ category: value })}
          onJurisdictionChange={(value) => updateFilters({ jurisdiction: value })}
          onStatusChange={(value) => updateFilters({ status: value })}
          onToggleTag={toggleTag}
          onClear={() => updateFilters(DEFAULT_DOCUMENT_FILTERS)}
        />
      </div>

      {pageItems.length === 0 ? (
        <EmptyKnowledgeState
          title="No regulations match your filters"
          description="Try a different search term or clear your filters to see the full library."
          action={
            <Button variant="secondary" onClick={() => updateFilters(DEFAULT_DOCUMENT_FILTERS)}>
              Clear filters
            </Button>
          }
        />
      ) : viewMode === 'grid' ? (
        <KnowledgeGrid aria-label="Regulation library results">
          {pageItems.map((document) => (
            <KnowledgeCard
              key={document.id}
              document={document}
              href={`/knowledge/library/${document.id}`}
              isFavorite={favoriteDocumentIds.includes(document.id)}
              isPinned={pinnedDocumentIds.includes(document.id)}
              onToggleFavorite={() => toggleDocumentFavorite(document.id)}
              onTogglePinned={() => toggleDocumentPinned(document.id)}
            />
          ))}
        </KnowledgeGrid>
      ) : (
        <KnowledgeList
          documents={pageItems}
          getHref={(document) => `/knowledge/library/${document.id}`}
          favoriteDocumentIds={favoriteDocumentIds}
          pinnedDocumentIds={pinnedDocumentIds}
          onToggleFavorite={toggleDocumentFavorite}
          onTogglePinned={toggleDocumentPinned}
        />
      )}

      {filtered.length > 0 && (
        <nav className={styles.pagination} aria-label="Pagination">
          <Button
            variant="secondary"
            size="sm"
            leadingIcon={<ChevronLeft size={14} />}
            disabled={currentPage === 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Previous
          </Button>
          <span className={styles.pageIndicator}>
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            trailingIcon={<ChevronRight size={14} />}
            disabled={currentPage === totalPages}
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
          >
            Next
          </Button>
        </nav>
      )}
    </PageContainer>
  )
}
