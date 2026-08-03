import { createContext } from 'react'
import type {
  AiRecommendation,
  AiWorkspaceSettings,
  Conversation,
  ConversationFolder,
  MemoryItem,
  PromptTemplate,
} from '../types/ai'

export interface CopilotContextValue {
  conversations: Conversation[]
  folders: ConversationFolder[]
  activeConversationId: string | null
  setActiveConversationId: (id: string) => void
  createConversation: (title?: string) => string
  renameConversation: (id: string, title: string) => void
  togglePinned: (id: string) => void
  toggleFavorite: (id: string) => void
  toggleSaved: (id: string) => void
  deleteConversation: (id: string) => void
  sendMessage: (conversationId: string, content: string) => void
  regenerateLastAssistant: (conversationId: string) => void
  continueLastAssistant: (conversationId: string) => void
  isStreaming: boolean

  prompts: PromptTemplate[]
  togglePromptFavorite: (id: string) => void
  duplicatePrompt: (id: string) => PromptTemplate | undefined
  runPrompt: (id: string) => void

  recommendations: AiRecommendation[]
  dismissRecommendation: (id: string) => void

  memory: MemoryItem[]
  settings: AiWorkspaceSettings
  updateSettings: (patch: Partial<AiWorkspaceSettings>) => void

  conversationQuery: string
  setConversationQuery: (value: string) => void
}

export const CopilotContext = createContext<CopilotContextValue | null>(null)
