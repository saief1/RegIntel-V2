import type { Citation, KnowledgeDocument } from '../types/knowledge'

/**
 * Produces a grounded response to a research prompt by matching keywords
 * against the local document library and composing an answer from each
 * match's own summary and top section. This is a deliberately simple,
 * fully client-side heuristic — there is no language model or backend call
 * behind it, in line with Sprint 3's "no real AI" constraint. Every citation
 * always points to a document that actually exists in the library.
 */
export interface ResearchAnswer {
  content: string
  citations: Citation[]
  confidence: number
  suggestedNextQuestions: string[]
  relatedCaseHrefs: string[]
}

const STOP_WORDS = new Set([
  'the',
  'a',
  'an',
  'of',
  'for',
  'and',
  'or',
  'to',
  'in',
  'on',
  'what',
  'which',
  'is',
  'are',
  'how',
  'summarize',
  'summarise',
  'explain',
  'find',
  'related',
  'items',
  'this',
  'that',
  'about',
])

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token))
}

function scoreDocument(document: KnowledgeDocument, tokens: string[]): number {
  const haystack = [document.title, document.summary, document.category, document.jurisdiction, ...document.tags]
    .join(' ')
    .toLowerCase()
  return tokens.reduce((score, token) => (haystack.includes(token) ? score + 1 : score), 0)
}

function buildCitation(document: KnowledgeDocument): Citation {
  const primarySection = document.sections[0]
  return {
    id: `cite-${document.id}-${primarySection?.id ?? 'overview'}`,
    documentId: document.id,
    documentTitle: document.title,
    sectionHeading: primarySection?.heading,
    snippet: primarySection?.paragraphs[0] ?? document.summary,
  }
}

export function answerResearchPrompt(prompt: string, documents: KnowledgeDocument[]): ResearchAnswer {
  const tokens = tokenize(prompt)

  const ranked = documents
    .map((document) => ({ document, score: scoreDocument(document, tokens) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((entry) => entry.document)

  if (ranked.length === 0) {
    return {
      content:
        "I couldn't find a strong match in your knowledge base for that. Try referencing a specific regulation, jurisdiction, or category, or browse the Regulation Library to explore what's tracked.",
      citations: [],
      confidence: 0.42,
      suggestedNextQuestions: [
        "Summarize this year's data privacy changes",
        'What are the new AML beneficial ownership rules?',
      ],
      relatedCaseHrefs: [],
    }
  }

  const [primary, ...rest] = ranked
  const intro =
    ranked.length === 1
      ? `Based on "${primary.title}", here's a summary: ${primary.summary}`
      : `I found ${ranked.length} related items in your knowledge base. The most relevant is "${primary.title}": ${primary.summary}`

  const followUp =
    rest.length > 0
      ? ` Related items worth reviewing: ${rest.map((document) => `"${document.title}"`).join(', ')}.`
      : ''

  const confidence = Math.min(0.92, 0.62 + ranked.length * 0.08 + Math.min(tokens.length, 4) * 0.03)
  const relatedCaseHrefs = inferRelatedCases(prompt)

  return {
    content: `${intro}${followUp}`,
    citations: ranked.map(buildCitation),
    confidence,
    suggestedNextQuestions: [
      `What supporting documents reinforce "${primary.title}"?`,
      'Which open cases are most affected?',
      'What evidence would strengthen this conclusion?',
    ],
    relatedCaseHrefs,
  }
}

function inferRelatedCases(prompt: string): string[] {
  const normalized = prompt.toLowerCase()
  if (normalized.includes('aml') || normalized.includes('beneficial')) return ['/work/cases/case-02']
  if (normalized.includes('transfer') || normalized.includes('privacy') || normalized.includes('cross-border')) {
    return ['/work/cases/case-01']
  }
  if (normalized.includes('incident') || normalized.includes('cyber')) return ['/work/cases/case-03']
  return []
}
