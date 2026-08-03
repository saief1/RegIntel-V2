import { Link } from 'react-router-dom'
import { useAdoption } from '../../hooks/useAdoption'
import { Badge } from '../ui/Badge/Badge'
import styles from '../../pages/adoption/adoption.module.css'

/** Sticky global onboarding checklist for workspace adoption. */
export function GlobalOnboardingChecklist() {
  const { checklist, toggleChecklistItem, workspaceCompletionPct } = useAdoption()
  if (workspaceCompletionPct >= 100) return null

  return (
    <aside className={styles.checklistFloat} aria-label="Global onboarding checklist">
      <div className={styles.bannerRow}>
        <div>
          <strong>Workspace setup</strong>
          <p style={{ margin: '4px 0 0', fontSize: 'var(--ri-font-size-body-sm)' }}>
            Completion {workspaceCompletionPct}% · Global onboarding checklist
          </p>
          <ul style={{ margin: '8px 0 0', paddingLeft: 18 }}>
            {checklist.slice(0, 4).map((item) => (
              <li key={item.id}>
                <label style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                  <input type="checkbox" checked={item.done} onChange={() => toggleChecklistItem(item.id)} />
                  {item.href ? <Link to={item.href}>{item.label}</Link> : item.label}
                </label>
              </li>
            ))}
          </ul>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
          <Badge variant="accent">{workspaceCompletionPct}%</Badge>
          <Link className={styles.hubLink} to="/onboarding">
            Continue setup
          </Link>
        </div>
      </div>
    </aside>
  )
}
