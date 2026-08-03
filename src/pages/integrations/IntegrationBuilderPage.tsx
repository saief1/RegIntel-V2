import { useState } from 'react'
import { Cable } from 'lucide-react'
import g from '../../components/governance/governance.module.css'
import { Badge } from '../../components/ui/Badge/Badge'
import { Button } from '../../components/ui/Button/Button'
import { Input } from '../../components/ui/Input/Input'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { Select } from '../../components/ui/Select/Select'
import { Textarea } from '../../components/ui/Textarea/Textarea'
import { useEcosystem } from '../../hooks/useEcosystem'
import type { BuilderProtocol } from '../../types/ecosystem'
import { formatRelativeTime } from '../../utils/date'
import { EcosystemHubNav } from '../ecosystem/EcosystemHubNav'
import styles from '../ecosystem/ecosystem.module.css'

export function IntegrationBuilderPage() {
  const { builderSteps, customIntegrations, publishCustomIntegration } = useEcosystem()
  const [name, setName] = useState('')
  const [protocol, setProtocol] = useState<BuilderProtocol>('rest')
  const [authType, setAuthType] = useState<'oauth2' | 'api_key' | 'basic' | 'none'>('oauth2')
  const [endpoint, setEndpoint] = useState('https://api.example.com/v1/resources')
  const [mapping, setMapping] = useState('response.data[] → control.id/title')
  const [transformation, setTransformation] = useState('Flatten nested owner fields')
  const [validation, setValidation] = useState('Require id + updated_at')
  const [schedule, setSchedule] = useState('Hourly')
  const [message, setMessage] = useState('')

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        title="Integration Builder"
        description="Create custom REST, GraphQL, webhook, or scheduled sync integrations (mock)."
        icon={<Cable size={20} />}
      />

      <EcosystemHubNav current="/integrations/builder" />

      <section className={g.panel}>
        <h2>Builder pipeline</h2>
        <div className={styles.flow} role="list">
          {builderSteps.map((step, index) => (
            <div key={step} className={styles.flow} role="listitem">
              <span className={index === 0 ? styles.nodeActive : styles.node}>{step}</span>
              {index < builderSteps.length - 1 && (
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
          <h2>Configure integration</h2>
          <div className={styles.formGrid}>
            <label>
              Name
              <Input aria-label="Integration name" value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label>
              Protocol
              <Select aria-label="Protocol" value={protocol} onChange={(e) => setProtocol(e.target.value as BuilderProtocol)}>
                {(['rest', 'graphql', 'webhook', 'scheduled_sync'] as const).map((item) => (
                  <option key={item} value={item}>
                    {item.replace(/_/g, ' ')}
                  </option>
                ))}
              </Select>
            </label>
            <label>
              Authentication
              <Select aria-label="Authentication" value={authType} onChange={(e) => setAuthType(e.target.value as typeof authType)}>
                {(['oauth2', 'api_key', 'basic', 'none'] as const).map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </label>
            <label>
              Schedule
              <Input aria-label="Schedule" value={schedule} onChange={(e) => setSchedule(e.target.value)} disabled={protocol === 'webhook'} />
            </label>
            <label style={{ gridColumn: '1 / -1' }}>
              Request endpoint
              <Input aria-label="Endpoint" value={endpoint} onChange={(e) => setEndpoint(e.target.value)} />
            </label>
            <label style={{ gridColumn: '1 / -1' }}>
              Mapping
              <Textarea aria-label="Mapping" rows={2} value={mapping} onChange={(e) => setMapping(e.target.value)} />
            </label>
            <label style={{ gridColumn: '1 / -1' }}>
              Transformation
              <Textarea aria-label="Transformation" rows={2} value={transformation} onChange={(e) => setTransformation(e.target.value)} />
            </label>
            <label style={{ gridColumn: '1 / -1' }}>
              Validation
              <Textarea aria-label="Validation" rows={2} value={validation} onChange={(e) => setValidation(e.target.value)} />
            </label>
          </div>
          <div className={g.toolbar}>
            <Button
              variant="primary"
              disabled={!name.trim()}
              onClick={() => {
                publishCustomIntegration({
                  name,
                  protocol,
                  authType,
                  endpoint,
                  mapping,
                  transformation,
                  validation,
                  schedule: protocol === 'webhook' ? undefined : schedule,
                })
                setMessage(`Published “${name.trim()}”.`)
                setName('')
              }}
            >
              Publish integration
            </Button>
            {message && <span className={g.muted}>{message}</span>}
          </div>
        </section>

        <aside className={g.panel}>
          <h2>Published custom integrations</h2>
          <ul className={g.list}>
            {customIntegrations.map((item) => (
              <li key={item.id} className={g.listItem}>
                <span>
                  <strong>{item.name}</strong>
                  <br />
                  <span className={g.muted}>
                    {item.protocol.replace(/_/g, ' ')} · {item.authType} · {item.endpoint}
                  </span>
                </span>
                <div className={g.toolbar}>
                  <Badge variant="success">{item.status}</Badge>
                  <time dateTime={item.createdAt}>{formatRelativeTime(item.createdAt)}</time>
                </div>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </PageContainer>
  )
}
