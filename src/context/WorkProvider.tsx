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
import { AI_ACTION_OPTIONS, defaultTitleForAction } from '../utils/aiWorkActions'
import { createId } from '../utils/id'
import { dueDateFromDays, estimateSmartDue } from '../utils/smartDueDates'
import type {
  ActivityItem,
  AppNotification,
  CaseStatus,
  ChecklistItem,
  DecisionRecord,
  TimelineEvent,
  WorkCase,
  WorkComment,
  WorkTask,
} from '../types/work'
import { WorkContext, type CreateWorkTaskInput, type WorkContextValue } from './WorkContext'

const CURRENT_USER_ID = 'u-01'
const DEFAULT_CASE_ID = 'case-01'

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
  const getTask = useCallback((id: string) => tasks.find((item) => item.id === id), [tasks])

  const pushActivity = useCallback((title: string, description: string, caseId?: string, taskId?: string) => {
    setActivity((current) => [
      {
        id: createId('act'),
        title,
        description,
        actorId: CURRENT_USER_ID,
        caseId,
        taskId,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ])
  }, [])

  const pushTimeline = useCallback(
    (event: Omit<TimelineEvent, 'id' | 'createdAt' | 'actorId'> & { actorId?: string }) => {
      setTimeline((current) => [
        {
          id: createId('tl'),
          actorId: event.actorId ?? CURRENT_USER_ID,
          createdAt: new Date().toISOString(),
          ...event,
        },
        ...current,
      ])
    },
    [],
  )

  const pushNotification: WorkContextValue['pushNotification'] = useCallback((input) => {
    setNotifications((current) => [
      {
        id: createId('n'),
        createdAt: new Date().toISOString(),
        read: input.read ?? false,
        ...input,
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
  const getSubtasks = useCallback((parentId: string) => tasks.filter((task) => task.parentId === parentId), [tasks])

  const createTask: WorkContextValue['createTask'] = useCallback(
    (input: CreateWorkTaskInput) => {
      const now = new Date().toISOString()
      const kind = input.kind ?? 'task'
      const priority = input.priority ?? 'medium'
      const estimate = input.estimate ?? estimateSmartDue(priority, kind)
      const dueDate = input.dueDate ?? dueDateFromDays(estimate.recommendedDays)
      const task: WorkTask = {
        id: createId('task'),
        caseId: input.caseId ?? DEFAULT_CASE_ID,
        title: input.title,
        description: input.description ?? '',
        status: input.status ?? 'todo',
        priority,
        ownerId: input.ownerId ?? CURRENT_USER_ID,
        dueDate,
        checklist: input.checklist ?? [],
        kind,
        aiGenerated: input.aiGenerated ?? false,
        linkedRegulation: input.linkedRegulation,
        linkedPolicyIds: input.linkedPolicyIds ?? [],
        parentId: input.parentId,
        awaitingApproval: input.awaitingApproval ?? false,
        estimate,
        createdAt: now,
        updatedAt: now,
      }
      setTasks((current) => [task, ...current])
      pushTimeline({
        caseId: task.caseId,
        taskId: task.id,
        type: task.aiGenerated ? 'ai_action' : 'task_updated',
        title: task.aiGenerated ? 'AI created task' : 'Task created',
        description: task.title,
      })
      pushActivity(task.aiGenerated ? 'AI created task' : 'Task created', task.title, task.caseId, task.id)
      if (task.aiGenerated) {
        pushNotification({
          kind: 'ai',
          title: 'AI created work',
          body: task.title,
          caseId: task.caseId,
          taskId: task.id,
          href: `/work/tasks/${task.id}`,
          group: 'AI',
        })
      }
      return task
    },
    [pushActivity, pushNotification, pushTimeline],
  )

  const createTasksFromLabels: WorkContextValue['createTasksFromLabels'] = useCallback(
    (labels, defaults = {}) =>
      labels
        .map((label) => label.trim())
        .filter(Boolean)
        .map((label) =>
          createTask({
            ...defaults,
            title: label,
            description: defaults.description ?? `Implementation step: ${label}`,
            aiGenerated: defaults.aiGenerated ?? true,
            checklist: [],
          }),
        ),
    [createTask],
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
        pushTimeline({
          caseId: task.caseId,
          taskId: id,
          type: 'task_updated',
          title: 'Task updated',
          description: patch.title ?? task.title,
        })
      }
    },
    [pushTimeline, tasks],
  )

  const deleteTask = useCallback(
    (id: string) => {
      const task = tasks.find((item) => item.id === id)
      setTasks((current) => current.filter((item) => item.id !== id && item.parentId !== id))
      if (task) pushActivity('Task deleted', task.title, task.caseId, task.id)
    },
    [pushActivity, tasks],
  )

  const deleteTasks = useCallback(
    (ids: string[]) => {
      const idSet = new Set(ids)
      setTasks((current) => current.filter((item) => !idSet.has(item.id) && !(item.parentId && idSet.has(item.parentId))))
      pushActivity('Tasks deleted', `${ids.length} tasks removed`)
    },
    [pushActivity],
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
        kind: source.kind,
        aiGenerated: false,
        linkedRegulation: source.linkedRegulation,
        linkedPolicyIds: source.linkedPolicyIds,
        estimate: source.estimate,
        checklist: source.checklist.map((item) => ({ ...item, id: createId('cl'), done: false })),
      })
    },
    [createTask, tasks],
  )

  const completeTask = useCallback(
    (id: string) => {
      updateTask(id, { status: 'completed', awaitingApproval: false })
      const task = tasks.find((item) => item.id === id)
      if (task) pushActivity('Task completed', task.title, task.caseId, task.id)
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

  const setChecklist = useCallback(
    (taskId: string, checklist: ChecklistItem[]) => {
      updateTask(taskId, { checklist })
      const task = tasks.find((item) => item.id === taskId)
      if (task) {
        pushTimeline({
          caseId: task.caseId,
          taskId,
          type: 'checklist_generated',
          title: 'Checklist updated',
          description: `${checklist.length} items`,
        })
      }
    },
    [pushTimeline, tasks, updateTask],
  )

  const bulkUpdateTasks: WorkContextValue['bulkUpdateTasks'] = useCallback(
    (ids, patch) => {
      const idSet = new Set(ids)
      setTasks((current) =>
        current.map((task) =>
          idSet.has(task.id) ? { ...task, ...patch, updatedAt: new Date().toISOString() } : task,
        ),
      )
      pushActivity('Bulk update', `Updated ${ids.length} tasks`)
    },
    [pushActivity],
  )

  const createFromAiAction: WorkContextValue['createFromAiAction'] = useCallback(
    ({ action, title, description, ownerId, priority, linkedRegulation, checklistLabels }) => {
      const option = AI_ACTION_OPTIONS.find((item) => item.type === action)
      const kind = option?.kind ?? 'task'
      const resolvedPriority = priority ?? 'medium'
      const estimate = estimateSmartDue(resolvedPriority, kind)
      const checklist =
        checklistLabels?.map((label) => ({ id: createId('cl'), label, done: false })) ??
        (action === 'generate_checklist'
          ? [
              { id: createId('cl'), label: 'Review requirements', done: false },
              { id: createId('cl'), label: 'Identify impacted controls', done: false },
              { id: createId('cl'), label: 'Update policies', done: false },
              { id: createId('cl'), label: 'Notify stakeholders', done: false },
              { id: createId('cl'), label: 'Board approval', done: false },
              { id: createId('cl'), label: 'Training', done: false },
              { id: createId('cl'), label: 'Evidence uploaded', done: false },
            ]
          : [])

      return createTask({
        title: defaultTitleForAction(action, title),
        description: description ?? `Created from AI action: ${option?.label ?? action}`,
        kind,
        priority: resolvedPriority,
        ownerId: ownerId ?? CURRENT_USER_ID,
        dueDate: dueDateFromDays(estimate.recommendedDays),
        estimate,
        aiGenerated: true,
        linkedRegulation,
        awaitingApproval: action === 'add_to_board' || action === 'schedule_review',
        status: action === 'add_to_board' ? 'review' : 'todo',
        checklist,
      })
    },
    [createTask],
  )

  const getEvidenceForCase = useCallback(
    (caseId: string) => evidence.filter((item) => item.caseId === caseId),
    [evidence],
  )

  const getEvidenceForTask = useCallback(
    (taskId: string) => {
      const task = tasks.find((item) => item.id === taskId)
      if (!task) return []
      return evidence.filter((item) => item.taskId === taskId || (!item.taskId && item.caseId === task.caseId))
    },
    [evidence, tasks],
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
      pushNotification({
        kind: 'approval',
        title: 'Decision recorded',
        body: `${input.outcome}: ${input.reason}`,
        caseId: input.caseId,
        href: `/work/cases/${input.caseId}`,
        group: 'Approvals',
      })
      return record
    },
    [decisions, pushActivity, pushNotification, pushTimeline],
  )

  const getTimelineForCase = useCallback(
    (caseId: string) =>
      timeline
        .filter((item) => item.caseId === caseId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [timeline],
  )

  const getTimelineForTask = useCallback(
    (taskId: string) => {
      const task = tasks.find((item) => item.id === taskId)
      return timeline
        .filter((item) => item.taskId === taskId || (!item.taskId && task && item.caseId === task.caseId))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    },
    [tasks, timeline],
  )

  const getCommentsForCase = useCallback(
    (caseId: string) =>
      comments
        .filter((item) => item.caseId === caseId)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [comments],
  )

  const getCommentsForTask = useCallback(
    (taskId: string) =>
      comments
        .filter((item) => item.taskId === taskId)
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
      pushTimeline({
        caseId,
        taskId,
        type: 'comment',
        title: 'Comment added',
        description: trimmed,
        actorId: authorId,
      })
      pushActivity('Comment added', trimmed, caseId, taskId)
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
      getTask,
      getTasksForCase,
      getSubtasks,
      createTask,
      createTasksFromLabels,
      updateTask,
      deleteTask,
      deleteTasks,
      duplicateTask,
      completeTask,
      toggleChecklistItem,
      setChecklist,
      bulkUpdateTasks,
      createFromAiAction,
      evidence,
      getEvidenceForCase,
      getEvidenceForTask,
      decisions,
      getDecisionsForCase,
      recordDecision,
      timeline,
      getTimelineForCase,
      getTimelineForTask,
      comments,
      getCommentsForCase,
      getCommentsForTask,
      addComment,
      activity,
      notifications,
      unreadNotificationCount: notifications.filter((item) => !item.read).length,
      markNotificationRead,
      markAllNotificationsRead,
      dismissNotification,
      clearAllNotifications,
      pushNotification,
      suggestions: WORK_SUGGESTIONS,
      getSuggestionsForCase,
      currentUserId: CURRENT_USER_ID,
      defaultCaseId: DEFAULT_CASE_ID,
    }),
    [
      activity,
      addComment,
      bulkUpdateTasks,
      cases,
      clearAllNotifications,
      comments,
      completeTask,
      createFromAiAction,
      createTask,
      createTasksFromLabels,
      decisions,
      deleteTask,
      deleteTasks,
      dismissNotification,
      duplicateTask,
      evidence,
      getCase,
      getCommentsForCase,
      getCommentsForTask,
      getDecisionsForCase,
      getEvidenceForCase,
      getEvidenceForTask,
      getSubtasks,
      getSuggestionsForCase,
      getTask,
      getTasksForCase,
      getTimelineForCase,
      getTimelineForTask,
      markAllNotificationsRead,
      markNotificationRead,
      notifications,
      pushNotification,
      recordDecision,
      setChecklist,
      tasks,
      timeline,
      toggleChecklistItem,
      updateCaseStatus,
      updateTask,
    ],
  )

  return <WorkContext.Provider value={value}>{children}</WorkContext.Provider>
}
