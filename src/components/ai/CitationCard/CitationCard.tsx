import { useNavigate } from 'react-router-dom'
import { BookOpen, Briefcase, FileText, Link2 } from 'lucide-react'
import type { AiCitation } from '../../../types/ai'
import { Tooltip } from '../../ui/Tooltip/Tooltip'
import styles from './CitationCard.module.css'

const ICONS = {
  regulation: BookOpen,
  document: FileText,
  evidence: Link2,
  case: Briefcase,
} as const

interface CitationCardProps {
  citation: AiCitation
  compact?: boolean
}

export function CitationCard({ citation, compact = false }: CitationCardProps) {
  const navigate = useNavigate()
  const Icon = ICONS[citation.kind]

  const button = (
    <button type="button" className={compact ? styles.chip : styles.card} onClick={() => navigate(citation.href)}>
      <span className={styles.icon} aria-hidden="true">
        <Icon size={14} />
      </span>
      <span className={styles.text}>
        <span className={styles.title}>{citation.title}</span>
        {!compact && citation.subtitle && <span className={styles.subtitle}>{citation.subtitle}</span>}
      </span>
    </button>
  )

  if (!citation.snippet) return button
  return (
    <Tooltip content={citation.snippet} side="top">
      {button}
    </Tooltip>
  )
}
