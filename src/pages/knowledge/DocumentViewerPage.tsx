import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Bookmark, ChevronLeft, FolderPlus, Highlighter, NotebookPen, Pin } from 'lucide-react'
import { useKnowledge } from '../../hooks/useKnowledge'
import { useScrollProgress } from '../../hooks/useScrollProgress'
import { DocumentMeta } from '../../components/knowledge/DocumentMeta/DocumentMeta'
import { EmptyKnowledgeState } from '../../components/knowledge/EmptyKnowledgeState/EmptyKnowledgeState'
import { KnowledgeCard } from '../../components/knowledge/KnowledgeCard/KnowledgeCard'
import { KnowledgeGrid } from '../../components/knowledge/KnowledgeGrid/KnowledgeGrid'
import { StickyTOC } from '../../components/knowledge/StickyTOC/StickyTOC'
import { Button } from '../../components/ui/Button/Button'
import { Dropdown } from '../../components/ui/Dropdown/Dropdown'
import { DropdownItem, DropdownLabel } from '../../components/ui/Dropdown/DropdownItem'
import { IconButton } from '../../components/ui/IconButton/IconButton'
import { Panel } from '../../components/ui/Panel/Panel'
import { Tooltip } from '../../components/ui/Tooltip/Tooltip'
import styles from './DocumentViewerPage.module.css'

