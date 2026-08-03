import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, MessageSquarePlus, Plus, Scale } from 'lucide-react'
import { DecisionCard } from '../../components/work/DecisionCard/DecisionCard'
import { DecisionFormModal } from '../../components/work/DecisionFormModal/DecisionFormModal'
import { EvidenceCard } from '../../components/work/EvidenceCard/EvidenceCard'
import { PriorityBadge } from '../../components/work/PriorityBadge/PriorityBadge'
import { RiskBadge } from '../../components/work/RiskBadge/RiskBadge'
import { StatusBadge } from '../../components/work/StatusBadge/StatusBadge'
import { TaskCard } from '../../components/work/TaskCard/TaskCard'
import { TaskFormModal } from '../../components/work/TaskFormModal/TaskFormModal'
import { TimelineItem } from '../../components/work/TimelineItem/TimelineItem'
import { AvatarGroup } from '../../components/work/AvatarGroup/AvatarGroup'
import { Button } from '../../components/ui/Button/Button'
import { EmptyState } from '../../components/ui/EmptyState/EmptyState'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { Select } from '../../components/ui/Select/Select'
import { Textarea } from '../../components/ui/Textarea/Textarea'
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut'
import { useWork } from '../../hooks/useWork'
import type { CaseStatus, WorkTask } from '../../types/work'
import { formatDate } from '../../utils/date'
import styles from './CaseDetailPage.module.css'

