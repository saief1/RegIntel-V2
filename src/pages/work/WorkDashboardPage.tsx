import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Briefcase,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Columns3,
  GanttChart,
  List,
  Plus,
} from 'lucide-react'
import { ActionTaskCard } from '../../components/work/ActionTaskCard/ActionTaskCard'
import { BulkActionBar } from '../../components/work/BulkActionBar/BulkActionBar'
import { KanbanBoard } from '../../components/work/KanbanBoard/KanbanBoard'
import { TaskFormModal } from '../../components/work/TaskFormModal/TaskFormModal'
import { WorkCalendarView } from '../../components/work/WorkCalendarView/WorkCalendarView'
import { WorkTimelineView } from '../../components/work/WorkTimelineView/WorkTimelineView'
import { Button } from '../../components/ui/Button/Button'
import { EmptyState } from '../../components/ui/EmptyState/EmptyState'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { useWork } from '../../hooks/useWork'
import type { Priority, TaskStatus, WorkTask } from '../../types/work'
import { isDueToday, isOverdue } from '../../utils/smartDueDates'
import styles from './WorkDashboardPage.module.css'

type WorkView = 'action' | 'board' | 'list' | 'calendar' | 'timeline'
type ActionSection = 'mine' | 'assigned' | 'today' | 'overdue' | 'awaiting' | 'completed'

const VIEWS: { id: WorkView; label: string; icon: typeof List }[] = [
  { id: 'action', label: 'Action Center', icon: ClipboardList },
  { id: 'board', label: 'Board', icon: Columns3 },
  { id: 'list', label: 'List', icon: List },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays },
  { id: 'timeline', label: 'Timeline', icon: GanttChart },
]

