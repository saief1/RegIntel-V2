import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Workflow } from 'lucide-react'
import g from '../../components/governance/governance.module.css'
import { Badge } from '../../components/ui/Badge/Badge'
import { Button } from '../../components/ui/Button/Button'
import { Input } from '../../components/ui/Input/Input'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { Textarea } from '../../components/ui/Textarea/Textarea'
import { useOperations } from '../../hooks/useOperations'
import { formatRelativeTime } from '../../utils/date'
import { OperationsHubNav } from '../operations/OperationsHubNav'
import styles from '../operations/operations.module.css'
import eco from '../ecosystem/ecosystem.module.css'

export function AutomationStudioPage() {
  const {
    automationRules,
    automationRuns,
    automationSteps,
    actionCatalog,
    toggleAutomation,
    runAutomation,
    publishAutomation,
    retryAutomationRun,
  } = useOperations()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [trigger, setTrigger] = useState('Finding created (critical)')
  const [condition, setCondition] = useState('severity = critical')
  const [actions, setActions] = useState<string[]>(['Create Task', 'Notify Teams'])
  const [approvalsRequired, setApprovalsRequired] = useState(false)

  function toggleAction(action: string) {
    setActions((current) =>
      current.includes(action) ? current.filter((item) => item !== action) : [...current, action],
    )
  }

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        title="Enterprise Automation Studio"
        description="No-code automations with triggers, conditions, actions, approvals, and retry handling."
        icon={<Workflow size={20} />}
      />

      <OperationsHubNav current="/automation" />

      <nav className={eco.hubLinks} aria-label="Workflow studio">
        <Link className={eco.hubLink} to="/automation/canvas">
          Workflow Studio 2.0 Canvas
        </Link>
        <Link className={eco.hubLink} to="/integrations/marketplace">
          Integration Marketplace
        </Link>
      </nav>

      <section className={g.panel}>
        <h2>Automation flow</h2>
        <div className={styles.flow} role="list">
          {automationSteps.map((step, index) => (
            <div key={step} className={styles.flow} role="listitem">
              <span className={index === 0 ? styles.nodeActive : styles.node}>{step}</span>
              {index < automationSteps.length - 1 && (
                <span className={styles.arrow} aria-hidden="true">
                  ↓
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      <div className={styles.split}>
        <section className={g.panel}>
          <h2>Builder</h2>
          <div className={styles.formGrid}>
            <label>
              Name
              <Input aria-label="Automation name" value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label>
              Trigger
              <Input aria-label="Trigger" value={trigger} onChange={(e) => setTrigger(e.target.value)} />
            </label>
            <label style={{ gridColumn: '1 / -1' }}>
              Description
              <Textarea aria-label="Description" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
            </label>
            <label style={{ gridColumn: '1 / -1' }}>
              Conditions
              <Input aria-label="Conditions" value={condition} onChange={(e) => setCondition(e.target.value)} />
            </label>
          </div>
          <h3>Actions</h3>
          <div className={styles.chipRow} role="group" aria-label="Automation actions">
            {actionCatalog.map((action) => (
              <button
                key={action}
                type="button"
                className={actions.includes(action) ? styles.chipActive : styles.chip}
                onClick={() => toggleAction(action)}
              >
                {action}
              </button>
            ))}
          </div>
          <label className={styles.chipRow} style={{ marginTop: 12 }}>
            <input
              type="checkbox"
              checked={approvalsRequired}
              onChange={(e) => setApprovalsRequired(e.target.checked)}
            />
            Approvals required
          </label>
          <div className={g.toolbar}>
            <Button
              variant="primary"
              disabled={!name.trim() || actions.length === 0}
              onClick={() => {
                publishAutomation({
                  name,
                  description,
                  trigger,
                  conditions: [condition],
                  actions,
                  approvalsRequired,
                })
                setName('')
                setDescription('')
              }}
            >
              Publish automation
            </Button>
          </div>
        </section>

        <aside className={g.panel}>
          <h2>Templates</h2>
          <ul className={g.list}>
            {automationRules
              .filter((rule) => rule.template)
              .map((rule) => (
                <li key={rule.id} className={g.listItem}>
                  <span>
                    <strong>{rule.name}</strong>
                    <br />
                    <span className={g.muted}>{rule.description}</span>
                  </span>
                  <Badge variant="neutral">Template</Badge>
                </li>
              ))}
          </ul>
        </aside>
      </div>

      <section className={g.panel}>
        <h2>Automations</h2>
        <div className={g.grid}>
          {automationRules.map((rule) => (
            <article key={rule.id} className={g.card} style={{ cursor: 'default' }}>
              <div className={g.meta}>
                <Badge variant={rule.enabled ? 'success' : 'neutral'}>{rule.enabled ? 'Enabled' : 'Disabled'}</Badge>
                <Badge variant="accent">{rule.successRate}% success</Badge>
              </div>
              <h3>{rule.name}</h3>
              <p className={g.muted}>{rule.description}</p>
              <p className={g.muted}>Trigger: {rule.trigger}</p>
              <p className={g.muted}>Actions: {rule.actions.join(' · ')}</p>
              {rule.lastRunAt && <p className={g.muted}>Last run {formatRelativeTime(rule.lastRunAt)}</p>}
              <div className={g.toolbar}>
                <Button size="sm" variant="secondary" onClick={() => toggleAutomation(rule.id)}>
                  {rule.enabled ? 'Disable' : 'Enable'}
                </Button>
                <Button size="sm" variant="primary" onClick={() => runAutomation(rule.id)} disabled={!rule.enabled}>
                  Run now
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={g.panel}>
        <h2>Run history & retry queue</h2>
        <ul className={g.list}>
          {automationRuns.map((run) => (
            <li key={run.id} className={g.listItem}>
              <span>
                <strong>{run.ruleName}</strong>
                <br />
                <span className={g.muted}>
                  {run.detail} · Attempt {run.attempt}
                </span>
              </span>
              <div className={g.toolbar}>
                <Badge
                  variant={
                    run.status === 'succeeded'
                      ? 'success'
                      : run.status === 'failed'
                        ? 'error'
                        : run.status === 'retrying' || run.status === 'running'
                          ? 'accent'
                          : 'neutral'
                  }
                >
                  {run.status}
                </Badge>
                {(run.status === 'failed' || run.status === 'retrying') && (
                  <Button size="sm" variant="secondary" onClick={() => retryAutomationRun(run.id)}>
                    Retry
                  </Button>
                )}
                <time dateTime={run.at}>{formatRelativeTime(run.at)}</time>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </PageContainer>
  )
}
