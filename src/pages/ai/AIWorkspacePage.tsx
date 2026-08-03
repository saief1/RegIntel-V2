import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookMarked, History, Library, PanelRight, Sparkles } from 'lucide-react'
import { AiSettingsPanel } from '../../components/ai/AiSettingsPanel/AiSettingsPanel'
import { ContextPanel } from '../../components/ai/ContextPanel/ContextPanel'
import { ConversationHistoryPanel } from '../../components/ai/ConversationHistoryPanel/ConversationHistoryPanel'
import { ConversationPane } from '../../components/ai/ConversationPane/ConversationPane'
import { Button } from '../../components/ui/Button/Button'
import { useCopilot } from '../../hooks/useCopilot'
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useShellLayout } from '../../hooks/useShellLayout'
import {
  CompareModePanel,
  DocumentAnalysisModePanel,
  DraftingModePanel,
  ResearchModePanel,
} from './AiModePanels'
import styles from './AIWorkspacePage.module.css'

type MobilePanel = 'history' | 'context' | null
type AiMode = 'chat' | 'research' | 'analysis' | 'compare' | 'drafting'

const MODES: { id: AiMode; label: string }[] = [
  { id: 'chat', label: 'Chat' },
  { id: 'research', label: 'Research' },
  { id: 'analysis', label: 'Document Analysis' },
  { id: 'compare', label: 'Compare' },
  { id: 'drafting', label: 'Drafting' },
]