export function WorkDashboardPage() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const {
    tasks,
    users,
    getUser,
    currentUserId,
    createTask,
    updateTask,
    deleteTasks,
    bulkUpdateTasks,
    activity,
    timeline,
  } = useWork()

  const view = (params.get('view') as WorkView) || 'action'
  const activeSection = (params.get('section') as ActionSection | null) ?? 'mine'
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [createOpen, setCreateOpen] = useState(false)

  function setActiveSection(section: ActionSection) {
    const nextParams = new URLSearchParams(params)
    nextParams.set('section', section)
    if (!nextParams.get('view')) nextParams.set('view', 'action')
    setParams(nextParams, { replace: true })
  }

  const rootTasks = useMemo(() => tasks.filter((task) => !task.parentId), [tasks])

  const sections = useMemo(() => {
    const mine = rootTasks.filter((task) => task.ownerId === currentUserId && task.status !== 'completed')
    const assigned = rootTasks.filter((task) => task.ownerId !== currentUserId && task.status !== 'completed')
    const today = rootTasks.filter((task) => isDueToday(task.dueDate) && task.status !== 'completed')
    const overdue = rootTasks.filter((task) => isOverdue(task.dueDate, task.status))
    const awaiting = rootTasks.filter((task) => task.awaitingApproval || task.status === 'review')
    const completed = rootTasks.filter((task) => task.status === 'completed')
    return { mine, assigned, today, overdue, awaiting, completed }
  }, [currentUserId, rootTasks])

  const personal = useMemo(() => {
    const todaysWork = sections.today
    const awaitingMe = rootTasks.filter(
      (task) => task.awaitingApproval && (task.ownerId === currentUserId || task.status === 'review'),
    )
    const recentlyCompleted = [...sections.completed]
      .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
      .slice(0, 5)
    const upcomingReviews = rootTasks
      .filter((task) => task.kind === 'risk_review' || task.status === 'review')
      .slice(0, 5)
    return { todaysWork, awaitingMe, recentlyCompleted, upcomingReviews }
  }, [currentUserId, rootTasks, sections.completed, sections.today])

  const sectionTasks: Record<ActionSection, WorkTask[]> = {
    mine: sections.mine,
    assigned: sections.assigned,
    today: sections.today,
    overdue: sections.overdue,
    awaiting: sections.awaiting,
    completed: sections.completed,
  }

  function setView(next: WorkView) {
    const nextParams = new URLSearchParams(params)
    nextParams.set('view', next)
    setParams(nextParams, { replace: true })
  }

  function toggleSelect(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function exportSelected() {
    const rows = rootTasks.filter((task) => selectedIds.has(task.id))
    const payload = rows.map((task) => ({
      title: task.title,
      status: task.status,
      priority: task.priority,
      owner: getUser(task.ownerId)?.name,
      dueDate: task.dueDate,
      regulation: task.linkedRegulation,
    }))
    void navigator.clipboard.writeText(JSON.stringify(payload, null, 2))
  }

  const ownerName = (id: string) => getUser(id)?.name ?? 'Unassigned'

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        title="Work"
        description="Action Center — turn compliance insight into managed execution."
        icon={<Briefcase size={20} />}
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate('/work/workflows')}>
              Workflows
            </Button>
            <Button variant="secondary" onClick={() => navigate('/work/calendar')}>
              Calendar
            </Button>
            <Button variant="secondary" onClick={() => navigate('/work/cases')}>
              Cases
            </Button>
            <Button variant="primary" leadingIcon={<Plus size={14} />} onClick={() => setCreateOpen(true)}>
              New task
            </Button>
          </>
        }
      />

      <div className={styles.viewTabs} role="tablist" aria-label="Work views">
        {VIEWS.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={view === item.id}
              className={view === item.id ? styles.tabActive : styles.tab}
              onClick={() => setView(item.id)}
            >
              <Icon size={14} aria-hidden="true" />
              {item.label}
            </button>
          )
        })}
      </div>

      <BulkActionBar
        count={selectedIds.size}
        onClear={() => setSelectedIds(new Set())}
        onAssign={(ownerId) => {
          bulkUpdateTasks([...selectedIds], { ownerId })
          setSelectedIds(new Set())
        }}
        onMove={(status) => {
          bulkUpdateTasks([...selectedIds], { status })
          setSelectedIds(new Set())
        }}
        onPriority={(priority: Priority) => {
          bulkUpdateTasks([...selectedIds], { priority })
          setSelectedIds(new Set())
        }}
        onDelete={() => {
          deleteTasks([...selectedIds])
          setSelectedIds(new Set())
        }}
        onExport={exportSelected}
      />

      {view === 'action' && (
        <div className={styles.actionLayout}>
          <aside className={styles.personal} aria-label="Personal dashboard">
            <PersonalBlock title="My Tasks" count={sections.mine.length} />
            <PersonalBlock title="Today's Work" count={personal.todaysWork.length} />
            <PersonalBlock title="Awaiting Me" count={personal.awaitingMe.length} />
            <PersonalBlock title="Recently Completed" count={personal.recentlyCompleted.length} />
            <PersonalBlock title="Upcoming Reviews" count={personal.upcomingReviews.length} />
          </aside>

          <div className={styles.actionMain}>
            <div className={styles.sectionTabs}>
              {(
                [
                  ['mine', 'My Tasks', sections.mine.length],
                  ['assigned', 'Assigned', sections.assigned.length],
                  ['today', 'Due Today', sections.today.length],
                  ['overdue', 'Overdue', sections.overdue.length],
                  ['awaiting', 'Awaiting Approval', sections.awaiting.length],
                  ['completed', 'Completed', sections.completed.length],
                ] as const
              ).map(([id, label, count]) => (
                <button
                  key={id}
                  type="button"
                  className={activeSection === id ? styles.sectionActive : styles.sectionTab}
                  onClick={() => setActiveSection(id)}
                >
                  {label}
                  <span>{count}</span>
                </button>
              ))}
            </div>

            <div className={styles.cardGrid}>
              {sectionTasks[activeSection].map((task) => (
                <ActionTaskCard
                  key={task.id}
                  task={task}
                  ownerName={ownerName(task.ownerId)}
                  selected={selectedIds.has(task.id)}
                  onToggleSelect={toggleSelect}
                />
              ))}
              {sectionTasks[activeSection].length === 0 && (
                <EmptyState
                  title="No items in this section"
                  description="Tasks that match this filter will appear here."
                />
              )}
            </div>
          </div>
        </div>
      )}

      {view === 'board' && (
        <KanbanBoard
          tasks={rootTasks}
          getOwnerName={ownerName}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onMove={(taskId, status: TaskStatus) => updateTask(taskId, { status })}
        />
      )}

      {view === 'list' && (
        <div className={styles.cardGrid}>
          {rootTasks.map((task) => (
            <ActionTaskCard
              key={task.id}
              task={task}
              ownerName={ownerName(task.ownerId)}
              selected={selectedIds.has(task.id)}
              onToggleSelect={toggleSelect}
            />
          ))}
        </div>
      )}

      {view === 'calendar' && <WorkCalendarView tasks={rootTasks} />}

      {view === 'timeline' && (
        <WorkTimelineView
          timeline={timeline}
          activity={activity}
          getActorName={(id) => getUser(id)?.name ?? users[0]?.name ?? 'Someone'}
        />
      )}

      <TaskFormModal
        open={createOpen}
        mode="create"
        onCancel={() => setCreateOpen(false)}
        onSubmit={(values) => {
          const task = createTask(values)
          setCreateOpen(false)
          navigate(`/work/tasks/${task.id}`)
        }}
      />
    </PageContainer>
  )
}

function PersonalBlock({ title, count }: { title: string; count: number }) {
  return (
    <div className={styles.personalCard}>
      <span>{title}</span>
      <strong>{count}</strong>
      <CheckCircle2 size={14} aria-hidden="true" />
    </div>
  )
}
