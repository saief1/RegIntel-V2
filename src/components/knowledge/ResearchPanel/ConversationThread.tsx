import { useNavigate } from 'react-router-dom'
import { Briefcase, Sparkles } from 'lucide-react'
import type { ResearchThread } from '../../../types/knowledge'
import { formatRelativeTime } from '../../../utils/date'
import { Badge } from '../../ui/Badge/Badge'
import { Skeleton } from '../../ui/Skeleton/Skeleton'
import { CitationBadge } from '../CitationBadge/CitationBadge'
import styles from './ResearchPanel.module.css'

interface ConversationThreadProps {
  thread: ResearchThread
  isResearching: boolean
  onAsk?: (question: string) => void
}

/** Renders one research thread's message history, including per-answer source citations. */
export function ConversationThread({ thread, isResearching, onAsk }: ConversationThreadProps) {
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
                {typeof message.confidence === 'number' && (
                  <Badge variant="accent">{Math.round(message.confidence * 100)}% confidence</Badge>
                )}
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
          {message.relatedCaseHrefs && message.relatedCaseHrefs.length > 0 && (
            <div className={styles.relatedCases} aria-label="Related cases">
              {message.relatedCaseHrefs.map((href) => (
                <button key={href} type="button" className={styles.relatedCase} onClick={() => navigate(href)}>
                  <Briefcase size={12} aria-hidden="true" />
                  Related case
                </button>
              ))}
            </div>
          )}
          {message.suggestedNextQuestions && message.suggestedNextQuestions.length > 0 && onAsk && (
            <div className={styles.nextQuestions} aria-label="Suggested next questions">
              {message.suggestedNextQuestions.map((question) => (
                <button key={question} type="button" className={styles.suggestionChip} onClick={() => onAsk(question)}>
                  {question}
                </button>
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
