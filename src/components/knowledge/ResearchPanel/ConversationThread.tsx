import { useNavigate } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import type { ResearchThread } from '../../../types/knowledge'
import { formatRelativeTime } from '../../../utils/date'
import { Skeleton } from '../../ui/Skeleton/Skeleton'
import { CitationBadge } from '../CitationBadge/CitationBadge'
import styles from './ResearchPanel.module.css'

interface ConversationThreadProps {
  thread: ResearchThread
  isResearching: boolean
}

/** Renders one research thread's message history, including per-answer source citations. */
export function ConversationThread({ thread, isResearching }: ConversationThreadProps) {
  const navigate = useNavigate()

  return (
    <ul className={styles.messageList} aria-label="Conversation">
      {thread.messages.map((message) => (
        <li key={message.id} className={message.role === 'user' ? styles.messageRowUser : styles.messageRowAssistant}>
          <div className={message.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant}>
            {message.role === 'assistant' && (
              <span className={styles.assistantLabel}>
                <Sparkles size={12} aria-hidden="true" />
                Research assistant
              </span>
            )}
            <p className={styles.bubbleText}>{message.content}</p>
            <span className={styles.timestamp}>{formatRelativeTime(message.createdAt)}</span>
          </div>
          {message.citations && message.citations.length > 0 && (
            <div className={styles.citations} aria-label="Sources">
              {message.citations.map((citation, index) => (
                <CitationBadge
                  key={citation.id}
                  citation={citation}
                  index={index + 1}
                  onOpen={(clicked) => navigate(`/knowledge/library/${clicked.documentId}`)}
                />
              ))}
            </div>
          )}
        </li>
      ))}

      {isResearching && (
        <li className={styles.messageRowAssistant}>
          <div className={styles.bubbleAssistant}>
            <span className={styles.assistantLabel}>
              <Sparkles size={12} aria-hidden="true" />
              Research assistant
            </span>
            <div className={styles.loadingLines} role="status" aria-label="Researching">
              <Skeleton height={12} width="90%" />
              <Skeleton height={12} width="70%" />
            </div>
          </div>
        </li>
      )}
    </ul>
  )
}
