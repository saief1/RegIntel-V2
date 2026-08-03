import { useCallback, useMemo, type ReactNode } from 'react'
import { INVESTIGATION_ACTIVITY, INVESTIGATION_ATTACHMENTS, INVESTIGATION_DECISIONS, INVESTIGATION_EVIDENCE, INVESTIGATION_NOTES, INVESTIGATION_TASKS, INVESTIGATION_TIMELINE } from '../data/investigations/details'
import { INVESTIGATIONS } from '../data/investigations/investigations'
import { INVESTIGATION_AI_SUGGESTIONS, INVESTIGATION_NOTIFICATIONS } from '../data/investigations/notifications'
import { REGULATORY_CHANGES } from '../data/investigations/regulatoryChanges'
import { WORK_USERS } from '../data/work/users'
import { useLocalStorageState } from '../hooks/useLocalStorageState'
import type { InvestigationNote, InvestigationNotification } from '../types/investigations'
import { InvestigationsContext, type InvestigationsContextValue } from './InvestigationsContext'

const CURRENT_USER_ID = 'u-01'

export function InvestigationsProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useLocalStorageState<InvestigationNote[]>('ri-inv-notes', INVESTIGATION_NOTES)
  const [notifications, setNotifications] = useLocalStorageState<InvestigationNotification[]>(
    'ri-inv-notifications',
    INVESTIGATION_NOTIFICATIONS,
  )

  const getUser = useCallback((id: string) => WORK_USERS.find((user) => user.id === id), [])
  const getInvestigation = useCallback((id: string) => INVESTIGATIONS.find((item) => item.id === id), [])
  const getChange = useCallback((id: string) => REGULATORY_CHANGES.find((item) => item.id === id), [])

  const getNotes = useCallback(
    (investigationId: string) =>
      notes
        .filter((item) => item.investigationId === investigationId)
        .sort((a, b) => Number(b.pinned) - Number(a.pinned) || +new Date(b.createdAt) - +new Date(a.createdAt)),
    [notes],
  )
  const getEvidence = useCallback(
    (investigationId: string) => INVESTIGATION_EVIDENCE.filter((item) => item.investigationId === investigationId),
    [],
  )
  const getTasks = useCallback(
    (investigationId: string) => INVESTIGATION_TASKS.filter((item) => item.investigationId === investigationId),
    [],
  )
  const getDecisions = useCallback(
    (investigationId: string) => INVESTIGATION_DECISIONS.filter((item) => item.investigationId === investigationId),
    [],
  )
  const getTimeline = useCallback(
    (investigationId: string) =>
      INVESTIGATION_TIMELINE.filter((item) => item.investigationId === investigationId).sort(
        (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
      ),
    [],
  )
  const getAttachments = useCallback(
    (investigationId: string) => INVESTIGATION_ATTACHMENTS.filter((item) => item.investigationId === investigationId),
    [],
  )
  const getSuggestions = useCallback(
    (investigationId: string) => INVESTIGATION_AI_SUGGESTIONS.filter((item) => item.investigationId === investigationId),
    [],
  )

  const pinNote = useCallback(
    (id: string) => {
      setNotes((current) => current.map((item) => (item.id === id ? { ...item, pinned: !item.pinned } : item)))
    },
    [setNotes],
  )

  const deleteNote = useCallback(
    (id: string) => {
      setNotes((current) => current.filter((item) => item.id !== id))
    },
    [setNotes],
  )

  const markNotificationRead = useCallback(
    (id: string) => {
      setNotifications((current) => current.map((item) => (item.id === id ? { ...item, read: true } : item)))
    },
    [setNotifications],
  )

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((current) => current.map((item) => ({ ...item, read: true })))
  }, [setNotifications])

  const dismissNotification = useCallback(
    (id: string) => {
      setNotifications((current) => current.filter((item) => item.id !== id))
    },
    [setNotifications],
  )

  const clearAllNotifications = useCallback(() => {
    setNotifications([])
  }, [setNotifications])

  const value = useMemo<InvestigationsContextValue>(
    () => ({
      currentUserId: CURRENT_USER_ID,
      users: WORK_USERS,
      getUser,
      investigations: INVESTIGATIONS,
      getInvestigation,
      notes,
      evidence: INVESTIGATION_EVIDENCE,
      tasks: INVESTIGATION_TASKS,
      decisions: INVESTIGATION_DECISIONS,
      timeline: INVESTIGATION_TIMELINE,
      attachments: INVESTIGATION_ATTACHMENTS,
      activity: INVESTIGATION_ACTIVITY,
      getNotes,
      getEvidence,
      getTasks,
      getDecisions,
      getTimeline,
      getAttachments,
      getSuggestions,
      pinNote,
      deleteNote,
      changes: REGULATORY_CHANGES,
      getChange,
      notifications,
      unreadNotificationCount: notifications.filter((item) => !item.read).length,
      markNotificationRead,
      markAllNotificationsRead,
      dismissNotification,
      clearAllNotifications,
    }),
    [
      clearAllNotifications,
      deleteNote,
      dismissNotification,
      getAttachments,
      getChange,
      getDecisions,
      getEvidence,
      getInvestigation,
      getNotes,
      getSuggestions,
      getTasks,
      getTimeline,
      getUser,
      markAllNotificationsRead,
      markNotificationRead,
      notes,
      notifications,
      pinNote,
    ],
  )

  return <InvestigationsContext.Provider value={value}>{children}</InvestigationsContext.Provider>
}
