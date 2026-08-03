/**
 * Core domain types for the Knowledge Intelligence Platform (Sprint 3).
 *
 * These model a regulatory content library (documents), user-curated
 * collections, and a research-assistant conversation log. All data backing
 * these types is local/static (see `src/data/`) — there is no backend.
 */

/** Distinguishes the three kinds of library content this platform tracks. */
export type DocumentKind = 'regulation' | 'guidance' | 'bulletin'

export type DocumentStatus = 'active' | 'proposed' | 'draft' | 'superseded'

export interface DocumentSection {
  id: string
  heading: string
  /** Nesting level within the table of contents. */
  level: 1 | 2
  paragraphs: string[]
}

export interface KnowledgeDocument {
  id: string
  kind: DocumentKind
  title: string
  summary: string
  jurisdiction: string
  category: string
  status: DocumentStatus
  tags: string[]
  /** ISO 8601 date string. */
  effectiveDate: string
  /** ISO 8601 date string. */
  lastUpdated: string
  version: string
  /** Approximate reading time in minutes, shown alongside metadata. */
  readingTimeMinutes: number
  sections: DocumentSection[]
  relatedDocumentIds: string[]
}

export interface Collection {
  id: string
  name: string
  description: string
  documentIds: string[]
  isFavorite: boolean
  isPinned: boolean
  /** ISO 8601 date string. */
  createdAt: string
  /** ISO 8601 date string. */
  updatedAt: string
}

export interface Citation {
  id: string
  documentId: string
  documentTitle: string
  sectionHeading?: string
  snippet: string
}

export type ResearchMessageRole = 'user' | 'assistant'

export interface ResearchMessage {
  id: string
  role: ResearchMessageRole
  content: string
  citations?: Citation[]
  confidence?: number
  suggestedNextQuestions?: string[]
  relatedCaseHrefs?: string[]
  /** ISO 8601 date string. */
  createdAt: string
}

export interface ResearchThread {
  id: string
  title: string
  messages: ResearchMessage[]
  /** ISO 8601 date string. */
  updatedAt: string
}

export interface SearchMatch {
  documents: KnowledgeDocument[]
  regulations: KnowledgeDocument[]
  collections: Collection[]
}
