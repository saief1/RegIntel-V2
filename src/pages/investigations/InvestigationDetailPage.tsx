import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Paperclip, ShieldAlert } from 'lucide-react'
import { InvestigationEvidenceCard } from '../../components/investigations/InvestigationEvidenceCard/InvestigationEvidenceCard'
import { InvestigationNoteCard } from '../../components/investigations/InvestigationNoteCard/InvestigationNoteCard'
import { InvestigationStatusBadge } from '../../components/investigations/InvestigationStatusBadge/InvestigationStatusBadge'
import { InvestigationTimeline } from '../../components/investigations/InvestigationTimeline/InvestigationTimeline'
import { PriorityBadge } from '../../components/work/PriorityBadge/PriorityBadge'
import { RiskBadge } from '../../components/work/RiskBadge/RiskBadge'
import { EmptyState } from '../../components/ui/EmptyState/EmptyState'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { SectionHeader } from '../../components/ui/SectionHeader/SectionHeader'
import { useInvestigations } from '../../hooks/useInvestigations'
import { formatDate } from '../../utils/date'
import styles from './InvestigationDetailPage.module.css'

type DetailTab =
  | 'overview'
  | 'timeline'
  | 'evidence'
  | 'notes'
  | 'tasks'
  | 'regulations'
  | 'ai'
  | 'cases'
  | 'decisions'
  | 'attachments'
  | 'activity'

const TABS: { id: DetailTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'evidence', label: 'Evidence' },
  { id: 'notes', label: 'Notes' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'regulations', label: 'Regulations' },
  { id: 'ai', label: 'AI Analysis' },
  { id: 'cases', label: 'Related Cases' },
  { id: 'decisions', label: 'Decision Log' },
  { id: 'attachments', label: 'Attachments' },
  { id: 'activity', label: 'Activity Feed' },
]

