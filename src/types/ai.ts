/**
 * Domain types for the AI Copilot Workspace (Sprint 5).
 * Local/mock only — structured for future OpenAI/Claude/Gemini adapters.
 */

export type PromptCategoryId =
  | 'investigation'
  | 'research'
  | 'risk'
  | 'compliance'
  | 'policies'
  | 'reporting'
  | 'drafting'

export type CitationKind = 'regulation' | 'document' | 'evidence' | 'case'
export type RecommendationPriority = 'low' | 'medium' | 'high' | 'urgent'
export type RecommendationKind =
  | 'missing_evidence'
  | 'high_risk_regulation'
  | 'incomplete_review'
  | 'upcoming_deadline'
  | 'duplicate_case'
  | 'suggested_workflow'

export type ChatRole = 'user' | 'assistant' | 'system'

export interface AiCitation {
  id: string
  kind: CitationKind
  title: string
  subtitle?: string
  /** Route path within the app, e.g. /knowledge/library/d-01 */
  href: string
  snippet?: string
}

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  createdAt: string
  citations?: AiCitation[]
  confidence?: number
  isStreaming?: boolean
}

export interface ConversationFolder {
  id: string
  name: string
}

export interface Conversation {
  id: string
  title: string
  folderId?: string
  isPinned: boolean
  isFavorite: boolean
  isSaved: boolean
  updatedAt: string
  createdAt: string
  messages: ChatMessage[]
  followUps: string[]
  citationIds: string[]
  relatedDocumentIds: string[]
  relatedCaseIds: string[]
  relatedEvidenceIds: string[]
  confidence?: number
}

export interface PromptTemplate {
  id: string
  title: string
  description: string
  category: PromptCategoryId
  prompt: string
  isFavorite: boolean
}

export interface AiRecommendation {
  id: string
  kind: RecommendationKind
  title: string
  reason: string
  priority: RecommendationPriority
  confidence: number
  actionLabel: string
  href: string
  dismissed?: boolean
}

export interface MemoryItem {
  id: string
  kind: 'conversation' | 'knowledge' | 'evidence' | 'bookmark' | 'regulation' | 'search'
  title: string
  detail: string
  href?: string
  createdAt: string
  pinned?: boolean
}

export interface AiWorkspaceSettings {
  temperature: number
  responseLength: 'concise' | 'balanced' | 'detailed'
  citationMode: 'inline' | 'footnote' | 'panel'
  autoReferences: boolean
  autoSuggestions: boolean
  theme: 'system' | 'light' | 'dark'
}

export const DEFAULT_AI_SETTINGS: AiWorkspaceSettings = {
  temperature: 0.4,
  responseLength: 'balanced',
  citationMode: 'panel',
  autoReferences: true,
  autoSuggestions: true,
  theme: 'system',
}
