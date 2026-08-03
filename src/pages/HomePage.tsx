import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowUp,
  CheckCircle2,
  ClipboardList,
  FileText,
  Scale,
  Sparkles,
  ShieldAlert,
} from 'lucide-react'
import { WorkWidget } from '../components/work/WorkWidget/WorkWidget'
import { useInvestigations } from '../hooks/useInvestigations'
import { useShellLayout } from '../hooks/useShellLayout'
import { useWork } from '../hooks/useWork'
import { formatRelativeTime } from '../utils/date'
import { isOverdue } from '../utils/smartDueDates'
import styles from './HomePage.module.css'

const SUGGESTED_PROMPTS = [
  { label: 'Explain today’s regulations', path: '/ai', prompt: 'Summarize today’s material regulatory changes.' },
  { label: 'Review AML Policy', path: '/ai', prompt: 'Review AML beneficial ownership obligations and gaps.' },
  { label: 'Create Board Report', path: '/ai', prompt: 'Draft a board-ready compliance summary.' },
  { label: 'Assess Vendor Risk', path: '/ai', prompt: 'Assess vendor transfer and subprocessor residual risk.' },
] as const

function greetingForNow(date = new Date()): string {
  const hour = date.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export function HomePage() {
  const navigate = useNavigate()
  const { cases, tasks } = useWork()
  const { changes, notifications } = useInvestigations()
  const { openCommandPalette } = useShellLayout()

  const priorities = useMemo(() => {
    const newRegs = changes.filter((item) => item.status === 'new' || item.status === 'pending_review').length
    const policyUpdates = tasks.filter((task) => task.kind === 'policy_update' && task.status !== 'completed').length
    const boardItems = tasks.filter((task) => task.kind === 'board_item' && task.status !== 'completed').length
    return [
      {
        id: 'p1',
        title: `${newRegs || 3} Regulations`,
        detail: `${policyUpdates || 2} require policy updates · ${boardItems || 1} requires board approval`,
        priority: 'High' as const,
        href: '/regulatory-changes',
        icon: Scale,
      },
      {
        id: 'p2',
        title: `${tasks.filter((task) => task.awaitingApproval).length || 2} Awaiting approval`,
        detail: 'Tasks and board items ready for decision',
        priority: 'Medium' as const,
        href: '/work?section=awaiting',
        icon: ClipboardList,
      },
      {
        id: 'p3',
        title: `${tasks.filter((task) => task.kind === 'risk_review' && task.status !== 'completed').length || 1} Risk reviews`,
        detail: 'Vendor and transfer residual risk',
        priority: 'Medium' as const,
        href: '/work?view=list',
        icon: ShieldAlert,
      },
    ]
  }, [changes, tasks])

  const recentWork = useMemo(() => {
    const fromTasks = [...tasks]
      .filter((task) => !task.parentId)
      .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
      .slice(0, 4)
      .map((item) => ({
        id: item.id,
        title: item.title,
        meta: formatRelativeTime(item.updatedAt),
        href: `/work/tasks/${item.id}`,
      }))
    if (fromTasks.length > 0) return fromTasks
    return [...cases]
      .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
      .slice(0, 4)
      .map((item) => ({
        id: item.id,
        title: item.title,
        meta: formatRelativeTime(item.updatedAt),
        href: `/work/cases/${item.id}`,
      }))
  }, [cases, tasks])

  function runPrompt(prompt: string) {
    sessionStorage.setItem('ri-home-prompt', prompt)
    navigate('/ai')
  }

  return (
    <div className={styles.page}>
      <div className={styles.main}>
        <header className={styles.hero}>
          <h1 className={styles.greeting}>{greetingForNow()}, Sarah.</h1>
          <p className={styles.health}>
            <CheckCircle2 size={16} aria-hidden="true" />
            Your compliance program is healthy. No critical issues today.
          </p>
        </header>

        <section className={styles.aiCard} aria-label="Ask RegIntel">
          <div className={styles.aiHeader}>
            <Sparkles size={18} aria-hidden="true" />
            <h2>How can RegIntel help today?</h2>
          </div>
          <form
            className={styles.aiForm}
            onSubmit={(event) => {
              event.preventDefault()
              const data = new FormData(event.currentTarget)
              const question = String(data.get('question') ?? '').trim()
              if (question) runPrompt(question)
              else openCommandPalette()
            }}
          >
            <input
              name="question"
              className={styles.aiInput}
              placeholder="Ask anything about regulations, policies, risks…"
              aria-label="Ask RegIntel"
            />
            <button type="submit" className={styles.send} aria-label="Send">
              <ArrowUp size={18} />
            </button>
          </form>
          <div className={styles.prompts} aria-label="Suggested prompts">
            {SUGGESTED_PROMPTS.map((item) => (
              <button key={item.label} type="button" className={styles.promptChip} onClick={() => runPrompt(item.prompt)}>
                {item.label}
              </button>
            ))}
          </div>
        </section>

        <div className={styles.twoCol}>
          <section className={styles.card}>
            <header className={styles.cardHeader}>
              <h2>Today’s Priorities</h2>
              <button type="button" className={styles.viewAll} onClick={() => navigate('/investigations')}>
                View all
              </button>
            </header>
            <ul className={styles.list}>
              {priorities.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.id}>
                    <button type="button" className={styles.listButton} onClick={() => navigate(item.href)}>
                      <span className={styles.listIcon} aria-hidden="true">
                        <Icon size={16} />
                      </span>
                      <span className={styles.listText}>
                        <span className={styles.listTitle}>{item.title}</span>
                        <span className={styles.listDetail}>{item.detail}</span>
                      </span>
                      <span className={item.priority === 'High' ? styles.badgeHigh : styles.badgeMedium}>
                        {item.priority}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>

          <section className={styles.card}>
            <header className={styles.cardHeader}>
              <h2>Recent Work</h2>
              <button type="button" className={styles.viewAll} onClick={() => navigate('/work')}>
                View all
              </button>
            </header>
            <ul className={styles.list}>
              {recentWork.map((item) => (
                <li key={item.id}>
                  <button type="button" className={styles.listButton} onClick={() => navigate(item.href)}>
                    <span className={styles.listIcon} aria-hidden="true">
                      <FileText size={16} />
                    </span>
                    <span className={styles.listText}>
                      <span className={styles.listTitle}>{item.title}</span>
                      <span className={styles.listDetail}>{item.meta}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <aside className={styles.brief} aria-label="Today’s brief">
        <WorkWidget />

        <section className={styles.card}>
          <h2 className={styles.briefTitle}>Today’s Brief</h2>
          <ul className={styles.briefList}>
            <li>
              <button type="button" onClick={() => navigate('/regulatory-changes')}>
                <span>
                  {changes.filter((c) => c.status !== 'completed').length} Regulations ·{' '}
                  {tasks.filter((t) => t.kind === 'policy_update' && t.status !== 'completed').length} need policy updates
                </span>
                <span aria-hidden="true">→</span>
              </button>
            </li>
            <li>
              <button type="button" onClick={() => navigate('/work?section=awaiting')}>
                <span>{tasks.filter((t) => t.awaitingApproval).length} Require board / approval</span>
                <span aria-hidden="true">→</span>
              </button>
            </li>
            <li>
              <button type="button" onClick={() => navigate('/work?section=overdue')}>
                <span>{tasks.filter((t) => isOverdue(t.dueDate, t.status)).length} Overdue tasks</span>
                <span aria-hidden="true">→</span>
              </button>
            </li>
            <li>
              <button type="button" onClick={() => navigate('/work')}>
                <span>{tasks.filter((t) => t.status !== 'completed' && !t.parentId).length} Active work items</span>
                <span aria-hidden="true">→</span>
              </button>
            </li>
          </ul>
        </section>

        <section className={styles.card}>
          <h2 className={styles.briefTitle}>Upcoming deadlines</h2>
          <ul className={styles.deadlineList}>
            {[...tasks]
              .filter((item) => item.status !== 'completed')
              .sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate))
              .slice(0, 4)
              .map((item) => (
                <li key={item.id}>
                  <button type="button" onClick={() => navigate(`/work/tasks/${item.id}`)}>
                    <span>{item.title}</span>
                    <span className={styles.deadlineMeta}>{formatRelativeTime(item.dueDate)}</span>
                  </button>
                </li>
              ))}
          </ul>
        </section>

        <section className={styles.card}>
          <h2 className={styles.briefTitle}>Notifications</h2>
          <ul className={styles.deadlineList}>
            {notifications.slice(0, 4).map((item) => (
              <li key={item.id}>
                <button type="button" onClick={() => navigate(item.href)}>
                  <span className={!item.read ? styles.unread : undefined}>{item.title}</span>
                  <span className={styles.deadlineMeta}>{formatRelativeTime(item.createdAt)}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </aside>
    </div>
  )
}
