import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import { DOCUMENTS, getDocumentById } from '../data/documents'
import { DEFAULT_COLLECTIONS } from '../data/collections'
import { DEFAULT_RESEARCH_THREADS } from '../data/researchThreads'
import { useLocalStorageState } from '../hooks/useLocalStorageState'
import type { Collection, ResearchThread } from '../types/knowledge'
import { answerResearchPrompt } from '../utils/researchAssistant'
import { createId } from '../utils/id'
import { KnowledgeContext, type KnowledgeContextValue } from './KnowledgeContext'

const MAX_RECENTLY_VIEWED = 12
/** Brief, honest "thinking" delay before the local research heuristic responds — not tied to any backend. */
const RESEARCH_RESPONSE_DELAY_MS = 900

/** Seed activity so a first-time visitor's Knowledge Home doesn't read as empty everywhere at once. */
const DEFAULT_FAVORITE_DOCUMENT_IDS = ['d-01', 'd-07']
const DEFAULT_PINNED_DOCUMENT_IDS = ['d-01', 'd-05', 'd-18']
const DEFAULT_RECENTLY_VIEWED_IDS = ['d-01', 'd-23', 'd-14', 'd-09']
const DEFAULT_READING_PROGRESS: Record<string, number> = { 'd-01': 62, 'd-18': 30, 'd-23': 15 }

