import type { Collection, KnowledgeDocument } from '../types/knowledge'

function normalize(value: string): string {
  return value.trim().toLowerCase()
}

function matchesDocument(document: KnowledgeDocument, query: string): boolean {
  const haystack = [document.title, document.summary, document.category, document.jurisdiction, ...document.tags]
    .join(' ')
    .toLowerCase()
  return haystack.includes(query)
}

function matchesCollection(collection: Collection, query: string): boolean {
  return `${collection.name} ${collection.description}`.toLowerCase().includes(query)
}

export interface GroupedSearchResults {
  regulations: KnowledgeDocument[]
  guidanceAndBulletins: KnowledgeDocument[]
  collections: Collection[]
}

/**
 * Searches the local knowledge base (documents + collections) for a free-text
 * query and groups the results by content type, mirroring how they're
 * presented in Global Search. Client-side only — no network calls.
 */
export function searchKnowledge(query: string, documents: KnowledgeDocument[], collections: Collection[]): GroupedSearchResults {
  const normalized = normalize(query)
  if (!normalized) return { regulations: [], guidanceAndBulletins: [], collections: [] }

  const matchedDocuments = documents.filter((document) => matchesDocument(document, normalized))

  return {
    regulations: matchedDocuments.filter((document) => document.kind === 'regulation'),
    guidanceAndBulletins: matchedDocuments.filter((document) => document.kind !== 'regulation'),
    collections: collections.filter((collection) => matchesCollection(collection, normalized)),
  }
}

export interface DocumentFilters {
  query: string
  category: string | 'all'
  jurisdiction: string | 'all'
  status: string | 'all'
  tags: string[]
}

export const DEFAULT_DOCUMENT_FILTERS: DocumentFilters = {
  query: '',
  category: 'all',
  jurisdiction: 'all',
  status: 'all',
  tags: [],
}

export type DocumentSortOrder = 'relevance' | 'newest' | 'title-asc' | 'effective-date'

export function filterDocuments(documents: KnowledgeDocument[], filters: DocumentFilters): KnowledgeDocument[] {
  const normalizedQuery = normalize(filters.query)

  return documents.filter((document) => {
    if (normalizedQuery && !matchesDocument(document, normalizedQuery)) return false
    if (filters.category !== 'all' && document.category !== filters.category) return false
    if (filters.jurisdiction !== 'all' && document.jurisdiction !== filters.jurisdiction) return false
    if (filters.status !== 'all' && document.status !== filters.status) return false
    if (filters.tags.length > 0 && !filters.tags.every((tag) => document.tags.includes(tag))) return false
    return true
  })
}

export function sortDocuments(documents: KnowledgeDocument[], order: DocumentSortOrder): KnowledgeDocument[] {
  const sorted = [...documents]
  switch (order) {
    case 'newest':
      return sorted.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
    case 'title-asc':
      return sorted.sort((a, b) => a.title.localeCompare(b.title))
    case 'effective-date':
      return sorted.sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime())
    case 'relevance':
    default:
      return sorted
  }
}
