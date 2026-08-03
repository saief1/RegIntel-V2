import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { WORK_ACTIVITY } from '../data/work/activity'
import { WORK_CASES } from '../data/work/cases'
import { WORK_COMMENTS } from '../data/work/comments'
import { WORK_DECISIONS } from '../data/work/decisions'
import { WORK_EVIDENCE } from '../data/work/evidence'
import { WORK_NOTIFICATIONS } from '../data/work/notifications'
import { WORK_SUGGESTIONS } from '../data/work/suggestions'
import { WORK_TASKS } from '../data/work/tasks'
import { WORK_TIMELINE } from '../data/work/timeline'
import { WORK_USERS, getWorkUser } from '../data/work/users'
import { createId } from '../utils/id'
import type {
  ActivityItem,
  AppNotification,
  CaseStatus,
  DecisionRecord,
  TimelineEvent,
  WorkCase,
  WorkComment,
  WorkTask,
} from '../types/work'
import { WorkContext, type WorkContextValue } from './WorkContext'

const CURRENT_USER_ID = 'u-01'

export function WorkProvider({ children }: { children: ReactNode }) {
  const [cases, setCases] = useState<WorkCase[]>(WORK_CASES)
  const [tasks, setTasks] = useState<WorkTask[]>(WORK_TASKS)
  const [evidence] = useState(WORK_EVIDENCE)
  const [decisions, setDecisions] = useState(WORK_DECISIONS)
  const [timeline, setTimeline] = useState<TimelineEvent[]>(WORK_TIMELINE)
  const [comments, setComments] = useState<WorkComment[]>(WORK_COMMENTS)
  const [activity, setActivity] = useState<ActivityItem[]>(WORK_ACTIVITY)
  const [notifications, setNotifications] = useState<AppNotification[]>(WORK_NOTIFICATIONS)

  const getCase = useCallback((id: string) => cases.find((item) => item.id === id), [cases])

  const pushActivity = useCallback((title: string, description: string, caseId?: string) => {
    setActivity((current) => [
      {
        id: createId('act'),
        title,
        description,
        actorId: CURRENT_USER_ID,
        caseId,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ])
  }, [])

  const pushTimeline = useCallback((event: Omit<TimelineEvent, 'id' | 'createdAt' | 'actorId'> & { actorId?: string }) => {
    setTimeline((current) => [
      {
        id: createId('tl'),
        actorId: event.actorId ?? CURRENT_USER_ID,
        createdAt: new Date().toISOString(),
        ...event,
      },
      ...current,
    ])
  }, [])

  const updateCaseStatus = useCallback(
    (id: string, status: CaseStatus) => {
      setCases((current) =>
        current.map((item) => (item.id === id ? { ...item, status, updatedAt: new Date().toISOString() } : item)),
      )
      pushTimeline({
        caseId: id,
        type: status === 'escalated' ? 'escalated' : status === 'closed' || status === 'completed' ? 'closed' : 'reviewed',
        title: `Status set to ${status.replace('_', ' ')}`,
      })
      pushActivity('Case status updated', `Case status changed to ${status.replace('_', ' ')}.`, id)
    },
    [pushActivity, pushTimeline],
  )

  const getTasksForCase = useCallback((caseId: string) => tasks.filter((task) => task.caseId === caseId), [tasks])

  const createTask: WorkContextValue['createTask'] = useCallback(
    (input) => {
      const now = new Date().toISOString()
      const task: WorkTask = {
        id: createId('task'),
        checklist: input.checklist ?? [],
        createdAt: now,
        updatedAt: now,
        ...input,
      }
      setTasks((current) => [task, ...current])
      pushTimeline({ caseId: input.caseId, type: 'task_updated', title: 'Task created', description: task.title })
      pushActivity('Task created', task.title, input.caseId)
      return task
    },
    [pushActivity, pushTimeline],
  )

  const updateTask: WorkContextValue['updateTask'] = useCallback(
    (id, patch) => {
      setTasks((current) =>
        current.map((task) =>
          task.id === id
            ? {
                ...task,
                ...patch,
                updatedAt: new Date().toISOString(),
              }
            : task,
        ),
      )
      const task = tasks.find((item) => item.id === id)
      if (task) {
        pushTimeline({ caseId: task.caseId, type: 'task_updated', title: 'Task updated', description: task.title })
      }
    },
    [pushTimeline, tasks],
  )

  const deleteTask = useCallback(
    (id: string) => {
      const task = tasks.find((item) => item.id === id)
      setTasks((current) => current.filter((item) => item.id !== id))
      if (task) pushActivity('Task deleted', task.title, task.caseId)
    },
    [pushActivity, tasks],
  )

  const duplicateTask = useCallback(
    (id: string) => {
      const source = tasks.find((item) => item.id === id)
      if (!source) return undefined
      return createTask({
        caseId: source.caseId,
        title: `${source.title} (copy)`,
        description: source.description,
        status: 'todo',
        priority: source.priority,
        ownerId: source.ownerId,
        dueDate: source.dueDate,
        checklist: source.checklist.map((item) => ({ ...item, id: createId('cl'), done: false })),
      })
    },
    [createTask, tasks],
  )

  const completeTask = useCallback(
    (id: string) => {
      updateTask(id, { status: 'done' })
      const task = tasks.find((item) => item.id === id)
      if (task) pushActivity('Task completed', task.title, task.caseId)
    },
    [pushActivity, tasks, updateTask],
  )

  const toggleChecklistItem = useCallback((taskId: string, itemId: string) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId
          ? {
              ...task,
              checklist: task.checklist.map((item) => (item.id === itemId ? { ...item, done: !item.done } : item)),
              updatedAt: new Date().toISOString(),
            }
          : task,
      ),
    )
  }, [])

  const getEvidenceForCase = useCallback(
    (caseId: string) => evidence.filter((item) => item.caseId === caseId),
    [evidence],
  )

  const getDecisionsForCase = useCallback(
    (caseId: string) =>
      decisions
        .filter((item) => item.caseId === caseId)
        .sort((a, b) => b.version - a.version || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [decisions],
  )

  const recordDecision: WorkContextValue['recordDecision'] = useCallback(
    (input) => {
      const existing = decisions.filter((item) => item.caseId === input.caseId)
      const version = existing.reduce((max, item) => Math.max(max, item.version), 0) + 1
      const record: DecisionRecord = {
        id: createId('dec'),
        version,
        createdAt: new Date().toISOString(),
        ...input,
      }
      setDecisions((current) => [record, ...current])
      pushTimeline({
        caseId: input.caseId,
        type: 'decision_recorded',
        title: 'Decision recorded',
        description: `${input.outcome} — ${input.reason}`,
      })
      pushActivity('Decision recorded', `${input.outcome}: ${input.reason}`, input.caseId)
      return record
    },
    [decisions, pushActivity, pushTimeline],
  )

  const getTimelineForCase = useCallback(
    (caseId: string) =>
      timeline
        .filter((item) => item.caseId === caseId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [timeline],
  )

  const getCommentsForCase = useCallback(
    (caseId: string) =>
      comments
        .filter((item) => item.caseId === caseId)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [comments],
  )

  const addComment = useCallback(
    (caseId: string, body: string, authorId = CURRENT_USER_ID, taskId?: string) => {
      const trimmed = body.trim()
      if (!trimmed) return
      setComments((current) => [
        ...current,
        {
          id: createId('cm'),
          caseId,
          authorId,
          body: trimmed,
          taskId,
          createdAt: new Date().toISOString(),
        },
      ])
      pushTimeline({ caseId, type: 'comment', title: 'Comment added', description: trimmed, actorId: authorId })
      pushActivity('Comment added', trimmed, caseId)
    },
    [pushActivity, pushTimeline],
  )

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((current) => current.map((item) => (item.id === id ? { ...item, read: true } : item)))
  }, [])

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((current) => current.map((item) => ({ ...item, read: true })))
  }, [])

  const dismissNotification = useCallback((id: string) => {
    setNotifications((current) => current.filter((item) => item.id !== id))
  }, [])

  const clearAllNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  const getSuggestionsForCase = useCallback(
    (caseId: string) => WORK_SUGGESTIONS.filter((item) => item.caseId === caseId),
    [],
  )

  const value = useMemo<WorkContextValue>(
    () => ({
      users: WORK_USERS,
      getUser: getWorkUser,
      cases,
      getCase,
      updateCaseStatus,
      tasks,
      getTasksForCase,
      createTask,
      updateTask,
      deleteTask,
      duplicateTask,
      completeTask,
      toggleChecklistItem,
      evidence,
      getEvidenceForCase,
      decisions,
      getDecisionsForCase,
      recordDecision,
      timeline,
      getTimelineForCase,
      comments,
      getCommentsForCase,
      addComment,
      activity,
      notifications,
      unreadNotificationCount: notifications.filter((item) => !item.read).length,
      markNotificationRead,
      markAllNotificationsRead,
      dismissNotification,
      clearAllNotifications,
      suggestions: WORK_SUGGESTIONS,
      getSuggestionsForCase,
      currentUserId: CURRENT_USER_ID,
    }),
    [
      activity,
      addComment,
      cases,
      clearAllNotifications,
      comments,
      completeTask,
      createTask,
      decisions,
      deleteTask,
      dismissNotification,
      duplicateTask,
      evidence,
      getCase,
      getCommentsForCase,
      getDecisionsForCase,
      getEvidenceForCase,
      getSuggestionsForCase,
      getTasksForCase,
      getTimelineForCase,
      markAllNotificationsRead,
      markNotificationRead,
      notifications,
      recordDecision,
      tasks,
      timeline,
      toggleChecklistItem,
      updateCaseStatus,
      updateTask,
    ],
  )

  return <WorkContext.Provider value={value}>{children}</WorkContext.Provider>
}
