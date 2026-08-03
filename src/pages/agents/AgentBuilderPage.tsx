import { useState } from 'react'
import { Wrench } from 'lucide-react'
import { Link } from 'react-router-dom'
import g from '../../components/governance/governance.module.css'
import { Badge } from '../../components/ui/Badge/Badge'
import { Button } from '../../components/ui/Button/Button'
import { Input } from '../../components/ui/Input/Input'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { Select } from '../../components/ui/Select/Select'
import { Textarea } from '../../components/ui/Textarea/Textarea'
import { useAutonomous } from '../../hooks/useAutonomous'
import type { AgentOutput, AgentTrigger } from '../../types/autonomous'
import { formatRelativeTime } from '../../utils/date'
import styles from './autonomous.module.css'

const KNOWLEDGE_OPTIONS = ['Regulation Library', 'Policy Workspace', 'Control library', 'Evidence vault', 'Investigations']
const SYSTEM_OPTIONS = ['Microsoft 365', 'SharePoint', 'Jira', 'ServiceNow', 'Slack', 'Box']

export function AgentBuilderPage() {
  const { customAgents, publishCustomAgent, workflowSteps } = useAutonomous()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [trigger, setTrigger] = useState<AgentTrigger>('schedule')
  const [output, setOutput] = useState<AgentOutput>('tasks')
  const [schedule, setSchedule] = useState('Daily · 09:00')
  const [approvalsRequired, setApprovalsRequired] = useState(true)
  const [knowledgeSources, setKnowledgeSources] = useState<string[]>(['Policy Workspace'])
  const [connectedSystems, setConnectedSystems] = useState<string[]>(['Jira'])
  const [message, setMessage] = useState('')

  function toggle(list: string[], value: string, setter: (next: string[]) => void) {
    setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value])
  }

  function onPublish() {
    const created = publishCustomAgent({
      name,
      description,
      trigger,
      knowledgeSources,
      connectedSystems,
      output,
      approvalsRequired,
      schedule,
    })
    setMessage(`Published “${created.name}”.`)
    setName('')
    setDescription('')
  }

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        title="Agent Builder"
        description="Configure autonomous workers with triggers, knowledge sources, connected systems, and approval gates."
        icon={<Wrench size={20} />}
      />

      <nav className={styles.hubLinks} aria-label="Autonomous platform areas">
        <Link className={styles.hubLink} to="/agents">
          AI Agents
        </Link>
        <Link className={styles.hubLink} to="/agents/queue">
          Work Queue
        </Link>
      </nav>

      <section className={g.panel} aria-label="Visual workflow">
        <h2>Visual workflow</h2>
        <div className={styles.flow} role="list">
          {workflowSteps.map((step, index) => (
            <div key={step} className={styles.flow} role="listitem">
              <span className={index === 0 ? styles.nodeActive : styles.node}>{step}</span>
              {index < workflowSteps.length - 1 && (
                <span className={styles.arrow} aria-hidden="true">
                  ↓
                </span>
              )}
            </div>
          ))}
        </div>
        <p className={g.muted}>Trigger → Collect → Analyze → Decision → Create Tasks → Notify → Complete</p>
      </section>

      <div className={styles.split}>
        <section className={g.panel}>
          <h2>Configure agent</h2>
          <div className={styles.formGrid}>
            <label>
              Name
              <Input aria-label="Agent name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Control Drift Watcher" />
            </label>
            <label>
              Trigger
              <Select aria-label="Trigger" value={trigger} onChange={(e) => setTrigger(e.target.value as AgentTrigger)}>
                {(['schedule', 'event', 'manual', 'threshold'] as const).map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </label>
            <label style={{ gridColumn: '1 / -1' }}>
              Description
              <Textarea
                aria-label="Description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What should this agent accomplish?"
              />
            </label>
            <label>
              Output
              <Select aria-label="Output" value={output} onChange={(e) => setOutput(e.target.value as AgentOutput)}>
                {(['tasks', 'policy_draft', 'report', 'notification', 'evidence_pack'] as const).map((item) => (
                  <option key={item} value={item}>
                    {item.replace(/_/g, ' ')}
                  </option>
                ))}
              </Select>
            </label>
            <label>
              Schedule
              <Input aria-label="Schedule" value={schedule} onChange={(e) => setSchedule(e.target.value)} />
            </label>
          </div>

          <fieldset className={g.stack} style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className={g.muted}>Knowledge sources</legend>
            {KNOWLEDGE_OPTIONS.map((item) => (
              <label key={item} className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={knowledgeSources.includes(item)}
                  onChange={() => toggle(knowledgeSources, item, setKnowledgeSources)}
                />
                {item}
              </label>
            ))}
          </fieldset>

          <fieldset className={g.stack} style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className={g.muted}>Connected systems</legend>
            {SYSTEM_OPTIONS.map((item) => (
              <label key={item} className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={connectedSystems.includes(item)}
                  onChange={() => toggle(connectedSystems, item, setConnectedSystems)}
                />
                {item}
              </label>
            ))}
          </fieldset>

          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={approvalsRequired}
              onChange={(e) => setApprovalsRequired(e.target.checked)}
            />
            Approvals required (human checkpoint)
          </label>

          <div className={g.toolbar}>
            <Button
              variant="primary"
              onClick={onPublish}
              disabled={!name.trim() || knowledgeSources.length === 0}
            >
              Publish agent
            </Button>
            {message && <span className={g.muted}>{message}</span>}
          </div>
        </section>

        <section className={g.panel}>
          <h2>Published agents</h2>
          <ul className={g.list}>
            {customAgents.map((agent) => (
              <li key={agent.id} className={g.listItem}>
                <span>
                  <strong>{agent.name}</strong>
                  <br />
                  <span className={g.muted}>{agent.description}</span>
                  <br />
                  <span className={g.muted}>
                    {agent.trigger} · {agent.output.replace(/_/g, ' ')} · {agent.schedule}
                  </span>
                </span>
                <div className={g.toolbar}>
                  <Badge variant={agent.status === 'published' ? 'success' : 'neutral'}>{agent.status}</Badge>
                  <Badge variant={agent.approvalsRequired ? 'accent' : 'neutral'}>
                    {agent.approvalsRequired ? 'Approval gate' : 'Auto'}
                  </Badge>
                  <time dateTime={agent.createdAt}>{formatRelativeTime(agent.createdAt)}</time>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </PageContainer>
  )
}
