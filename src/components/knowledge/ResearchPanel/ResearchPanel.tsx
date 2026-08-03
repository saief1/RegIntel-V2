import { useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link2, Sparkles } from 'lucide-react'
import { useKnowledge } from '../../../hooks/useKnowledge'
import type { Citation } from '../../../types/knowledge'
import { EmptyKnowledgeState } from '../EmptyKnowledgeState/EmptyKnowledgeState'
import { CitationBadge } from '../CitationBadge/CitationBadge'
import { ConversationThread } from './ConversationThread'
import { PromptComposer } from './PromptComposer'
import styles from './ResearchPanel.module.css'

const SUGGESTED_PROMPTS = [
  "Summarize this year's data privacy changes",
  'What are the new AML beneficial ownership rules?',
  'Explain the cybersecurity incident reporting requirement',
  "What's changed in financial services disclosures?",
]

/**
 * Full AI Research experience: conversation history, prompt composer, evidence
 * panel with sources/citations, and research history (via AIPanel header menu).
 * Responses are produced locally by a keyword-matching heuristic over the
 * knowledge base — there is no model or backend behind this panel.
 */
export function ResearchPanel() {
  const navigate = useNavigate()
  const { researchThreads, activeThreadId, sendResearchMessage, isResearching, createThread } = useKnowledge()
  const scrollRef = useRef<HTMLDivElement>(null)

  const thread = researchThreads.find((candidate) => candidate.id === activeThreadId) ?? null

  const evidence = useMemo(() => {
    if (!thread) return [] as Citation[]
    const seen = new Set<string>()
    const citations: Citation[] = []
    for (const message of thread.messages) {
      for (const citation of message.citations ?? []) {
        if (seen.has(citation.documentId)) continue
        seen.add(citation.documentId)
        citations.push(citation)
      }
    }
    return citations
  }, [thread])

  useEffect(() => {
    if (!scrollRef.current) return
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [thread?.messages.length, isResearching])

  function handleSubmit(content: string) {
    const targetThreadId = thread?.id ?? createThread()
    sendResearchMessage(targetThreadId, content)
  }

  const hasMessages = Boolean(thread && thread.messages.length > 0)

  return (
    <div className={styles.root}>
      <div className={styles.conversationArea} ref={scrollRef}>
        {hasMessages && thread ? (
          <ConversationThread thread={thread} isResearching={isResearching} />
        ) : (
          <div className={styles.emptyWrapper}>
            <EmptyKnowledgeState
              icon={<Sparkles size={20} />}
              title="Ask your research assistant"
              description="Get grounded answers with citations from your knowledge base."
            />
            <div className={styles.suggestions} aria-label="Suggested prompts">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button key={prompt} type="button" className={styles.suggestionChip} onClick={() => handleSubmit(prompt)}>
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <section className={styles.evidencePanel} aria-label="Evidence">
        <header className={styles.evidenceHeader}>
          <Link2 size={14} aria-hidden="true" />
          <h3 className={styles.evidenceTitle}>Evidence & sources</h3>
        </header>
        {evidence.length === 0 ? (
          <p className={styles.evidenceEmpty}>Sources cited in this thread will appear here.</p>
        ) : (
          <div className={styles.evidenceList}>
            {evidence.map((citation, index) => (
              <CitationBadge
                key={citation.id}
                citation={citation}
                index={index + 1}
                onOpen={(clicked) => navigate(`/knowledge/library/${clicked.documentId}`)}
              />
            ))}
          </div>
        )}
      </section>

      <PromptComposer onSubmit={handleSubmit} disabled={isResearching} />
    </div>
  )
}
