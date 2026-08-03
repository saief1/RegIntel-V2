import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, CalendarClock, ClipboardList, ListChecks } from 'lucide-react'
import { useWork } from '../../../hooks/useWork'
import { isDueThisWeek, isDueToday, isOverdue } from '../../../utils/smartDueDates'
import styles from './WorkWidget.module.css'

export function WorkWidget() {
  const navigate = useNavigate()
  const { tasks, currentUserId } = useWork()

  const stats = useMemo(() => {
    const active = tasks.filter((task) => task.status !== 'completed')
    const overdue = active.filter((task) => isOverdue(task.dueDate, task.status))
    const dueWeek = active.filter((task) => isDueThisWeek(task.dueDate) || isDueToday(task.dueDate))
    const pendingReviews = tasks.filter(
      (task) => task.status === 'review' || (task.awaitingApproval && task.ownerId === currentUserId),
    )
    return {
      active: active.length,
      overdue: overdue.length,
      dueWeek: dueWeek.length,
      pendingReviews: pendingReviews.length,
    }
  }, [currentUserId, tasks])

  const items = [
    { label: 'Active tasks', value: stats.active, icon: ListChecks, href: '/work?view=list' },
    { label: 'Overdue', value: stats.overdue, icon: AlertTriangle, href: '/work?section=overdue' },
    { label: 'Due this week', value: stats.dueWeek, icon: CalendarClock, href: '/work?view=calendar' },
    { label: 'Pending reviews', value: stats.pendingReviews, icon: ClipboardList, href: '/work?section=awaiting' },
  ] as const

  return (
    <section className={styles.widget} aria-label="Work summary">
      <header className={styles.header}>
        <h3>Work</h3>
        <button type="button" onClick={() => navigate('/work')}>
          Open
        </button>
      </header>
      <ul className={styles.list}>
        {items.map((item) => {
          const Icon = item.icon
          return (
            <li key={item.label}>
              <button type="button" onClick={() => navigate(item.href)}>
                <span className={styles.icon} aria-hidden="true">
                  <Icon size={14} />
                </span>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
