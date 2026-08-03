import { Link } from 'react-router-dom'
import { useAdoption } from '../../hooks/useAdoption'
import { Button } from '../ui/Button/Button'
import styles from '../../pages/adoption/adoption.module.css'

export function WelcomeBanner() {
  const { showWelcomeBanner, dismissWelcomeBanner, nextSuggestions, workspaceCompletionPct } = useAdoption()
  if (!showWelcomeBanner) return null

  return (
    <div className={styles.bannerRow} role="status" aria-label="Welcome banner">
      <div>
        <strong>Welcome to RegIntel</strong>
        <p style={{ margin: '4px 0 0', fontSize: 'var(--ri-font-size-body-sm)' }}>
          First-run experience · Workspace {workspaceCompletionPct}% complete. AI suggestion: What should I do next?
        </p>
        <ul style={{ margin: '8px 0 0', paddingLeft: 18 }}>
          {nextSuggestions.map((item) => (
            <li key={item.id}>
              <Link to={item.href}>{item.title}</Link> — {item.detail}
            </li>
          ))}
        </ul>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Link className={styles.hubLink} to="/onboarding">
          Start onboarding
        </Link>
        <Button size="sm" variant="ghost" onClick={dismissWelcomeBanner}>
          Dismiss
        </Button>
      </div>
    </div>
  )
}
