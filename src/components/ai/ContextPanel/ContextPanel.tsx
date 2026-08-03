import { memo, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { AiRecommendation, Conversation } from '../../../types/ai'
import { getCitation } from '../../../data/ai/citations'
import { ConfidenceBadge } from '../ConfidenceBadge/ConfidenceBadge'
import { FollowUpCard } from '../FollowUpCard/FollowUpCard'
import { RecommendationCard } from '../RecommendationCard/RecommendationCard'
import { ReferenceList } from '../ReferenceList/ReferenceList'
import styles from './ContextPanel.module.css'

interface ContextPanelProps {
  conversation: Conversation | null
  recommendations: AiRecommendation[]
  onFollowUp: (question: string) => void
  onDismissRecommendation: (id: string) => void
}

function ContextPanelComponent({
  conversation,
  recommendations,
  onFollowUp,
  onDismissRecommendation,
}: ContextPanelProps) {
  const navigate = useNavigate()

  const citations = useMemo(
    () => (conversation?.citationIds ?? []).map(getCitation).filter((item): item is NonNullable<typeof item> => Boolean(item)),
    [conversation?.citationIds],
  )

  const regulations = citations.filter((item) => item.kind === 'regulation')
  const documents = citations.filter((item) => item.kind === 'document')
  const evidence = citations.filter((item) => item.kind === 'evidence')
  const cases = citations.filter((item) => item.kind === 'case')

  return (
    <aside className={styles.panel} aria-label="Context panel">
      <div className={styles.scroll}>
        <header className={styles.header}>
          <h2 className={styles.heading}>Context</h2>
          {typeof conversation?.confidence === 'number' && <ConfidenceBadge value={conversation.confidence} />}
        </header>

        <ReferenceList title="Referenced regulations" items={regulations} />
        <ReferenceList title="Referenced documents" items={documents} />
        <ReferenceList title="Evidence" items={evidence} />
        <ReferenceList title="Related cases" items={cases} />

        {conversation && conversation.followUps.length > 0 && (
          <section className={styles.section} aria-label="Suggested follow-up questions">
            <h3 className={styles.sectionTitle}>Suggested follow-ups</h3>
            <div className={styles.stack}>
              {conversation.followUps.map((question) => (
                <FollowUpCard key={question} question={question} onSelect={() => onFollowUp(question)} />
              ))}
            </div>
          </section>
        )}

        {recommendations.length > 0 && (
          <section className={styles.section} aria-label="AI recommendations">
            <h3 className={styles.sectionTitle}>Recommendations</h3>
            <div className={styles.stack}>
              {recommendations.slice(0, 3).map((recommendation) => (
                <RecommendationCard
                  key={recommendation.id}
                  recommendation={recommendation}
                  onAction={() => navigate(recommendation.href)}
                  onDismiss={() => onDismissRecommendation(recommendation.id)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </aside>
  )
}

export const ContextPanel = memo(ContextPanelComponent)
