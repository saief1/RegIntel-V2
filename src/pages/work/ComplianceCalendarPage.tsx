import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays } from 'lucide-react'
import g from '../../components/governance/governance.module.css'
import { Badge } from '../../components/ui/Badge/Badge'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { useGovernance } from '../../hooks/useGovernance'
import { useWork } from '../../hooks/useWork'
import { formatDate } from '../../utils/date'

export function ComplianceCalendarPage() {
  const navigate = useNavigate()
  const { calendarItems } = useGovernance()
  const { getUser } = useWork()

  const grouped = useMemo(() => {
    const map = new Map<string, typeof calendarItems>()
    for (const item of [...calendarItems].sort((a, b) => a.date.localeCompare(b.date))) {
      const list = map.get(item.date) ?? []
      list.push(item)
      map.set(item.date, list)
    }
    return [...map.entries()]
  }, [calendarItems])

  return (
    <PageContainer style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ri-space-5)' }}>
      <PageHeader
        title="Compliance Calendar"
        description="Unified schedule for reviews, approvals, tasks, board meetings, training, deadlines, and audits."
        icon={<CalendarDays size={20} />}
      />

      <div className={g.stack}>
        {grouped.map(([date, items]) => (
          <section key={date} className={g.panel}>
            <h2>{formatDate(date)}</h2>
            <ul className={g.list}>
              {items.map((item) => (
                <li key={item.id}>
                  <button type="button" onClick={() => navigate(item.href)}>
                    <span>
                      <Badge variant="accent">{item.kind}</Badge> {item.title}
                      {item.ownerId && (
                        <span className={g.muted}> · {getUser(item.ownerId)?.name}</span>
                      )}
                    </span>
                    <span>Open</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </PageContainer>
  )
}
