import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { WorkTask } from '../../../types/work'
import { formatDate } from '../../../utils/date'
import styles from './WorkCalendarView.module.css'

interface WorkCalendarViewProps {
  tasks: WorkTask[]
}

function startOfMonth(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))
}

function daysInMonth(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate()
}

export function WorkCalendarView({ tasks }: WorkCalendarViewProps) {
  const navigate = useNavigate()
  const anchor = useMemo(() => startOfMonth(new Date('2026-08-02T12:00:00.000Z')), [])
  const totalDays = daysInMonth(anchor)
  const startWeekday = anchor.getUTCDay()

  const byDay = useMemo(() => {
    const map = new Map<string, WorkTask[]>()
    for (const task of tasks) {
      const key = task.dueDate.slice(0, 10)
      const list = map.get(key) ?? []
      list.push(task)
      map.set(key, list)
    }
    return map
  }, [tasks])

  const cells: Array<{ key: string; day?: number; iso?: string }> = []
  for (let i = 0; i < startWeekday; i += 1) cells.push({ key: `pad-${i}` })
  for (let day = 1; day <= totalDays; day += 1) {
    const iso = `2026-08-${String(day).padStart(2, '0')}`
    cells.push({ key: iso, day, iso })
  }

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <h3>August 2026</h3>
        <p>Tasks by due date</p>
      </header>
      <div className={styles.weekdays}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div className={styles.grid}>
        {cells.map((cell) => {
          const dayTasks = cell.iso ? byDay.get(cell.iso) ?? [] : []
          return (
            <div key={cell.key} className={styles.cell} data-empty={!cell.day || undefined}>
              {cell.day && <span className={styles.day}>{cell.day}</span>}
              <ul className={styles.list}>
                {dayTasks.slice(0, 3).map((task) => (
                  <li key={task.id}>
                    <button type="button" onClick={() => navigate(`/work/tasks/${task.id}`)}>
                      {task.title}
                    </button>
                  </li>
                ))}
                {dayTasks.length > 3 && <li className={styles.more}>+{dayTasks.length - 3} more</li>}
              </ul>
            </div>
          )
        })}
      </div>
      <p className={styles.caption}>Showing due dates around {formatDate(anchor.toISOString())}</p>
    </div>
  )
}
