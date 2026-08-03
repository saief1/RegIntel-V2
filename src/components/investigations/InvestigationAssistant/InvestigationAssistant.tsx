import { useNavigate, useLocation } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  FileWarning,
  ListChecks,
  Sparkles,
  TextQuote,
} from 'lucide-react'
import { useInvestigations } from '../../../hooks/useInvestigations'
import { EmptyKnowledgeState } from '../../knowledge/EmptyKnowledgeState/EmptyKnowledgeState'
import styles from '../../work/WorkAssistant/WorkAssistant.module.css'

const ICONS = {
  summarize: TextQuote,
  next_action: ArrowRight,
  missing_evidence: FileWarning,
  regulation: BookOpen,
  risk: AlertTriangle,
  summary_draft: ListChecks,
} as const

/**
 * Investigation-mode AI assistant for the existing AI panel shell.
 * Extends AI workspace assistance without redesigning panel chrome.
 */
export function InvestigationAssistant() {
  const navigate = useNavigate()
  const location = useLocation()
  const { investigations, getInvestigation, getSuggestions } = useInvestigations()

  const pathId = location.pathname.startsWith('/investigations/')
    ? location.pathname.split('/')[2]
    : undefined
  const activeId =
    pathId || investigations.find((item) => item.status === 'in_progress' || item.status === 'open')?.id

  const investigation = activeId ? getInvestigation(activeId) : undefined
  const suggestions = activeId ? getSuggestions(activeId) : []

  if (!investigation) {
    return (
      <div className={styles.root}>
        <EmptyKnowledgeState
          icon={<Sparkles size={20} />}
          title="Investigation assistant"
          description="Open an investigation to summarize, suggest next actions, identify missing evidence, and highlight risks."
        />
      </div>
    )
  }

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <p className={styles.kicker}>Active investigation</p>
        <h3 className={styles.title}>{investigation.caseId}</h3>
        <p className={styles.subtitle}>{investigation.title}</p>
      </header>

      <section className={styles.section} aria-label="Investigation assistance">
        <h4 className={styles.sectionTitle}>Suggested actions</h4>
        <ul className={styles.list}>
          {suggestions.map((suggestion) => {
            const Icon = ICONS[suggestion.kind]
            return (
              <li key={suggestion.id}>
                <button
                  type="button"
                  className={styles.item}
                  onClick={() => {
                    if (suggestion.href) navigate(suggestion.href)
                    else navigate(`/investigations/${investigation.id}`)
                  }}
                >
                  <span className={styles.itemIcon} data-kind={suggestion.kind === 'risk' ? 'risk' : 'action'} aria-hidden="true">
                    <Icon size={14} />
                  </span>
                  <span className={styles.itemText}>
                    <span className={styles.itemTitle}>{suggestion.title}</span>
                    <span className={styles.itemDetail}>{suggestion.detail}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <button type="button" className={styles.footerLink} onClick={() => navigate('/ai')}>
        Open Copilot workspace
      </button>
    </div>
  )
}