export function CaseDetailPage() {
  const { caseId } = useParams<{ caseId: string }>()
  const navigate = useNavigate()
  const {
    getCase,
    getUser,
    getTasksForCase,
    getEvidenceForCase,
    getDecisionsForCase,
    getTimelineForCase,
    getCommentsForCase,
    getSuggestionsForCase,
    updateCaseStatus,
    createTask,
    updateTask,
    deleteTask,
    duplicateTask,
    completeTask,
    toggleChecklistItem,
    addComment,
    recordDecision,
    currentUserId,
  } = useWork()

  const workCase = caseId ? getCase(caseId) : undefined
  const [taskModal, setTaskModal] = useState<{ mode: 'create' | 'edit'; task?: WorkTask } | null>(null)
  const [decisionOpen, setDecisionOpen] = useState(false)

  useKeyboardShortcut({ key: 'n', meta: true }, () => {
    if (workCase) setTaskModal({ mode: 'create' })
  })
  useKeyboardShortcut({ key: 'd', meta: true }, () => {
    if (workCase) setDecisionOpen(true)
  })

  const tasks = useMemo(() => (workCase ? getTasksForCase(workCase.id) : []), [getTasksForCase, workCase])
  const evidence = useMemo(() => (workCase ? getEvidenceForCase(workCase.id) : []), [getEvidenceForCase, workCase])
  const decisions = useMemo(() => (workCase ? getDecisionsForCase(workCase.id) : []), [getDecisionsForCase, workCase])
  const timeline = useMemo(() => (workCase ? getTimelineForCase(workCase.id) : []), [getTimelineForCase, workCase])
  const comments = useMemo(() => (workCase ? getCommentsForCase(workCase.id) : []), [getCommentsForCase, workCase])
  const suggestions = useMemo(
    () => (workCase ? getSuggestionsForCase(workCase.id) : []),
    [getSuggestionsForCase, workCase],
  )

  if (!workCase) {
    return (
      <PageContainer>
        <EmptyState
          title="Case not found"
          description="This case may have been removed or the link is out of date."
          action={
            <Button variant="secondary" onClick={() => navigate('/work/cases')}>
              Back to cases
            </Button>
          }
        />
      </PageContainer>
    )
  }

  const owner = getUser(workCase.ownerId)
  const assignees = workCase.assigneeIds
    .map((id) => getUser(id))
    .filter((user): user is NonNullable<typeof user> => Boolean(user))

  return (
    <div className={styles.page}>
      <PageContainer className={styles.container}>
        <Link to="/work/cases" className={styles.backLink}>
          <ChevronLeft size={14} aria-hidden="true" />
          Cases
        </Link>

        <header className={styles.header}>
          <div className={styles.headerMain}>
            <p className={styles.caseNumber}>{workCase.caseNumber}</p>
            <h1 className={styles.title}>{workCase.title}</h1>
            <div className={styles.badgeRow}>
              <StatusBadge status={workCase.status} />
              <RiskBadge risk={workCase.risk} />
              <PriorityBadge priority={workCase.priority} />
            </div>
          </div>
          <div className={styles.headerActions}>
            <label className={styles.statusSelect}>
              <span>Status</span>
              <Select
                value={workCase.status}
                onChange={(event) => updateCaseStatus(workCase.id, event.target.value as CaseStatus)}
                aria-label="Update case status"
              >
                <option value="open">Open</option>
                <option value="in_review">In review</option>
                <option value="escalated">Escalated</option>
                <option value="completed">Completed</option>
                <option value="closed">Closed</option>
              </Select>
            </label>
            <Button variant="secondary" onClick={() => setDecisionOpen(true)}>
              Record decision
            </Button>
            <Button variant="primary" leadingIcon={<Plus size={14} />} onClick={() => setTaskModal({ mode: 'create' })}>
              New task
            </Button>
          </div>
        </header>

        <div className={styles.layout}>
          <aside className={styles.left} aria-label="Case information">
            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>Case information</h2>
              <dl className={styles.infoList}>
                <div>
                  <dt>Owner</dt>
                  <dd>{owner?.name ?? 'Unassigned'}</dd>
                </div>
                <div>
                  <dt>Assignees</dt>
                  <dd>
                    <AvatarGroup users={assignees} />
                  </dd>
                </div>
                <div>
                  <dt>Due date</dt>
                  <dd>{formatDate(workCase.dueDate)}</dd>
                </div>
                <div>
                  <dt>Created</dt>
                  <dd>{formatDate(workCase.createdAt)}</dd>
                </div>
                <div>
                  <dt>Updated</dt>
                  <dd>{formatDate(workCase.updatedAt)}</dd>
                </div>
                <div>
                  <dt>Tags</dt>
                  <dd className={styles.tags}>{workCase.tags.join(', ') || 'None'}</dd>
                </div>
              </dl>
            </section>

            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>Timeline</h2>
              <ol className={styles.timeline}>
                {timeline.map((event, index) => (
                  <TimelineItem
                    key={event.id}
                    event={event}
                    actor={getUser(event.actorId)}
                    isLast={index === timeline.length - 1}
                  />
                ))}
              </ol>
            </section>

            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>Evidence</h2>
              <div className={styles.stack}>
                {evidence.map((item) => (
                  <EvidenceCard
                    key={item.id}
                    evidence={item}
                    onOpenRegulation={(documentId) => navigate(`/knowledge/library/${documentId}`)}
                  />
                ))}
                {evidence.length === 0 && <p className={styles.muted}>No evidence yet.</p>}
              </div>
            </section>

            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>Documents</h2>
              <ul className={styles.linkList}>
                {workCase.relatedDocumentIds.map((documentId) => (
                  <li key={documentId}>
                    <Link to={`/knowledge/library/${documentId}`}>Open {documentId}</Link>
                  </li>
                ))}
                {workCase.relatedDocumentIds.length === 0 && <li className={styles.muted}>No linked documents.</li>}
              </ul>
            </section>

            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>Comments</h2>
              <ul className={styles.comments}>
                {comments.map((item) => (
                  <li key={item.id}>
                    <p className={styles.commentAuthor}>{getUser(item.authorId)?.name ?? 'Someone'}</p>
                    <p className={styles.commentBody}>{item.body}</p>
                  </li>
                ))}
              </ul>
              <CommentForm
                key={workCase.id}
                onSubmit={(body) => addComment(workCase.id, body)}
              />
            </section>

            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>Decision history</h2>
              <div className={styles.stack}>
                {decisions.map((decision, index) => (
                  <DecisionCard
                    key={decision.id}
                    decision={decision}
                    reviewer={getUser(decision.reviewerId)}
                    isLatest={index === 0}
                  />
                ))}
                {decisions.length === 0 && <p className={styles.muted}>No decisions recorded yet.</p>}
              </div>
            </section>
          </aside>

          <section className={styles.center} aria-label="Case workspace">
            <article className={styles.panel}>
              <h2 className={styles.panelTitle}>Case summary</h2>
              <p className={styles.summary}>{workCase.summary}</p>
              <div className={styles.summaryMeta}>
                <RiskBadge risk={workCase.risk} />
                <PriorityBadge priority={workCase.priority} />
              </div>
            </article>

            <article className={styles.panel}>
              <h2 className={styles.panelTitle}>Related regulations</h2>
              <ul className={styles.linkList}>
                {workCase.relatedDocumentIds.map((documentId) => (
                  <li key={documentId}>
                    <Link to={`/knowledge/library/${documentId}`}>
                      <Scale size={14} aria-hidden="true" /> {documentId}
                    </Link>
                  </li>
                ))}
              </ul>
            </article>

            <article className={styles.panel}>
              <h2 className={styles.panelTitle}>AI suggestions</h2>
              <ul className={styles.suggestionList}>
                {suggestions.map((suggestion) => (
                  <li key={suggestion.id}>
                    <p className={styles.suggestionTitle}>{suggestion.title}</p>
                    <p className={styles.suggestionDetail}>{suggestion.detail}</p>
                  </li>
                ))}
                {suggestions.length === 0 && <li className={styles.muted}>No suggestions for this case.</li>}
              </ul>
            </article>

            <article className={styles.panel}>
              <div className={styles.panelHeaderRow}>
                <h2 className={styles.panelTitle}>Tasks</h2>
                <Button variant="secondary" size="sm" onClick={() => setTaskModal({ mode: 'create' })}>
                  Add task
                </Button>
              </div>
              <p className={styles.shortcutHint}>Shortcuts: ⌘N new task · ⌘D record decision</p>
              <div className={styles.stack}>
                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    owner={getUser(task.ownerId)}
                    onComplete={() => completeTask(task.id)}
                    onEdit={() => setTaskModal({ mode: 'edit', task })}
                    onDuplicate={() => duplicateTask(task.id)}
                    onDelete={() => deleteTask(task.id)}
                    onToggleChecklist={(itemId) => toggleChecklistItem(task.id, itemId)}
                  />
                ))}
                {tasks.length === 0 && <p className={styles.muted}>No tasks yet. Create one to start the workflow.</p>}
              </div>
            </article>
          </section>

          <aside className={styles.right} aria-label="References">
            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>AI assistant</h2>
              <p className={styles.muted}>
                Case guidance and risk observations are available in the side AI Assistant panel.
              </p>
              <Button variant="secondary" size="sm" onClick={() => navigate('/work/cases/' + workCase.id)}>
                Focus this case
              </Button>
            </section>
            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>References</h2>
              <ul className={styles.linkList}>
                {workCase.relatedDocumentIds.map((documentId) => (
                  <li key={documentId}>
                    <Link to={`/knowledge/library/${documentId}`}>{documentId}</Link>
                  </li>
                ))}
              </ul>
            </section>
            <section className={styles.panel}>
              <h2 className={styles.panelTitle}>Related cases</h2>
              <ul className={styles.linkList}>
                {workCase.relatedCaseIds.map((relatedId) => (
                  <li key={relatedId}>
                    <Link to={`/work/cases/${relatedId}`}>{relatedId}</Link>
                  </li>
                ))}
                {workCase.relatedCaseIds.length === 0 && <li className={styles.muted}>No related cases.</li>}
              </ul>
            </section>
          </aside>
        </div>
      </PageContainer>

      <TaskFormModal
        open={Boolean(taskModal)}
        mode={taskModal?.mode ?? 'create'}
        initial={taskModal?.task}
        onCancel={() => setTaskModal(null)}
        onSubmit={(values) => {
          if (taskModal?.mode === 'edit' && taskModal.task) {
            updateTask(taskModal.task.id, values)
          } else {
            createTask({ caseId: workCase.id, ...values })
          }
          setTaskModal(null)
        }}
      />

      <DecisionFormModal
        open={decisionOpen}
        onCancel={() => setDecisionOpen(false)}
        onSubmit={({ outcome, reason }) => {
          recordDecision({
            caseId: workCase.id,
            outcome,
            reason,
            supportingDocumentIds: workCase.relatedDocumentIds,
            evidenceIds: evidence.map((item) => item.id),
            reviewerId: currentUserId,
          })
          setDecisionOpen(false)
        }}
      />
    </div>
  )
}

function CommentForm({ onSubmit }: { onSubmit: (body: string) => void }) {
  const [comment, setComment] = useState('')

  return (
    <form
      className={styles.commentForm}
      onSubmit={(event) => {
        event.preventDefault()
        if (!comment.trim()) return
        onSubmit(comment)
        setComment('')
      }}
    >
      <Textarea
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder="Add a comment..."
        rows={3}
        aria-label="New comment"
      />
      <Button
        type="submit"
        variant="secondary"
        size="sm"
        leadingIcon={<MessageSquarePlus size={14} />}
        disabled={!comment.trim()}
      >
        Comment
      </Button>
    </form>
  )
}
