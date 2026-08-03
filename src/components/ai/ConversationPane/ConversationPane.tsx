import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bookmark, Pin, Settings2, Sparkles, Star } from 'lucide-react'
import type { Conversation } from '../../../types/ai'
import type { AiActionType } from '../../../types/work'
import { generateImplementationTasks } from '../../../utils/aiWorkActions'
import { estimateSmartDue } from '../../../utils/smartDueDates'
import { AiActionModal } from '../../work/AiActionModal/AiActionModal'
import { AiTaskGeneratorModal } from '../../work/AiTaskGeneratorModal/AiTaskGeneratorModal'
import { Button } from '../../ui/Button/Button'
import { EmptyState } from '../../ui/EmptyState/EmptyState'
import { IconButton } from '../../ui/IconButton/IconButton'
import { AIChatMessage } from '../AIChatMessage/AIChatMessage'
import { ChatInput } from '../ChatInput/ChatInput'
import { ConversationExportMenu } from '../ConversationExportMenu/ConversationExportMenu'
import { ThinkingIndicator } from '../ThinkingIndicator/ThinkingIndicator'
import { TypingIndicator } from '../TypingIndicator/TypingIndicator'
import styles from './ConversationPane.module.css'

interface ConversationPaneProps {
  conversation: Conversation | null
  isStreaming: boolean
  inputRef: React.RefObject<HTMLTextAreaElement | null>
  onSend: (content: string) => void
  onCopy: (content: string) => void
  onRegenerate: () => void
  onContinue: () => void
  onTogglePinned: () => void
  onToggleFavorite: () => void
  onToggleSaved: () => void
  onOpenSettings: () => void
  showSettings: boolean
  settingsSlot?: React.ReactNode
}

function ConversationPaneComponent({
  conversation,
  isStreaming,
  inputRef,
  onSend,
  onCopy,
  onRegenerate,
  onContinue,
  onTogglePinned,
  onToggleFavorite,
  onToggleSaved,
  onOpenSettings,
  showSettings,
  settingsSlot,
}: ConversationPaneProps) {
  const navigate = useNavigate()
  const scrollRef = useRef<HTMLDivElement>(null)
  const history = conversation?.messages.filter((message) => message.role === 'user').map((message) => message.content) ?? []
  const [action, setAction] = useState<AiActionType | null>(null)
  const [generatorOpen, setGeneratorOpen] = useState(false)

  useEffect(() => {
    if (!scrollRef.current) return
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [conversation?.messages.length, isStreaming])

  const lastAssistantIndex =
    conversation?.messages.reduce((last, message, index) => (message.role === 'assistant' ? index : last), -1) ?? -1

  const lastUserPrompt = useMemo(() => {
    const users = conversation?.messages.filter((message) => message.role === 'user') ?? []
    return users[users.length - 1]?.content ?? ''
  }, [conversation?.messages])

  const seed = useMemo(() => generateImplementationTasks(lastUserPrompt || 'implementation'), [lastUserPrompt])
  const estimate = seed.estimate ?? estimateSmartDue('high', 'policy_update')

  const recommendationCards = useMemo(() => {
    if (lastAssistantIndex < 0) return []
    return [
      {
        id: 'reco-1',
        title: seed.title,
        impact: estimate.businessImpact,
        owner: 'Compliance',
        priority: estimate.businessImpact === 'Critical' ? 'Urgent' : 'High',
        estimatedTime: `${estimate.estimatedHours} hours`,
        onCreateTask: () => setAction('create_task'),
      },
      {
        id: 'reco-2',
        title: 'Update impacted policy',
        impact: 'High',
        owner: 'Policy owner',
        priority: 'High',
        estimatedTime: '8 hours',
        onCreateTask: () => setAction('update_policy'),
      },
      {
        id: 'reco-3',
        title: 'Collect implementation evidence',
        impact: 'Medium',
        owner: 'Operations',
        priority: 'Medium',
        estimatedTime: '6 hours',
        onCreateTask: () => setAction('create_task'),
      },
    ]
  }, [estimate.businessImpact, estimate.estimatedHours, lastAssistantIndex, seed.title])

  return (
    <section className={styles.pane} aria-label="AI conversation">
      <header className={styles.header}>
        <div className={styles.titleBlock}>
          <Sparkles size={16} aria-hidden="true" />
          <h2 className={styles.title}>{conversation?.title ?? 'Copilot'}</h2>
        </div>
        {conversation && (
          <div className={styles.actions}>
            <IconButton label={conversation.isPinned ? 'Unpin' : 'Pin'} onClick={onTogglePinned}>
              <Pin size={14} />
            </IconButton>
            <IconButton label={conversation.isFavorite ? 'Unfavorite' : 'Favorite'} onClick={onToggleFavorite}>
              <Star size={14} fill={conversation.isFavorite ? 'currentColor' : 'none'} />
            </IconButton>
            <IconButton label={conversation.isSaved ? 'Unsave' : 'Save session'} onClick={onToggleSaved}>
              <Bookmark size={14} />
            </IconButton>
            <ConversationExportMenu conversation={conversation} />
            <Button size="sm" variant="ghost" onClick={onOpenSettings} leadingIcon={<Settings2 size={14} />}>
              Settings
            </Button>
          </div>
        )}
      </header>

      {showSettings && settingsSlot}

      <div className={styles.messages} ref={scrollRef}>
        {!conversation || conversation.messages.length === 0 ? (
          <EmptyState
            icon={<Sparkles size={20} />}
            title="Start a compliance conversation"
            description="Ask about regulations, evidence gaps, drafting, or risk — then convert answers into tasks in one click."
          />
        ) : (
          conversation.messages.map((message, index) => (
            <AIChatMessage
              key={message.id}
              message={message}
              showActions={message.role === 'assistant' && index === lastAssistantIndex && !isStreaming}
              recommendationCards={
                message.role === 'assistant' && index === lastAssistantIndex && !isStreaming
                  ? recommendationCards
                  : undefined
              }
              onCopy={() => onCopy(message.content)}
              onRegenerate={onRegenerate}
              onContinue={onContinue}
              onAiAction={setAction}
              onOpenTaskGenerator={() => setGeneratorOpen(true)}
              onFollowUpAction={(label) => {
                if (label === 'Create Action Plan' || label === 'Assign Tasks') setGeneratorOpen(true)
                else onSend(label)
              }}
            />
          ))
        )}
        {isStreaming && (
          <div className={styles.streaming}>
            <ThinkingIndicator />
            <TypingIndicator />
          </div>
        )}
      </div>

      <ChatInput
        inputRef={inputRef}
        onSubmit={onSend}
        disabled={isStreaming || !conversation}
        history={history}
      />

      <AiActionModal
        open={Boolean(action)}
        action={action}
        sourceTitle={seed.title}
        sourceDescription={conversation?.messages[lastAssistantIndex]?.content.slice(0, 280)}
        linkedRegulation={seed.linkedRegulation}
        onClose={() => setAction(null)}
        onCreated={(taskId) => navigate(`/work/tasks/${taskId}`)}
      />

      <AiTaskGeneratorModal
        open={generatorOpen}
        prompt={lastUserPrompt || 'implementation'}
        onClose={() => setGeneratorOpen(false)}
      />
    </section>
  )
}

export const ConversationPane = memo(ConversationPaneComponent)
