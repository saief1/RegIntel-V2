import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookMarked, History, Library, PanelRight } from 'lucide-react'
import { AiSettingsPanel } from '../../components/ai/AiSettingsPanel/AiSettingsPanel'
import { ContextPanel } from '../../components/ai/ContextPanel/ContextPanel'
import { ConversationHistoryPanel } from '../../components/ai/ConversationHistoryPanel/ConversationHistoryPanel'
import { ConversationPane } from '../../components/ai/ConversationPane/ConversationPane'
import { Button } from '../../components/ui/Button/Button'
import { useCopilot } from '../../hooks/useCopilot'
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useShellLayout } from '../../hooks/useShellLayout'
import styles from './AIWorkspacePage.module.css'

type MobilePanel = 'history' | 'context' | null

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

  const [settingsOpen, setSettingsOpen] = useState(false)
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

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

  const showHistory = !isNarrow || mobilePanel === 'history'
  const showContext = (!isNarrow && !isMobile) || mobilePanel === 'context'

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div className={styles.links}>
          <Button size="sm" variant="ghost" onClick={() => navigate('/ai/prompts')} leadingIcon={<Library size={14} />}>
            Prompt library
          </Button>
          <Button size="sm" variant="ghost" onClick={() => navigate('/ai/memory')} leadingIcon={<BookMarked size={14} />}>
            Memory
          </Button>
        </div>
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
      </div>

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
    </div>
  )
}