export function KnowledgeProvider({ children }: { children: ReactNode }) {
  const [collections, setCollections] = useLocalStorageState<Collection[]>('ri-collections', DEFAULT_COLLECTIONS)
  const [favoriteDocumentIds, setFavoriteDocumentIds] = useLocalStorageState<string[]>(
    'ri-favorite-documents',
    DEFAULT_FAVORITE_DOCUMENT_IDS,
  )
  const [pinnedDocumentIds, setPinnedDocumentIds] = useLocalStorageState<string[]>(
    'ri-pinned-documents',
    DEFAULT_PINNED_DOCUMENT_IDS,
  )
  const [recentlyViewedIds, setRecentlyViewedIds] = useLocalStorageState<string[]>(
    'ri-recently-viewed',
    DEFAULT_RECENTLY_VIEWED_IDS,
  )
  const [readingProgress, setReadingProgressState] = useLocalStorageState<Record<string, number>>(
    'ri-reading-progress',
    DEFAULT_READING_PROGRESS,
  )
  const [researchThreads, setResearchThreads] = useLocalStorageState<ResearchThread[]>(
    'ri-research-threads',
    DEFAULT_RESEARCH_THREADS,
  )
  const [activeThreadId, setActiveThreadId] = useLocalStorageState<string | null>(
    'ri-active-thread',
    DEFAULT_RESEARCH_THREADS[0]?.id ?? null,
  )
  const [isResearching, setIsResearching] = useState(false)
  const responseTimer = useRef<number>(undefined)

  const getDocument = useCallback((id: string) => getDocumentById(id), [])

  const createCollection = useCallback(
    (name: string, description = '') => {
      const now = new Date().toISOString()
      const collection: Collection = {
        id: createId('c'),
        name,
        description,
        documentIds: [],
        isFavorite: false,
        isPinned: false,
        createdAt: now,
        updatedAt: now,
      }
      setCollections((current) => [collection, ...current])
      return collection
    },
    [setCollections],
  )

  const renameCollection = useCallback(
    (id: string, name: string, description?: string) => {
      setCollections((current) =>
        current.map((collection) =>
          collection.id === id
            ? {
                ...collection,
                name,
                description: description ?? collection.description,
                updatedAt: new Date().toISOString(),
              }
            : collection,
        ),
      )
    },
    [setCollections],
  )

  const deleteCollection = useCallback(
    (id: string) => {
      setCollections((current) => current.filter((collection) => collection.id !== id))
    },
    [setCollections],
  )

  const toggleCollectionFavorite = useCallback(
    (id: string) => {
      setCollections((current) =>
        current.map((collection) =>
          collection.id === id ? { ...collection, isFavorite: !collection.isFavorite } : collection,
        ),
      )
    },
    [setCollections],
  )

  const toggleCollectionPinned = useCallback(
    (id: string) => {
      setCollections((current) =>
        current.map((collection) =>
          collection.id === id ? { ...collection, isPinned: !collection.isPinned } : collection,
        ),
      )
    },
    [setCollections],
  )

  const addDocumentToCollection = useCallback(
    (collectionId: string, documentId: string) => {
      setCollections((current) =>
        current.map((collection) =>
          collection.id === collectionId && !collection.documentIds.includes(documentId)
            ? { ...collection, documentIds: [...collection.documentIds, documentId], updatedAt: new Date().toISOString() }
            : collection,
        ),
      )
    },
    [setCollections],
  )

  const removeDocumentFromCollection = useCallback(
    (collectionId: string, documentId: string) => {
      setCollections((current) =>
        current.map((collection) =>
          collection.id === collectionId
            ? {
                ...collection,
                documentIds: collection.documentIds.filter((id) => id !== documentId),
                updatedAt: new Date().toISOString(),
              }
            : collection,
        ),
      )
    },
    [setCollections],
  )

  const moveDocumentToCollection = useCallback(
    (documentId: string, fromCollectionId: string, toCollectionId: string) => {
      setCollections((current) =>
        current.map((collection) => {
          if (collection.id === fromCollectionId) {
            return {
              ...collection,
              documentIds: collection.documentIds.filter((id) => id !== documentId),
              updatedAt: new Date().toISOString(),
            }
          }
          if (collection.id === toCollectionId && !collection.documentIds.includes(documentId)) {
            return {
              ...collection,
              documentIds: [...collection.documentIds, documentId],
              updatedAt: new Date().toISOString(),
            }
          }
          return collection
        }),
      )
    },
    [setCollections],
  )

  const isDocumentFavorite = useCallback((id: string) => favoriteDocumentIds.includes(id), [favoriteDocumentIds])
  const toggleDocumentFavorite = useCallback(
    (id: string) => {
      setFavoriteDocumentIds((current) =>
        current.includes(id) ? current.filter((existing) => existing !== id) : [...current, id],
      )
    },
    [setFavoriteDocumentIds],
  )

  const isDocumentPinned = useCallback((id: string) => pinnedDocumentIds.includes(id), [pinnedDocumentIds])
  const toggleDocumentPinned = useCallback(
    (id: string) => {
      setPinnedDocumentIds((current) =>
        current.includes(id) ? current.filter((existing) => existing !== id) : [...current, id],
      )
    },
    [setPinnedDocumentIds],
  )

  const recordDocumentView = useCallback(
    (id: string) => {
      setRecentlyViewedIds((current) => [id, ...current.filter((existing) => existing !== id)].slice(0, MAX_RECENTLY_VIEWED))
    },
    [setRecentlyViewedIds],
  )

  const setReadingProgress = useCallback(
    (id: string, percent: number) => {
      setReadingProgressState((current) => ({ ...current, [id]: Math.max(current[id] ?? 0, percent) }))
    },
    [setReadingProgressState],
  )

  const createThread = useCallback(() => {
    const thread: ResearchThread = {
      id: createId('rt'),
      title: 'New research thread',
      messages: [],
      updatedAt: new Date().toISOString(),
    }
    setResearchThreads((current) => [thread, ...current])
    setActiveThreadId(thread.id)
    return thread.id
  }, [setResearchThreads, setActiveThreadId])

  const deleteThread = useCallback(
    (id: string) => {
      setResearchThreads((current) => current.filter((thread) => thread.id !== id))
      setActiveThreadId((current) => (current === id ? null : current))
    },
    [setResearchThreads, setActiveThreadId],
  )

  const sendResearchMessage = useCallback(
    (threadId: string, content: string) => {
      const trimmed = content.trim()
      if (!trimmed) return

      const now = new Date().toISOString()
      setResearchThreads((current) =>
        current.map((thread) =>
          thread.id === threadId
            ? {
                ...thread,
                title: thread.messages.length === 0 ? trimmed.slice(0, 60) : thread.title,
                messages: [...thread.messages, { id: createId('msg'), role: 'user', content: trimmed, createdAt: now }],
                updatedAt: now,
              }
            : thread,
        ),
      )

      setIsResearching(true)
      window.clearTimeout(responseTimer.current)
      responseTimer.current = window.setTimeout(() => {
        const answer = answerResearchPrompt(trimmed, DOCUMENTS)
        setResearchThreads((current) =>
          current.map((thread) =>
            thread.id === threadId
              ? {
                  ...thread,
                  messages: [
                    ...thread.messages,
                    {
                      id: createId('msg'),
                      role: 'assistant',
                      content: answer.content,
                      citations: answer.citations,
                      createdAt: new Date().toISOString(),
                    },
                  ],
                  updatedAt: new Date().toISOString(),
                }
              : thread,
          ),
        )
        setIsResearching(false)
      }, RESEARCH_RESPONSE_DELAY_MS)
    },
    [setResearchThreads],
  )

  const value = useMemo<KnowledgeContextValue>(
    () => ({
      documents: DOCUMENTS,
      getDocument,
      collections,
      createCollection,
      renameCollection,
      deleteCollection,
      toggleCollectionFavorite,
      toggleCollectionPinned,
      addDocumentToCollection,
      removeDocumentFromCollection,
      moveDocumentToCollection,
      favoriteDocumentIds,
      isDocumentFavorite,
      toggleDocumentFavorite,
      pinnedDocumentIds,
      isDocumentPinned,
      toggleDocumentPinned,
      recentlyViewedIds,
      recordDocumentView,
      readingProgress,
      setReadingProgress,
      researchThreads,
      activeThreadId,
      setActiveThreadId,
      createThread,
      deleteThread,
      sendResearchMessage,
      isResearching,
    }),
    [
      getDocument,
      collections,
      createCollection,
      renameCollection,
      deleteCollection,
      toggleCollectionFavorite,
      toggleCollectionPinned,
      addDocumentToCollection,
      removeDocumentFromCollection,
      moveDocumentToCollection,
      favoriteDocumentIds,
      isDocumentFavorite,
      toggleDocumentFavorite,
      pinnedDocumentIds,
      isDocumentPinned,
      toggleDocumentPinned,
      recentlyViewedIds,
      recordDocumentView,
      readingProgress,
      setReadingProgress,
      researchThreads,
      activeThreadId,
      setActiveThreadId,
      createThread,
      deleteThread,
      sendResearchMessage,
      isResearching,
    ],
  )

  return <KnowledgeContext.Provider value={value}>{children}</KnowledgeContext.Provider>
}
