import type { KnowledgeDocument } from '../types/knowledge'

/**
 * Suggests documents related to a set of "seed" documents (e.g. recently
 * viewed or pinned) by scoring shared category/jurisdiction overlap. This is
 * a simple, fully local heuristic — not a model or backend call — used to
 * power the Knowledge Home "AI Recommendations" section.
 */
export function recommendDocuments(
  documents: KnowledgeDocument[],
  seedIds: string[],
  excludeIds: string[],
  limit = 4,
): KnowledgeDocument[] {
  const seedDocuments = documents.filter((document) => seedIds.includes(document.id))
  const categories = new Set(seedDocuments.map((document) => document.category))
  const jurisdictions = new Set(seedDocuments.map((document) => document.jurisdiction))
  const excluded = new Set(excludeIds)

  const scored = documents
    .filter((document) => !excluded.has(document.id))
    .map((document) => ({
      document,
      score:
        (categories.has(document.category) ? 1 : 0) +
        (jurisdictions.has(document.jurisdiction) ? 1 : 0) +
        (document.status === 'active' ? 0.5 : 0),
    }))

  scored.sort(
    (a, b) => b.score - a.score || new Date(b.document.lastUpdated).getTime() - new Date(a.document.lastUpdated).getTime(),
  )

  return scored.slice(0, limit).map((entry) => entry.document)
}
