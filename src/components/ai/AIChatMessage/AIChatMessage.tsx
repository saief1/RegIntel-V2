import { Copy, ListTodo, RefreshCw, Sparkles, Undo2 } from 'lucide-react'
import type { AiActionType } from '../../../types/work'
import type { ChatMessage } from '../../../types/ai'
import { AI_ACTION_OPTIONS, AI_FOLLOW_UP_ACTIONS } from '../../../utils/aiWorkActions'
import { formatRelativeTime } from '../../../utils/date'
import { Button } from '../../ui/Button/Button'
import { IconButton } from '../../ui/IconButton/IconButton'
import { CitationCard } from '../CitationCard/CitationCard'
import { ConfidenceBadge } from '../ConfidenceBadge/ConfidenceBadge'
import { MarkdownContent } from '../MarkdownContent/MarkdownContent'
import styles from './AIChatMessage.module.css'

interface AIChatMessageProps {
  message: ChatMessage
  onCopy?: () => void
  onRegenerate?: () => void
  onContinue?: () => void
  showActions?: boolean
  onAiAction?: (action: AiActionType) => void
  onOpenTaskGenerator?: () => void
  onFollowUpAction?: (label: string) => void
  recommendationCards?: Array<{
    id: string
    title: string
    impact: string
    owner: string
    priority: string
    estimatedTime: string
    onCreateTask: () => void
  }>
}

export function AIChatMessage({
  message,
  onCopy,
  onRegenerate,
  onContinue,
  showActions = false,
  onAiAction,
  onOpenTaskGenerator,
  onFollowUpAction,
  recommendationCards,
}: AIChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <article className={isUser ? styles.userRow : styles.assistantRow} aria-label={isUser ? 'User message' : 'Assistant message'}>
      <div className={isUser ? styles.userBubble : styles.assistantBubble}>
        {!isUser && (
          <div className={styles.assistantLabel}>
            <Sparkles size={12} aria-hidden="true" />
            Copilot
            {typeof message.confidence === 'number' && <ConfidenceBadge value={message.confidence} />}
          </div>
        )}
        {isUser ? <p className={styles.userText}>{message.content}</p> : <MarkdownContent content={message.content} />}
        <time className={styles.time} dateTime={message.createdAt}>
          {formatRelativeTime(message.createdAt)}
        </time>
      </div>

      {!isUser && message.citations && message.citations.length > 0 && (
        <div className={styles.citations} aria-label="Citations">
          {message.citations.map((citation) => (
            <CitationCard key={citation.id} citation={citation} compact />
          ))}
        </div>
      )}

      {!isUser && recommendationCards && recommendationCards.length > 0 && (
        <div className={styles.recoGrid} aria-label="Recommendations">
          {recommendationCards.map((card) => (
            <article key={card.id} className={styles.recoCard}>
              <h4>{card.title}</h4>
              <dl>
                <div>
                  <dt>Impact</dt>
                  <dd>{card.impact}</dd>
                </div>
                <div>
                  <dt>Owner</dt>
                  <dd>{card.owner}</dd>
                </div>
                <div>
                  <dt>Priority</dt>
                  <dd>{card.priority}</dd>
                </div>
                <div>
                  <dt>Estimated</dt>
                  <dd>{card.estimatedTime}</dd>
                </div>
              </dl>
              <Button size="sm" onClick={card.onCreateTask}>
                Create Task
              </Button>
            </article>
          ))}
        </div>
      )}

      {!isUser && showActions && (
        <>
          <div className={styles.workActions} aria-label="Convert to work">
            {AI_ACTION_OPTIONS.map((action) => (
              <button key={action.type} type="button" className={styles.workAction} onClick={() => onAiAction?.(action.type)}>
                {action.label}
              </button>
            ))}
          </div>

          <div className={styles.followUps} aria-label="Next steps">
            <p className={styles.followTitle}>Next Steps</p>
            <div className={styles.followRow}>
              {AI_FOLLOW_UP_ACTIONS.map((label) => (
                <button key={label} type="button" className={styles.followChip} onClick={() => onFollowUpAction?.(label)}>
                  {label}
                </button>
              ))}
            </div>
            {onOpenTaskGenerator && (
              <Button size="sm" variant="secondary" leadingIcon={<ListTodo size={14} />} onClick={onOpenTaskGenerator}>
                Create Action Plan
              </Button>
            )}
          </div>

          <div className={styles.actions}>
            {onCopy && (
              <IconButton label="Copy response" onClick={onCopy}>
                <Copy size={14} />
              </IconButton>
            )}
            {onRegenerate && (
              <IconButton label="Regenerate" onClick={onRegenerate}>
                <RefreshCw size={14} />
              </IconButton>
            )}
            {onContinue && (
              <IconButton label="Continue response" onClick={onContinue}>
                <Undo2 size={14} />
              </IconButton>
            )}
          </div>
        </>
      )}
    </article>
  )
}
