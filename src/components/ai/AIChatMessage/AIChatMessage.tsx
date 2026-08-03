import { Copy, RefreshCw, Sparkles, Undo2 } from 'lucide-react'
import type { ChatMessage } from '../../../types/ai'
import { formatRelativeTime } from '../../../utils/date'
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
}

export function AIChatMessage({
  message,
  onCopy,
  onRegenerate,
  onContinue,
  showActions = false,
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

      {!isUser && showActions && (
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
      )}
    </article>
  )
}