export function DocumentViewerPage() {
  const { documentId } = useParams<{ documentId: string }>()
  const navigate = useNavigate()
  const {
    getDocument,
    documents,
    collections,
    favoriteDocumentIds,
    pinnedDocumentIds,
    toggleDocumentFavorite,
    toggleDocumentPinned,
    recordDocumentView,
    setReadingProgress,
    addDocumentToCollection,
    removeDocumentFromCollection,
  } = useKnowledge()

  const document = documentId ? getDocument(documentId) : undefined
  const articleRef = useRef<HTMLDivElement>(null)
  const scrollProgress = useScrollProgress(articleRef)
  const [activeSectionId, setActiveSectionId] = useState<string | null>(document?.sections[0]?.id ?? null)
  const sectionRefs = useRef(new Map<string, HTMLElement>())

  useEffect(() => {
    if (document) recordDocumentView(document.id)
  }, [document, recordDocumentView])

  useEffect(() => {
    if (!document) return
    setReadingProgress(document.id, scrollProgress)
  }, [document, scrollProgress, setReadingProgress])

  useEffect(() => {
    if (!document) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActiveSectionId(visible[0].target.id)
      },
      { rootMargin: '-96px 0px -70% 0px', threshold: 0 },
    )
    sectionRefs.current.forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [document])

  const relatedDocuments = useMemo(() => {
    if (!document) return []
    return document.relatedDocumentIds.map((id) => documents.find((candidate) => candidate.id === id)).filter((candidate): candidate is NonNullable<typeof candidate> => Boolean(candidate))
  }, [document, documents])

  if (!document) {
    return (
      <div className={styles.notFound}>
        <EmptyKnowledgeState
          title="Document not found"
          description="This regulation may have been removed or the link is out of date."
          action={
            <Button variant="secondary" onClick={() => navigate('/knowledge/library')}>
              Back to library
            </Button>
          }
        />
      </div>
    )
  }

  const isFavorite = favoriteDocumentIds.includes(document.id)
  const isPinned = pinnedDocumentIds.includes(document.id)

  function scrollToSection(id: string) {
    sectionRefs.current.get(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className={styles.page} ref={articleRef}>
      <div className={styles.container}>
        <Link to="/knowledge/library" className={styles.backLink}>
          <ChevronLeft size={14} aria-hidden="true" />
          Regulation Library
        </Link>

        <header className={styles.header}>
          <h1 className={styles.title}>{document.title}</h1>
          <p className={styles.summary}>{document.summary}</p>

          <div className={styles.headerRow}>
            <DocumentMeta document={document} />
            <div className={styles.headerActions}>
              <Tooltip content={isPinned ? 'Unpin regulation' : 'Pin regulation'} side="bottom">
                <IconButton
                  label={isPinned ? 'Unpin regulation' : 'Pin regulation'}
                  aria-pressed={isPinned}
                  className={isPinned ? styles.actionActive : undefined}
                  onClick={() => toggleDocumentPinned(document.id)}
                >
                  <Pin size={16} fill={isPinned ? 'currentColor' : 'none'} />
                </IconButton>
              </Tooltip>
              <Tooltip content={isFavorite ? 'Remove from favorites' : 'Add to favorites'} side="bottom">
                <IconButton
                  label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  aria-pressed={isFavorite}
                  className={isFavorite ? styles.actionActive : undefined}
                  onClick={() => toggleDocumentFavorite(document.id)}
                >
                  <Bookmark size={16} fill={isFavorite ? 'currentColor' : 'none'} />
                </IconButton>
              </Tooltip>
              <Dropdown
                align="end"
                width={240}
                trigger={
                  <Button variant="secondary" size="sm" leadingIcon={<FolderPlus size={14} />}>
                    Add to collection
                  </Button>
                }
              >
                <DropdownLabel>Collections</DropdownLabel>
                {collections.length === 0 ? (
                  <p className={styles.noCollections}>No collections yet.</p>
                ) : (
                  collections.map((collection) => {
                    const inCollection = collection.documentIds.includes(document.id)
                    return (
                      <DropdownItem
                        key={collection.id}
                        onClick={() =>
                          inCollection
                            ? removeDocumentFromCollection(collection.id, document.id)
                            : addDocumentToCollection(collection.id, document.id)
                        }
                      >
                        <span className={styles.collectionOption}>
                          <span
                            className={styles.collectionCheckbox}
                            data-checked={inCollection || undefined}
                            aria-hidden="true"
                          />
                          {collection.name}
                        </span>
                      </DropdownItem>
                    )
                  })
                )}
              </Dropdown>
            </div>
          </div>
        </header>

        <div className={styles.layout}>
          <article className={styles.article}>
            {document.sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                ref={(element) => {
                  if (element) sectionRefs.current.set(section.id, element)
                  else sectionRefs.current.delete(section.id)
                }}
                className={styles.section}
              >
                {section.level === 1 ? (
                  <h2 className={styles.sectionHeadingL1}>{section.heading}</h2>
                ) : (
                  <h3 className={styles.sectionHeadingL2}>{section.heading}</h3>
                )}
                {section.paragraphs.map((paragraph, index) => (
                  <p key={`${section.id}-p${index}`} className={styles.paragraph}>
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}

            {relatedDocuments.length > 0 && (
              <section className={styles.relatedSection} aria-labelledby="related-regulations-heading">
                <h2 id="related-regulations-heading" className={styles.sectionHeadingL1}>
                  Related Regulations
                </h2>
                <KnowledgeGrid>
                  {relatedDocuments.map((related) => (
                    <KnowledgeCard
                      key={related.id}
                      document={related}
                      href={`/knowledge/library/${related.id}`}
                      isFavorite={favoriteDocumentIds.includes(related.id)}
                      isPinned={pinnedDocumentIds.includes(related.id)}
                      onToggleFavorite={() => toggleDocumentFavorite(related.id)}
                      onTogglePinned={() => toggleDocumentPinned(related.id)}
                    />
                  ))}
                </KnowledgeGrid>
              </section>
            )}
          </article>

          <aside className={styles.rail} aria-label="Document tools">
            <StickyTOC sections={document.sections} activeId={activeSectionId} onSelect={scrollToSection} />

            <Panel title="Highlights" icon={<Highlighter size={16} />} className={styles.railPanel}>
              <p className={styles.railEmpty}>Highlighting is coming soon. Select text in the reading area to mark key passages.</p>
            </Panel>

            <Panel title="Notes" icon={<NotebookPen size={16} />} className={styles.railPanel}>
              <p className={styles.railEmpty}>Notes are coming soon. Attach commentary to this regulation for your team.</p>
            </Panel>
          </aside>
        </div>
      </div>
    </div>
  )
}