export function InvestigationDetailPage() {
  const { investigationId = '' } = useParams()
  const navigate = useNavigate()
  const {
    getInvestigation,
    getUser,
    getNotes,
    getEvidence,
    getTasks,
    getDecisions,
    getTimeline,
    getAttachments,
    getSuggestions,
    activity,
    pinNote,
    deleteNote,
  } = useInvestigations()
  const [tab, setTab] = useState<DetailTab>('overview')

  const investigation = getInvestigation(investigationId)
  const notes = useMemo(() => getNotes(investigationId), [getNotes, investigationId])
  const evidence = useMemo(() => getEvidence(investigationId), [getEvidence, investigationId])
  const tasks = useMemo(() => getTasks(investigationId), [getTasks, investigationId])
  const decisions = useMemo(() => getDecisions(investigationId), [getDecisions, investigationId])
  const timeline = useMemo(() => getTimeline(investigationId), [getTimeline, investigationId])
  const attachments = useMemo(() => getAttachments(investigationId), [getAttachments, investigationId])
  const suggestions = useMemo(() => getSuggestions(investigationId), [getSuggestions, investigationId])
  const feed = useMemo(
    () => activity.filter((item) => item.investigationId === investigationId),
    [activity, investigationId],
  )

  if (!investigation) {
    return (
      <PageContainer>
        <EmptyState
          icon={<ShieldAlert size={20} />}
          title="Investigation not found"
          description="This investigation ID is not in the local workspace."
          action={
            <button type="button" className={styles.back} onClick={() => navigate('/investigations')}>
              Back to investigations
            </button>
          }
        />
      </PageContainer>
    )
  }

  const owner = getUser(investigation.ownerId)

  return (
    <PageContainer>
      <div className={styles.page}>
        <button type="button" className={styles.back} onClick={() => navigate('/investigations')}>
          <ArrowLeft size={14} aria-hidden="true" />
          Back to investigations
        </button>

        <PageHeader
          icon={<ShieldAlert size={20} />}
          title={investigation.title}
          description={`${investigation.caseId} · ${owner?.name ?? 'Unassigned'} · Due ${formatDate(investigation.dueDate)}`}
          actions={
            <div className={styles.badges}>
              <InvestigationStatusBadge status={investigation.status} />
              <PriorityBadge priority={investigation.priority} />
              <RiskBadge risk={investigation.riskBand} />
            </div>
          }
        />

        <div className={styles.tabs} role="tablist" aria-label="Investigation sections">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              className={tab === item.id ? styles.tabActive : styles.tab}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <section className={styles.panel}>
            <SectionHeader title="Overview" as="h2" />
            <p className={styles.copy}>{investigation.summary}</p>
            <dl className={styles.metaGrid}>
              <div>
                <dt>Risk score</dt>
                <dd>{investigation.riskScore}</dd>
              </div>
              <div>
                <dt>Jurisdiction</dt>
                <dd>{investigation.jurisdiction}</dd>
              </div>
              <div>
                <dt>Created</dt>
                <dd>{formatDate(investigation.createdAt)}</dd>
              </div>
              <div>
                <dt>Related regulation</dt>
                <dd>
                  <Link to={`/knowledge/library/${investigation.relatedRegulationId}`}>
                    {investigation.relatedRegulationTitle}
                  </Link>
                </dd>
              </div>
            </dl>
          </section>
        )}

        {tab === 'timeline' && (
          <section className={styles.panel}>
            <SectionHeader title="Timeline" as="h2" />
            <InvestigationTimeline events={timeline} getActorName={(id) => getUser(id)?.name ?? 'Unknown'} />
          </section>
        )}

        {tab === 'evidence' && (
          <section className={styles.stack}>
            <SectionHeader title="Evidence library" as="h2" />
            {evidence.length === 0 ? (
              <p className={styles.empty}>No evidence attached.</p>
            ) : (
              evidence.map((item) => (
                <InvestigationEvidenceCard
                  key={item.id}
                  evidence={item}
                  investigationLabel={investigation.caseId}
                />
              ))
            )}
          </section>
        )}

        {tab === 'notes' && (
          <section className={styles.stack}>
            <SectionHeader title="Notes" as="h2" />
            {notes.length === 0 ? (
              <p className={styles.empty}>No notes yet.</p>
            ) : (
              notes.map((note) => (
                <InvestigationNoteCard
                  key={note.id}
                  note={note}
                  authorName={getUser(note.authorId)?.name ?? 'Unknown'}
                  onTogglePin={() => pinNote(note.id)}
                  onDelete={() => deleteNote(note.id)}
                />
              ))
            )}
          </section>
        )}

        {tab === 'tasks' && (
          <section className={styles.panel}>
            <SectionHeader title="Tasks" as="h2" />
            <ul className={styles.simpleList}>
              {tasks.map((task) => (
                <li key={task.id}>
                  <strong>{task.title}</strong>
                  <span>
                    {task.status.replace('_', ' ')} · {getUser(task.ownerId)?.name} · Due {formatDate(task.dueDate)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {tab === 'regulations' && (
          <section className={styles.panel}>
            <SectionHeader title="Regulations" as="h2" />
            <Link className={styles.regLink} to={`/knowledge/library/${investigation.relatedRegulationId}`}>
              {investigation.relatedRegulationTitle}
            </Link>
          </section>
        )}

        {tab === 'ai' && (
          <section className={styles.stack}>
            <SectionHeader title="AI analysis" as="h2" description="Local mock intelligence for this investigation." />
            {suggestions.map((suggestion) => (
              <article key={suggestion.id} className={styles.aiCard}>
                <h3>{suggestion.title}</h3>
                <p>{suggestion.detail}</p>
                {suggestion.href && (
                  <button type="button" className={styles.back} onClick={() => navigate(suggestion.href!)}>
                    Open reference
                  </button>
                )}
              </article>
            ))}
          </section>
        )}

        {tab === 'cases' && (
          <section className={styles.panel}>
            <SectionHeader title="Related cases" as="h2" />
            {investigation.relatedCaseIds.length === 0 ? (
              <p className={styles.empty}>No related work cases.</p>
            ) : (
              <ul className={styles.simpleList}>
                {investigation.relatedCaseIds.map((caseId) => (
                  <li key={caseId}>
                    <Link to={`/work/cases/${caseId}`}>{caseId}</Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {tab === 'decisions' && (
          <section className={styles.panel}>
            <SectionHeader title="Decision log" as="h2" />
            <ul className={styles.simpleList}>
              {decisions.map((decision) => (
                <li key={decision.id}>
                  <strong>{decision.outcome}</strong>
                  <span>
                    {decision.reason} · {getUser(decision.actorId)?.name} · {formatDate(decision.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {tab === 'attachments' && (
          <section className={styles.panel}>
            <SectionHeader title="Attachments" as="h2" description="Mock file list — no uploads." />
            <ul className={styles.simpleList}>
              {attachments.map((file) => (
                <li key={file.id}>
                  <strong>
                    <Paperclip size={14} aria-hidden="true" /> {file.name}
                  </strong>
                  <span>
                    {file.sizeLabel} · {getUser(file.uploadedById)?.name} · {formatDate(file.uploadedAt)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {tab === 'activity' && (
          <section className={styles.panel}>
            <SectionHeader title="Activity feed" as="h2" />
            <ul className={styles.simpleList}>
              {feed.map((item) => (
                <li key={item.id}>
                  <strong>{item.title}</strong>
                  <span>
                    {item.description} · {getUser(item.actorId)?.name} · {formatDate(item.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </PageContainer>
  )
}
