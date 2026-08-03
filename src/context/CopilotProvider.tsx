import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import { CONVERSATION_FOLDERS, DEFAULT_CONVERSATIONS } from '../data/ai/conversations'
import { AI_MEMORY } from '../data/ai/memory'
import { PROMPT_TEMPLATES } from '../data/ai/prompts'
import { AI_RECOMMENDATIONS } from '../data/ai/recommendations'
import { useLocalStorageState } from '../hooks/useLocalStorageState'
import type { AiRecommendation, Conversation, PromptTemplate } from '../types/ai'
import { DEFAULT_AI_SETTINGS } from '../types/ai'
import { answerCopilotPrompt, buildAssistantMessage } from '../utils/aiAssistant'
import { createId } from '../utils/id'
import { CopilotContext, type CopilotContextValue } from './CopilotContext'

const STREAM_DELAY_MS = 700

export function CopilotProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useLocalStorageState<Conversation[]>(
    'ri-ai-conversations',
    DEFAULT_CONVERSATIONS,
  )
  const [activeConversationId, setActiveConversationId] = useLocalStorageState<string | null>(
    'ri-ai-active-conversation',
    DEFAULT_CONVERSATIONS[0]?.id ?? null,
  )
  const [prompts, setPrompts] = useLocalStorageState<PromptTemplate[]>('ri-ai-prompts', PROMPT_TEMPLATES)
  const [recommendations, setRecommendations] = useLocalStorageState<AiRecommendation[]>(
    'ri-ai-recommendations',
    AI_RECOMMENDATIONS,
  )
  const [settings, setSettings] = useLocalStorageState('ri-ai-settings', DEFAULT_AI_SETTINGS)
  const [conversationQuery, setConversationQuery] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const streamTimer = useRef<number>(undefined)

  const createConversation = useCallback(
    (title = 'New conversation') => {
      const now = new Date().toISOString()
      const conversation: Conversation = {
        id: createId('conv'),
        title,
        isPinned: false,
        isFavorite: false,
        isSaved: false,
        createdAt: now,
        updatedAt: now,
        messages: [],
        followUps: settings.autoSuggestions
          ? ['Summarize cross-border transfer changes.', 'Where are we exposed on AML?', 'What evidence is missing?']
          : [],
        citationIds: [],
        relatedDocumentIds: [],
        relatedCaseIds: [],
        relatedEvidenceIds: [],
      }
      setConversations((current) => [conversation, ...current])
      setActiveConversationId(conversation.id)
      return conversation.id
    },
    [setActiveConversationId, setConversations, settings.autoSuggestions],
  )

  const renameConversation = useCallback(
    (id: string, title: string) => {
      setConversations((current) =>
        current.map((item) => (item.id === id ? { ...item, title, updatedAt: new Date().toISOString() } : item)),
      )
    },
    [setConversations],
  )

  const togglePinned = useCallback(
    (id: string) => {
      setConversations((current) =>
        current.map((item) => (item.id === id ? { ...item, isPinned: !item.isPinned } : item)),
      )
    },
    [setConversations],
  )

  const toggleFavorite = useCallback(
    (id: string) => {
      setConversations((current) =>
        current.map((item) => (item.id === id ? { ...item, isFavorite: !item.isFavorite } : item)),
      )
    },
    [setConversations],
  )

  const toggleSaved = useCallback(
    (id: string) => {
      setConversations((current) =>
        current.map((item) => (item.id === id ? { ...item, isSaved: !item.isSaved } : item)),
      )
    },
    [setConversations],
  )

  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((current) => current.filter((item) => item.id !== id))
      setActiveConversationId((current) => (current === id ? null : current))
    },
    [setActiveConversationId, setConversations],
  )

  const appendExchange = useCallback(
    (conversationId: string, userContent: string) => {
      const userMessage = {
        id: createId('msg'),
        role: 'user' as const,
        content: userContent,
        createdAt: new Date().toISOString(),
      }

      setConversations((current) =>
        current.map((item) =>
          item.id === conversationId
            ? {
                ...item,
                title: item.messages.length === 0 ? userContent.slice(0, 64) : item.title,
                updatedAt: new Date().toISOString(),
                messages: [...item.messages, userMessage],
              }
            : item,
        ),
      )

      setIsStreaming(true)
      window.clearTimeout(streamTimer.current)
      streamTimer.current = window.setTimeout(() => {
        const assistant = buildAssistantMessage(userContent, settings)
        const enrich = answerCopilotPrompt(userContent, settings)
        setConversations((current) =>
          current.map((item) =>
            item.id === conversationId
              ? {
                  ...item,
                  updatedAt: new Date().toISOString(),
                  messages: [...item.messages, assistant],
                  followUps: settings.autoSuggestions ? enrich.followUps : item.followUps,
                  citationIds: settings.autoReferences
                    ? [...new Set([...item.citationIds, ...enrich.citations.map((citation) => citation.id)])]
                    : item.citationIds,
                  relatedDocumentIds: [
                    ...new Set([
                      ...item.relatedDocumentIds,
                      ...enrich.citations
                        .filter((citation) => citation.kind === 'regulation' || citation.kind === 'document')
                        .map((citation) => citation.href.split('/').pop()!)
                        .filter(Boolean),
                    ]),
                  ],
                  relatedCaseIds: [
                    ...new Set([
                      ...item.relatedCaseIds,
                      ...enrich.citations
                        .filter((citation) => citation.kind === 'case')
                        .map((citation) => citation.href.split('/').pop()!)
                        .filter(Boolean),
                    ]),
                  ],
                  confidence: assistant.confidence,
                }
              : item,
          ),
        )
        setIsStreaming(false)
      }, STREAM_DELAY_MS)
    },
    [setConversations, settings],
  )

  const sendMessage = useCallback(
    (conversationId: string, content: string) => {
      const trimmed = content.trim()
      if (!trimmed || isStreaming) return
      appendExchange(conversationId, trimmed)
    },
    [appendExchange, isStreaming],
  )

  const streamAssistantOnly = useCallback(
    (conversationId: string, prompt: string) => {
      setIsStreaming(true)
      window.clearTimeout(streamTimer.current)
      streamTimer.current = window.setTimeout(() => {
        const assistant = buildAssistantMessage(prompt, settings)
        const enrich = answerCopilotPrompt(prompt, settings)
        setConversations((current) =>
          current.map((item) =>
            item.id === conversationId
              ? {
                  ...item,
                  updatedAt: new Date().toISOString(),
                  messages: [...item.messages, assistant],
                  followUps: settings.autoSuggestions ? enrich.followUps : item.followUps,
                  citationIds: settings.autoReferences
                    ? [...new Set([...item.citationIds, ...enrich.citations.map((citation) => citation.id)])]
                    : item.citationIds,
                  confidence: assistant.confidence,
                }
              : item,
          ),
        )
        setIsStreaming(false)
      }, STREAM_DELAY_MS)
    },
    [setConversations, settings],
  )

  const regenerateLastAssistant = useCallback(
    (conversationId: string) => {
      const conversation = conversations.find((item) => item.id === conversationId)
      if (!conversation || isStreaming) return
      const lastUser = [...conversation.messages].reverse().find((message) => message.role === 'user')
      if (!lastUser) return
      setConversations((current) =>
        current.map((item) =>
          item.id === conversationId
            ? {
                ...item,
                messages:
                  item.messages[item.messages.length - 1]?.role === 'assistant'
                    ? item.messages.slice(0, -1)
                    : item.messages,
              }
            : item,
        ),
      )
      streamAssistantOnly(conversationId, lastUser.content)
    },
    [conversations, isStreaming, setConversations, streamAssistantOnly],
  )

  const continueLastAssistant = useCallback(
    (conversationId: string) => {
      if (isStreaming) return
      appendExchange(conversationId, 'Continue the previous response with the next recommended actions.')
    },
    [appendExchange, isStreaming],
  )

  const togglePromptFavorite = useCallback(
    (id: string) => {
      setPrompts((current) =>
        current.map((item) => (item.id === id ? { ...item, isFavorite: !item.isFavorite } : item)),
      )
    },
    [setPrompts],
  )

  const duplicatePrompt = useCallback(
    (id: string) => {
      const source = prompts.find((item) => item.id === id)
      if (!source) return undefined
      const copy: PromptTemplate = {
        ...source,
        id: createId('prompt'),
        title: `${source.title} (copy)`,
        isFavorite: false,
      }
      setPrompts((current) => [copy, ...current])
      return copy
    },
    [prompts, setPrompts],
  )

  const runPrompt = useCallback(
    (id: string) => {
      const prompt = prompts.find((item) => item.id === id)
      if (!prompt) return
      const conversationId = createConversation(prompt.title)
      appendExchange(conversationId, prompt.prompt)
    },
    [appendExchange, createConversation, prompts],
  )

  const dismissRecommendation = useCallback(
    (id: string) => {
      setRecommendations((current) => current.map((item) => (item.id === id ? { ...item, dismissed: true } : item)))
    },
    [setRecommendations],
  )

  const updateSettings: CopilotContextValue['updateSettings'] = useCallback(
    (patch) => {
      setSettings((current) => ({ ...current, ...patch }))
    },
    [setSettings],
  )

  const value = useMemo<CopilotContextValue>(
    () => ({
      conversations,
      folders: CONVERSATION_FOLDERS,
      activeConversationId,
      setActiveConversationId,
      createConversation,
      renameConversation,
      togglePinned,
      toggleFavorite,
      toggleSaved,
      deleteConversation,
      sendMessage,
      regenerateLastAssistant,
      continueLastAssistant,
      isStreaming,
      prompts,
      togglePromptFavorite,
      duplicatePrompt,
      runPrompt,
      recommendations: recommendations.filter((item) => !item.dismissed),
      dismissRecommendation,
      memory: AI_MEMORY,
      settings,
      updateSettings,
      conversationQuery,
      setConversationQuery,
    }),
    [
      activeConversationId,
      conversationQuery,
      conversations,
      continueLastAssistant,
      createConversation,
      deleteConversation,
      dismissRecommendation,
      duplicatePrompt,
      isStreaming,
      prompts,
      recommendations,
      regenerateLastAssistant,
      renameConversation,
      runPrompt,
      sendMessage,
      setActiveConversationId,
      settings,
      toggleFavorite,
      togglePinned,
      togglePromptFavorite,
      toggleSaved,
      updateSettings,
    ],
  )

  return <CopilotContext.Provider value={value}>{children}</CopilotContext.Provider>
}
