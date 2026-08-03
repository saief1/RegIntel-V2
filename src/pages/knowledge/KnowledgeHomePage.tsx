import { BookOpen, Bookmark, Clock, FolderOpen, Pin, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useKnowledge } from '../../hooks/useKnowledge'
import { useSimulatedLoad } from '../../hooks/useSimulatedLoad'
import { recommendDocuments } from '../../utils/recommendations'
import { CollectionCard } from '../../components/knowledge/CollectionCard/CollectionCard'
import { EmptyKnowledgeState } from '../../components/knowledge/EmptyKnowledgeState/EmptyKnowledgeState'
import { KnowledgeCard } from '../../components/knowledge/KnowledgeCard/KnowledgeCard'
import { KnowledgeGrid } from '../../components/knowledge/KnowledgeGrid/KnowledgeGrid'
import { useCollectionDialogs } from '../../components/knowledge/useCollectionDialogs'
import { Button } from '../../components/ui/Button/Button'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { Skeleton } from '../../components/ui/Skeleton/Skeleton'
import { KnowledgeHomeSection } from './KnowledgeHomeSection'
import styles from './KnowledgeHomePage.module.css'

const SECTION_LIMIT = 4

export function KnowledgeHomePage() {
  const navigate = useNavigate()
  const loading = useSimulatedLoad()
  const {
    documents,
    collections,
    favoriteDocumentIds,
    pinnedDocumentIds,
    recentlyViewedIds,
    readingProgress,
    toggleDocumentFavorite,
    toggleDocumentPinned,
    toggleCollectionFavorite,
    toggleCollectionPinned,
  } = useKnowledge()
  const { dialogs, openCreate, openRename, openDelete } = useCollectionDialogs()

  const documentById = new Map(documents.map((document) => [document.id, document]))

  const continueReading = recentlyViewedIds
    .map((id) => documentById.get(id))
    .filter((document): document is NonNullable<typeof document> => Boolean(document))
    .filter((document) => {
      const progress = readingProgress[document.id] ?? 0
      return progress > 0 && progress < 98
    })
    .slice(0, SECTION_LIMIT)

  const pinnedDocuments = pinnedDocumentIds
    .map((id) => documentById.get(id))
    .filter((document): document is NonNullable<typeof document> => Boolean(document))
    .slice(0, SECTION_LIMIT)

  const favoriteDocuments = favoriteDocumentIds
    .map((id) => documentById.get(id))
    .filter((document): document is NonNullable<typeof document> => Boolean(document))
    .slice(0, SECTION_LIMIT)

  const recentlyViewedDocuments = recentlyViewedIds
    .map((id) => documentById.get(id))
    .filter((document): document is NonNullable<typeof document> => Boolean(document))
    .slice(0, SECTION_LIMIT)

  const recommendedDocuments = recommendDocuments(
    documents,
    [...pinnedDocumentIds, ...favoriteDocumentIds, ...recentlyViewedIds],
    [...pinnedDocumentIds, ...favoriteDocumentIds],
    SECTION_LIMIT,
  )

  const recentDocuments = [...documents]
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
    .slice(0, SECTION_LIMIT)

  const featuredCollections = [...collections]
    .sort((a, b) => Number(b.isPinned) - Number(a.isPinned) || Number(b.isFavorite) - Number(a.isFavorite))
    .slice(0, SECTION_LIMIT)

  function renderDocumentGrid(items: typeof documents, emptyProps: { title: string; description: string; icon?: ReactNode }) {
    if (items.length === 0) {
      return <EmptyKnowledgeState {...emptyProps} />
    }
    return (
      <KnowledgeGrid>
        {items.map((document) => (
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
    )
  }

  if (loading) {
    return (
      <PageContainer>
        <div className={styles.skeletonHeader}>
          <Skeleton height={28} width="30%" />
          <Skeleton height={16} width="50%" />
        </div>
        <div className={styles.skeletonSections}>
          {['continue-reading', 'pinned', 'recommended'].map((sectionKey) => (
            <div key={sectionKey} className={styles.skeletonSection}>
              <Skeleton height={20} width="20%" />
              <div className={styles.skeletonGrid}>
                <Skeleton height={148} radius="lg" />
                <Skeleton height={148} radius="lg" />
                <Skeleton height={148} radius="lg" />
                <Skeleton height={148} radius="lg" />
              </div>
            </div>
          ))}
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        title="Library"
        description="Your centralized compliance knowledge and governance hub."
        icon={<BookOpen size={20} />}
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate('/knowledge/policies')}>
              Policy Workspace
            </Button>
            <Button variant="secondary" onClick={() => navigate('/knowledge/collections')}>
              Collections
            </Button>
            <Button variant="primary" onClick={() => navigate('/knowledge/library')}>
              Browse library
            </Button>
          </>
        }
      />

      <div className={styles.sections}>
        <KnowledgeHomeSection title="Continue reading" description="Pick up where you left off.">
          {renderDocumentGrid(continueReading, {
            icon: <Clock size={20} />,
            title: 'Nothing in progress',
            description: 'Documents you start reading will appear here so you can pick back up.',
          })}
        </KnowledgeHomeSection>

        <KnowledgeHomeSection title="Pinned regulations" seeAllHref="/knowledge/library" seeAllLabel="Browse library">
          {renderDocumentGrid(pinnedDocuments, {
            icon: <Pin size={20} />,
            title: 'No pinned regulations yet',
            description: 'Pin regulations from the library or document viewer to track them here.',
          })}
        </KnowledgeHomeSection>

        <KnowledgeHomeSection title="Recommended for you" description="Related to what you've recently tracked.">
          {renderDocumentGrid(recommendedDocuments, {
            icon: <Sparkles size={20} />,
            title: 'No recommendations yet',
            description: 'Pin or favorite a few regulations and recommendations will appear here.',
          })}
        </KnowledgeHomeSection>

        <KnowledgeHomeSection title="Recently viewed">
          {renderDocumentGrid(recentlyViewedDocuments, {
            icon: <Clock size={20} />,
            title: 'No recent activity',
            description: 'Documents you open will show up here for quick access.',
          })}
        </KnowledgeHomeSection>

        <KnowledgeHomeSection title="Favorites">
          {renderDocumentGrid(favoriteDocuments, {
            icon: <Bookmark size={20} />,
            title: 'No favorites yet',
            description: 'Favorite regulations from the library to build a shortlist here.',
          })}
        </KnowledgeHomeSection>

        <KnowledgeHomeSection title="Collections" seeAllHref="/knowledge/collections">
          {featuredCollections.length === 0 ? (
            <EmptyKnowledgeState
              icon={<FolderOpen size={20} />}
              title="No collections yet"
              description="Create a collection to organize regulations around a project or workstream."
              action={
                <Button variant="secondary" onClick={openCreate}>
                  Create a collection
                </Button>
              }
            />
          ) : (
            <KnowledgeGrid>
              {featuredCollections.map((collection) => (
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
          )}
        </KnowledgeHomeSection>

        <KnowledgeHomeSection title="Recent documents" seeAllHref="/knowledge/library" description="Newest updates across the library.">
          {renderDocumentGrid(recentDocuments, {
            icon: <BookOpen size={20} />,
            title: 'No documents yet',
            description: 'Documents will appear here once added to the library.',
          })}
        </KnowledgeHomeSection>
      </div>
      {dialogs}
    </PageContainer>
  )
}
