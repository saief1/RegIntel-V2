import { Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import g from '../../components/governance/governance.module.css'
import { Badge } from '../../components/ui/Badge/Badge'
import { Button } from '../../components/ui/Button/Button'
import { Input } from '../../components/ui/Input/Input'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { Select } from '../../components/ui/Select/Select'
import { ContextualHelpIcon } from '../../components/adoption/ContextualHelpIcon'
import { useAdoption } from '../../hooks/useAdoption'
import type { OnboardingStepId } from '../../types/adoption'
import { formatRelativeTime } from '../../utils/date'
import { AdoptionHubNav } from './AdoptionHubNav'
import styles from './adoption.module.css'

export function OnboardingPage() {
  const {
    steps,
    progress,
    goToStep,
    completeStep,
    skipStep,
    saveProgress,
    setOrgName,
    setIndustry,
    checklist,
    toggleChecklistItem,
    workspaceCompletionPct,
  } = useAdoption()

  const current = steps.find((step) => step.id === progress.currentStepId) ?? steps[0]
  const totalMinutes = steps.reduce((sum, step) => sum + step.estimatedMinutes, 0)
  const remaining = steps
    .filter((step) => !progress.completedStepIds.includes(step.id) && !progress.skippedStepIds.includes(step.id))
    .reduce((sum, step) => sum + step.estimatedMinutes, 0)

  function stepClass(id: OnboardingStepId) {
    if (progress.currentStepId === id) return styles.progressStepActive
    if (progress.completedStepIds.includes(id) || progress.skippedStepIds.includes(id)) return styles.progressStepDone
    return styles.progressStep
  }

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        title="Guided Workspace Onboarding"
        description="Professional first-run setup with progress, skip options, and a live checklist."
        icon={<Sparkles size={20} />}
        actions={<ContextualHelpIcon label="Onboarding help" to="/help" />}
      />

      <AdoptionHubNav current="/onboarding" />

      <div className={g.meta}>
        <Badge variant="accent">~{remaining} min left</Badge>
        <Badge variant="neutral">{totalMinutes} min total</Badge>
        <Badge variant="success">Workspace {workspaceCompletionPct}%</Badge>
        {progress.savedAt && <span className={g.muted}>Saved {formatRelativeTime(progress.savedAt)}</span>}
      </div>

      <div className={styles.progressTrack} role="list" aria-label="Onboarding progress">
        {steps.map((step, index) => (
          <button
            key={step.id}
            type="button"
            role="listitem"
            className={stepClass(step.id)}
            onClick={() => goToStep(step.id)}
            aria-current={progress.currentStepId === step.id ? 'step' : undefined}
          >
            {index + 1}. {step.title}
          </button>
        ))}
      </div>

      <div className={styles.split}>
        <section className={g.panel} aria-label="Current onboarding step">
          <header className={g.row}>
            <div>
              <h2>{current.title}</h2>
              <p className={g.muted}>{current.description}</p>
            </div>
            <Badge variant="neutral">~{current.estimatedMinutes} min</Badge>
          </header>

          {current.id === 'welcome' && (
            <p className={g.muted}>
              RegIntel helps Canadian wealth and regulated firms turn regulatory change into governed work. This
              onboarding takes about {totalMinutes} minutes.
            </p>
          )}
          {current.id === 'organization' && (
            <label className={g.muted} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              Organization name
              <Input
                aria-label="Organization name"
                value={progress.orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="Contoso Wealth"
              />
            </label>
          )}
          {current.id === 'industry' && (
            <label className={g.muted} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              Industry solution pack
              <Select aria-label="Industry" value={progress.industry} onChange={(e) => setIndustry(e.target.value)}>
                <option value="wealth">Wealth Management (flagship)</option>
                <option value="banking">Banking</option>
                <option value="insurance">Insurance</option>
                <option value="grc">Corporate GRC</option>
              </Select>
            </label>
          )}
          {current.id === 'policies' && (
            <p className={g.muted}>Mock import: drag policies later from Data Management or Knowledge.</p>
          )}
          {current.id === 'integrations' && (
            <p className={g.muted}>
              Optional — connect from <Link to="/integrations/marketplace">Integration Marketplace</Link>.
            </p>
          )}
          {current.id === 'ai' && (
            <p className={g.muted}>Enable Compliance Analyst and Policy Writer agents with human approval gates.</p>
          )}
          {current.id === 'team' && (
            <p className={g.muted}>Invite CCO, reviewers, and admins. You can skip and invite later from Settings.</p>
          )}
          {current.id === 'complete' && (
            <p className={g.muted}>
              You&apos;re ready. Continue to Customer Success for adoption coaching, or open the{' '}
              <Link to="/solutions/wealth">Wealth pack</Link>.
            </p>
          )}

          <div className={g.toolbar}>
            {current.id !== 'complete' && (
              <Button variant="primary" onClick={() => completeStep(current.id)}>
                Continue
              </Button>
            )}
            {current.optional && (
              <Button variant="secondary" onClick={() => skipStep(current.id)}>
                Skip
              </Button>
            )}
            <Button variant="ghost" onClick={saveProgress}>
              Save progress
            </Button>
            {current.id === 'complete' && (
              <Link className={styles.hubLink} to="/customer-success">
                Go to Customer Success
              </Link>
            )}
          </div>
        </section>

        <aside className={g.panel}>
          <h2>Onboarding checklist</h2>
          <ul className={g.list}>
            {checklist.map((item) => (
              <li key={item.id} className={g.listItem}>
                <label style={{ display: 'inline-flex', gap: 8, alignItems: 'center', flex: 1 }}>
                  <input type="checkbox" checked={item.done} onChange={() => toggleChecklistItem(item.id)} />
                  {item.label}
                </label>
                {item.href && (
                  <Link className={styles.hubLink} to={item.href}>
                    Open
                  </Link>
                )}
              </li>
            ))}
          </ul>
          <p className={g.muted}>Empty-state guidance: incomplete items stay visible until your team adopts core workflows.</p>
        </aside>
      </div>
    </PageContainer>
  )
}
