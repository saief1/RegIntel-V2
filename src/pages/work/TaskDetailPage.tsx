import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, MessageSquarePlus, Sparkles } from 'lucide-react'
import { ChecklistProgress } from '../../components/work/ChecklistProgress/ChecklistProgress'
import { EvidenceCard } from '../../components/work/EvidenceCard/EvidenceCard'
import { PriorityBadge } from '../../components/work/PriorityBadge/PriorityBadge'
import { SmartEstimateBadge } from '../../components/work/SmartEstimateBadge/SmartEstimateBadge'
import { StatusBadge } from '../../components/work/StatusBadge/StatusBadge'
import { TimelineItem } from '../../components/work/TimelineItem/TimelineItem'
import { Button } from '../../components/ui/Button/Button'
import { EmptyState } from '../../components/ui/EmptyState/EmptyState'
import { Input } from '../../components/ui/Input/Input'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { Select } from '../../components/ui/Select/Select'
import { Textarea } from '../../components/ui/Textarea/Textarea'
import { useWork } from '../../hooks/useWork'
import type { Priority, TaskStatus } from '../../types/work'
import { formatDate, formatRelativeTime } from '../../utils/date'
import { createId } from '../../utils/id'
import styles from './TaskDetailPage.module.css'

export function TaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>()
  const navigate = useNavigate()
  const {
    getTask,
    getUser,
    getCase,
    getSubtasks,
    getCommentsForTask,
    getTimelineForTask,
    getEvidenceForTask,
    updateTask,
    completeTask,
    toggleChecklistItem,
    setChecklist,
    createTask,
    addComment,
    users,
    currentUserId,
  } = useWork()

  const task = taskId ? getTask(taskId) : undefined
  const [comment, setComment] = useState('')
  const [subtaskTitle, setSubtaskTitle] = useState('')

  const subtasks = useMemo(() => (task ? getSubtasks(task.id) : []), [getSubtasks, task])
  const comments = useMemo(() => (task ? getCommentsForTask(task.id) : []), [getCommentsForTask, task])
  const timeline = useMemo(() => (task ? getTimelineForTask(task.id) : []), [getTimelineForTask, task])
  const evidence = useMemo(() => (task ? getEvidenceForTask(task.id) : []), [getEvidenceForTask, task])

  if (!task) {
    return (
      <PageContainer>
        <EmptyState
          title="Task not found"
          description="This work item may have been removed."
          action={
            <Button variant="secondary" onClick={() => navigate('/work')}>
              Back to Action Center
            </Button>
          }
        />
      </PageContainer>
    )
  }

  const currentTask = task
  const owner = getUser(currentTask.ownerId)
  const workCase = getCase(currentTask.caseId)

  function submitComment(event: FormEvent) {
    event.preventDefault()
    if (!comment.trim()) return
    addComment(currentTask.caseId, comment, currentUserId, currentTask.id)
    setComment('')
  }

  function addSubtask(event: FormEvent) {
    event.preventDefault()
    if (!subtaskTitle.trim()) return
    createTask({
      caseId: currentTask.caseId,
      title: subtaskTitle.trim(),
      parentId: currentTask.id,
      ownerId: currentTask.ownerId,
      priority: currentTask.priority,
      linkedRegulation: currentTask.linkedRegulation,
      aiGenerated: false,
      status: 'todo',
    })
    setSubtaskTitle('')
  }

  function addChecklistItem() {
    const label = window.prompt('Checklist item')
    if (!label?.trim()) return
    setChecklist(currentTask.id, [
      ...currentTask.checklist,
      { id: createId('cl'), label: label.trim(), done: false },
    ])
  }

  return (
    <div className={styles.page}>
      <PageContainer className={styles.container}>
        <Link to="/work" className={styles.back}>
          <ChevronLeft size={14} aria-hidden="true" />
          Action Center
        </Link>

        <header className={styles.header}>
          <div className={styles.titleBlock}>
            <div className={styles.badges}>
              <StatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
              {task.aiGenerated && (
                <span className={styles.ai}>
                  <Sparkles size={12} aria-hidden="true" />
                  AI Generated
                </span>
              )}
            </div>
            <Input
              className={styles.titleInput}
              value={task.title}
              aria-label="Task title"
              onChange={(event) => updateTask(task.id, { title: event.target.value })}
            />
            <Textarea
              value={task.description}
              aria-label="Task description"
              rows={4}
              onChange={(event) => updateTask(task.id, { description: event.target.value })}
            />
          </div>

          <aside className={styles.properties}>
            <label>
              Status
              <Select
                value={task.status}
                onChange={(event) => updateTask(task.id, { status: event.target.value as TaskStatus })}
              >
                <option value="backlog">Backlog</option>
                <option value="todo">To do</option>
                <option value="in_progress">In progress</option>
                <option value="review">Review</option>
                <option value="blocked">Blocked</option>
                <option value="completed">Completed</option>
              </Select>
            </label>
            <label>
              Priority
              <Select
                value={task.priority}
                onChange={(event) => updateTask(task.id, { priority: event.target.value as Priority })}
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </Select>
            </label>
            <label>
              Owner
              <Select
                value={task.ownerId}
                onChange={(event) => updateTask(task.id, { ownerId: event.target.value })}
              >
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </Select>
            </label>
            <label>
              Due date
              <Input
                type="date"
                value={task.dueDate.slice(0, 10)}
                onChange={(event) => updateTask(task.id, { dueDate: event.target.value })}
              />
            </label>
            <div className={styles.metaBlock}>
              <span>Linked regulation</span>
              <strong>{task.linkedRegulation ?? 'None'}</strong>
            </div>
            <div className={styles.metaBlock}>
              <span>Linked policies</span>
              <strong>{task.linkedPolicyIds.length ? task.linkedPolicyIds.join(', ') : 'None'}</strong>
            </div>
            <div className={styles.metaBlock}>
              <span>Case</span>
              <Link to={`/work/cases/${task.caseId}`}>{workCase?.caseNumber ?? task.caseId}</Link>
            </div>
            <div className={styles.metaBlock}>
              <span>Owner</span>
              <strong>{owner?.name ?? 'Unassigned'}</strong>
            </div>
            {task.estimate && <SmartEstimateBadge estimate={task.estimate} />}
            {task.status !== 'completed' && (
              <Button variant="primary" onClick={() => completeTask(task.id)}>
                Mark completed
              </Button>
            )}
          </aside>
        </header>

        <div className={styles.grid}>
          <section className={styles.panel}>
            <header className={styles.panelHeader}>
              <h2>Checklist</h2>
              <Button size="sm" variant="ghost" onClick={addChecklistItem}>
                Add item
              </Button>
            </header>
            {task.checklist.length > 0 ? (
              <>
                <ChecklistProgress items={task.checklist} />
                <ul className={styles.checklist}>
                  {task.checklist.map((item) => (
                    <li key={item.id}>
                      <label>
                        <input
                          type="checkbox"
                          checked={item.done}
                          onChange={() => toggleChecklistItem(task.id, item.id)}
                        />
                        <span data-done={item.done || undefined}>{item.label}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className={styles.muted}>No checklist items yet.</p>
            )}
          </section>

          <section className={styles.panel}>
            <header className={styles.panelHeader}>
              <h2>Subtasks</h2>
            </header>
            <ul className={styles.subtasks}>
              {subtasks.map((item) => (
                <li key={item.id}>
                  <button type="button" onClick={() => navigate(`/work/tasks/${item.id}`)}>
                    <StatusBadge status={item.status} />
                    <span>{item.title}</span>
                  </button>
                </li>
              ))}
            </ul>
            <form className={styles.inlineForm} onSubmit={addSubtask}>
              <Input
                value={subtaskTitle}
                onChange={(event) => setSubtaskTitle(event.target.value)}
                placeholder="Add subtask"
                aria-label="New subtask"
              />
              <Button type="submit" size="sm" variant="secondary" disabled={!subtaskTitle.trim()}>
                Add
              </Button>
            </form>
          </section>

          <section className={styles.panel}>
            <header className={styles.panelHeader}>
              <h2>Evidence</h2>
            </header>
            <div className={styles.stack}>
              {evidence.slice(0, 4).map((item) => (
                <EvidenceCard key={item.id} evidence={item} />
              ))}
              {evidence.length === 0 && <p className={styles.muted}>No linked evidence yet.</p>}
            </div>
          </section>

          <section className={styles.panel}>
            <header className={styles.panelHeader}>
              <h2>Comments</h2>
            </header>
            <ul className={styles.comments}>
              {comments.map((item) => (
                <li key={item.id}>
                  <strong>{getUser(item.authorId)?.name ?? 'Someone'}</strong>
                  <p>{item.body}</p>
                  <time dateTime={item.createdAt}>{formatRelativeTime(item.createdAt)}</time>
                </li>
              ))}
            </ul>
            <form className={styles.commentForm} onSubmit={submitComment}>
              <Textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                rows={3}
                placeholder="Leave a comment…"
                aria-label="Comment"
              />
              <Button type="submit" size="sm" leadingIcon={<MessageSquarePlus size={14} />} disabled={!comment.trim()}>
                Comment
              </Button>
            </form>
          </section>

          <section className={styles.panelWide}>
            <header className={styles.panelHeader}>
              <h2>Activity & timeline</h2>
              <span className={styles.muted}>Updated {formatDate(task.updatedAt)}</span>
            </header>
            <ul className={styles.timeline}>
              {timeline.map((event, index) => (
                <TimelineItem
                  key={event.id}
                  event={event}
                  actor={getUser(event.actorId)}
                  isLast={index === timeline.length - 1}
                />
              ))}
            </ul>
            {timeline.length === 0 && <p className={styles.muted}>No activity yet.</p>}
          </section>
        </div>
      </PageContainer>
    </div>
  )
}
