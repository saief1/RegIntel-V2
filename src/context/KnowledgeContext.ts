import { createContext } from 'react'
import type { Collection, KnowledgeDocument, ResearchThread } from '../types/knowledge'

export interface KnowledgeContextValue {
  documents: KnowledgeDocument[]
  getDocument: (id: string) => KnowledgeDocument | undefined

  collections: Collection[]
  createCollection: (name: string, description?: string) => Collection
  renameCollection: (id: string, name: string, description?: string) => void
  deleteCollection: (id: string) => void
  toggleCollectionFavorite: (id: string) => void
  toggleCollectionPinned: (id: string) => void
  addDocumentToCollection: (collectionId: string, documentId: string) => void
  removeDocumentFromCollection: (collectionId: string, documentId: string) => void
  moveDocumentToCollection: (documentId: string, fromCollectionId: string, toCollectionId: string) => void

  favoriteDocumentIds: string[]
  isDocumentFavorite: (id: string) => boolean
  toggleDocumentFavorite: (id: string) => void

  pinnedDocumentIds: string[]
  isDocumentPinned: (id: string) => boolean
  toggleDocumentPinned: (id: string) => void

  recentlyViewedIds: string[]
  recordDocumentView: (id: string) => void

  readingProgress: Record<string, number>
  setReadingProgress: (id: string, percent: number) => void

  researchThreads: ResearchThread[]
  activeThreadId: string | null
  setActiveThreadId: (id: string) => void
  createThread: () => string
  deleteThread: (id: string) => void
  sendResearchMessage: (threadId: string, content: string) => void
  isResearching: boolean
}

export const KnowledgeContext = createContext<KnowledgeContextValue | null>(null)
