import { useNavigate } from 'react-router-dom'
import { Link2 } from 'lucide-react'
import type { InvestigationEvidence } from '../../../types/investigations'
import { formatDate } from '../../../utils/date'
import { Badge } from '../../ui/Badge/Badge'
import styles from './InvestigationEvidenceCard.module.css'

interface InvestigationEvidenceCardProps {
  evidence: InvestigationEvidence
  investigationLabel: string
}

export function InvestigationEvidenceCard({ evidence, investigationLabel }: InvestigationEvidenceCardProps) {
  const navigate = useNavigate()

  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <h3 className={styles.title}>{evidence.title}</h3>
        <Badge variant="neutral">{evidence.type.replace('_', ' ')}</Badge>
      </header>
      <dl className={styles.meta}>
        <div>
          <dt>Source</dt>
          <dd>{evidence.source}</dd>
        </div>
        <div>
          <dt>Date</dt>
          <dd>{formatDate(evidence.createdAt)}</dd>
        </div>
        <div>
          <dt>Related investigation</dt>
          <dd>{investigationLabel}</dd>
        </div>
        <div>
          <dt>Confidence</dt>
          <dd>{Math.round(evidence.confidence * 100)}%</dd>
        </div>
      </dl>
      <div className={styles.tags}>
        {evidence.tags.map((tag) => (
          <Badge key={tag} variant="neutral">
            {tag}
          </Badge>
        ))}
      </div>
      {evidence.referenceUrl && (
        <button type="button" className={styles.link} onClick={() => navigate(evidence.referenceUrl!)}>
          <Link2 size={14} aria-hidden="true" />
          Open reference
        </button>
      )}
    </article>
  )
}
