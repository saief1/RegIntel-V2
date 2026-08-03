import { useNavigate, useLocation } from 'react-router-dom'
import { AlertTriangle, ArrowRight, BookOpen, FileWarning, ListChecks, Sparkles } from 'lucide-react'
import { useWork } from '../../../hooks/useWork'
import { EmptyKnowledgeState } from '../../knowledge/EmptyKnowledgeState/EmptyKnowledgeState'
import { WorkWidget } from '../WorkWidget/WorkWidget'
import styles from './WorkAssistant.module.css'

const ICONS = {
  action: ListChecks,
  regulation: BookOpen,
  missing_evidence: FileWarning,
  risk: AlertTriangle,
  next_step: ArrowRight,
} as const

/**
 * Work-mode AI assistant content for the existing AI panel shell.
 * Does not change AI panel layout — only the body content when on /work routes.
 */
export function WorkAssistant() {
  const navigate = useNavigate()
  const location = useLocation()
  const { cases, getSuggestionsForCase, getCase } = useWork()

  const pathCaseId = location.pathname.startsWith('/work/cases/')
    ? location.pathname.split('/')[3]
    : undefined
  const activeCaseId =
    pathCaseId || cases.find((item) => item.status === 'in_review' || item.status === 'open')?.id

  const workCase = activeCaseId ? getCase(activeCaseId) : undefined
  const suggestions = activeCaseId ? getSuggestionsForCase(activeCaseId) : []

  if (!workCase) {
    return (
      <div className={styles.root}>
        <WorkWidget />
        <EmptyKnowledgeState
          icon={<Sparkles size={20} />}
          title="Compliance assistant"
          description="Open a case to see suggested actions, related regulations, missing evidence, and next steps."
        />
      </div>
    )
  }

  return (
    <div className={styles.root}>
      <WorkWidget />
      <header className={styles.header}>
        <p className={styles.kicker}>Active case</p>
        <h3 className={styles.title}>{workCase.caseNumber}</h3>
        <p className={styles.subtitle}>{workCase.title}</p>
      </header>

      <section className={styles.section} aria-label="Suggested actions">
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
                    if (suggestion.documentId) navigate(`/knowledge/library/${suggestion.documentId}`)
                    else navigate(`/work/cases/${workCase.id}`)
                  }}
                >
                  <span className={styles.itemIcon} data-kind={suggestion.kind} aria-hidden="true">
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

      <section className={styles.section} aria-label="References">
        <h4 className={styles.sectionTitle}>References</h4>
        <ul className={styles.refs}>
          {workCase.relatedDocumentIds.map((documentId) => (
            <li key={documentId}>
              <button type="button" className={styles.refLink} onClick={() => navigate(`/knowledge/library/${documentId}`)}>
                Open {documentId}
              </button>
            </li>
          ))}
          {workCase.relatedCaseIds.map((relatedId) => (
            <li key={relatedId}>
              <button type="button" className={styles.refLink} onClick={() => navigate(`/work/cases/${relatedId}`)}>
                Related case {relatedId}
              </button>
            </li>
          ))}
          {workCase.relatedDocumentIds.length === 0 && workCase.relatedCaseIds.length === 0 && (
            <li className={styles.emptyRefs}>No linked references yet.</li>
          )}
        </ul>
      </section>
    </div>
  )
}