export function AIWorkspacePage() {
  const navigate = useNavigate()
  const isNarrow = useMediaQuery('(max-width: 1100px)')
  const isMobile = useMediaQuery('(max-width: 768px)')
  const { isAIPanelOpen, toggleAIPanel, closeSidebarDrawer, closeCommandPalette } = useShellLayout()
  const {
    conversations,
    folders,
    activeConversationId,
    setActiveConversationId,
    createConversation,
    togglePinned,
    toggleFavorite,
    toggleSaved,
    sendMessage,
    regenerateLastAssistant,
    continueLastAssistant,
    isStreaming,
    recommendations,
    dismissRecommendation,
    conversationQuery,
    setConversationQuery,
    settings,
    updateSettings,
  } = useCopilot()

  const [mode, setMode] = useState<AiMode>('chat')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const homePromptApplied = useRef(false)

  const activeConversation = useMemo(
    () => conversations.find((item) => item.id === activeConversationId) ?? conversations[0] ?? null,
    [activeConversationId, conversations],
  )

  useEffect(() => {
    if (!activeConversationId && conversations[0]) {
      setActiveConversationId(conversations[0].id)
    }
  }, [activeConversationId, conversations, setActiveConversationId])

  const focusInput = useCallback(() => {
    inputRef.current?.focus()
  }, [])

  useKeyboardShortcut({ key: '/', meta: true }, focusInput)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      setSettingsOpen(false)
      setMobilePanel(null)
      if (isAIPanelOpen) toggleAIPanel()
      closeSidebarDrawer()
      closeCommandPalette()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [closeCommandPalette, closeSidebarDrawer, isAIPanelOpen, toggleAIPanel])

  function ensureConversation(): string {
    if (activeConversation) return activeConversation.id
    return createConversation()
  }

  function handleSend(content: string) {
    const id = ensureConversation()
    sendMessage(id, content)
  }

  useEffect(() => {
    if (homePromptApplied.current) return
    const prompt = sessionStorage.getItem('ri-home-prompt')
    if (!prompt) return
    homePromptApplied.current = true
    sessionStorage.removeItem('ri-home-prompt')
    // Default mode is already chat; hydrate from Home without an extra setState.
    const id = createConversation(prompt.slice(0, 64))
    sendMessage(id, prompt)
  }, [createConversation, sendMessage])

  const showHistory = mode === 'chat' && (!isNarrow || mobilePanel === 'history')
  const showContext = mode === 'chat' && ((!isNarrow && !isMobile) || mobilePanel === 'context')

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div className={styles.titleBlock}>
          <Sparkles size={20} aria-hidden="true" />
          <div>
            <h1 className={styles.pageTitle}>AI Workspace</h1>
            <p className={styles.pageSubtitle}>Your AI-powered compliance assistant.</p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <Button size="sm" variant="ghost" onClick={() => navigate('/ai/prompts')} leadingIcon={<Library size={14} />}>
            Prompt library
          </Button>
          <Button size="sm" variant="ghost" onClick={() => navigate('/ai/memory')} leadingIcon={<BookMarked size={14} />}>
            Memory
          </Button>
        </div>
      </header>

      <div className={styles.modeTabs} role="tablist" aria-label="AI modes">
        {MODES.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={mode === item.id}
            className={mode === item.id ? styles.modeTabActive : styles.modeTab}
            onClick={() => setMode(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {mode !== 'chat' ? (
        <div className={styles.modeBody}>
          {mode === 'research' && <ResearchModePanel />}
          {mode === 'analysis' && <DocumentAnalysisModePanel />}
          {mode === 'compare' && <CompareModePanel />}
          {mode === 'drafting' && <DraftingModePanel />}
        </div>
      ) : (
        <>
          {isNarrow && (
            <div className={styles.mobileToggles}>
              <Button
                size="sm"
                variant={mobilePanel === 'history' ? 'secondary' : 'ghost'}
                onClick={() => setMobilePanel((current) => (current === 'history' ? null : 'history'))}
                leadingIcon={<History size={14} />}
              >
                History
              </Button>
              <Button
                size="sm"
                variant={mobilePanel === 'context' ? 'secondary' : 'ghost'}
                onClick={() => setMobilePanel((current) => (current === 'context' ? null : 'context'))}
                leadingIcon={<PanelRight size={14} />}
              >
                Context
              </Button>
            </div>
          )}

          <div className={styles.workspace}>
            {showHistory && (
              <div className={styles.historyColumn}>
                <ConversationHistoryPanel
                  conversations={conversations}
                  folders={folders}
                  activeId={activeConversation?.id ?? null}
                  query={conversationQuery}
                  onQueryChange={setConversationQuery}
                  onSelect={(id) => {
                    setActiveConversationId(id)
                    setMobilePanel(null)
                  }}
                  onCreate={() => {
                    createConversation()
                    setMobilePanel(null)
                    focusInput()
                  }}
                />
              </div>
            )}

            <div className={styles.centerColumn}>
              <ConversationPane
                conversation={activeConversation}
                isStreaming={isStreaming}
                inputRef={inputRef}
                onSend={handleSend}
                onCopy={(content) => {
                  void navigator.clipboard.writeText(content)
                }}
                onRegenerate={() => activeConversation && regenerateLastAssistant(activeConversation.id)}
                onContinue={() => activeConversation && continueLastAssistant(activeConversation.id)}
                onTogglePinned={() => activeConversation && togglePinned(activeConversation.id)}
                onToggleFavorite={() => activeConversation && toggleFavorite(activeConversation.id)}
                onToggleSaved={() => activeConversation && toggleSaved(activeConversation.id)}
                onOpenSettings={() => setSettingsOpen((value) => !value)}
                showSettings={settingsOpen}
                settingsSlot={
                  <div className={styles.settingsWrap}>
                    <AiSettingsPanel
                      settings={settings}
                      onChange={updateSettings}
                      onClose={() => setSettingsOpen(false)}
                    />
                  </div>
                }
              />
            </div>

            {showContext && (
              <div className={styles.contextColumn}>
                <ContextPanel
                  conversation={activeConversation}
                  recommendations={recommendations}
                  onFollowUp={(question) => {
                    handleSend(question)
                    setMobilePanel(null)
                  }}
                  onDismissRecommendation={dismissRecommendation}
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
