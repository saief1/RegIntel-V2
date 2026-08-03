import { useState } from 'react'
import { Code2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { MarkdownContent } from '../../components/ai/MarkdownContent/MarkdownContent'
import g from '../../components/governance/governance.module.css'
import { Badge } from '../../components/ui/Badge/Badge'
import { Button } from '../../components/ui/Button/Button'
import { Input } from '../../components/ui/Input/Input'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { Select } from '../../components/ui/Select/Select'
import { Textarea } from '../../components/ui/Textarea/Textarea'
import { useConnected } from '../../hooks/useConnected'
import { formatRelativeTime } from '../../utils/date'
import styles from '../connected/connected.module.css'

export function ApiPlatformPage() {
  const {
    apiKeys,
    oauthClients,
    webhooks,
    webhookEvents,
    apiUsage,
    apiDocs,
    createApiKey,
    revokeApiKey,
    rateLimit,
  } = useConnected()
  const [tab, setTab] = useState<'keys' | 'oauth' | 'webhooks' | 'usage' | 'docs' | 'console'>('keys')
  const [newKeyName, setNewKeyName] = useState('')
  const [method, setMethod] = useState('GET')
  const [path, setPath] = useState('/v1/policies')
  const [body, setBody] = useState('{\n  "limit": 10\n}')
  const [consoleOut, setConsoleOut] = useState('// Run a mock request to see a sample response')

  function runConsole() {
    setConsoleOut(
      JSON.stringify(
        {
          ok: true,
          method,
          path,
          rateLimitRemaining: rateLimit.limit - rateLimit.used - 1,
          mock: true,
          data: {
            items: [{ id: 'pol-aml', title: 'AML Policy' }],
            requestBody: method === 'GET' ? undefined : body,
          },
        },
        null,
        2,
      ),
    )
  }

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        title="API Platform"
        description="Developer portal for keys, OAuth clients, webhooks, usage, and a test console."
        icon={<Code2 size={20} />}
      />

      <nav className={styles.hubLinks} aria-label="Connected enterprise areas">
        <Link className={styles.hubLink} to="/developer">
          Developer Portal
        </Link>
        <Link className={styles.hubLink} to="/developer/api">
          API Explorer
        </Link>
        <Link className={styles.hubLink} to="/settings/integrations">
          Integrations
        </Link>
        <Link className={styles.hubLink} to="/settings">
          Settings
        </Link>
      </nav>

      <div className={g.tabs} role="tablist" aria-label="API platform sections">
        {(
          [
            ['keys', 'API Keys'],
            ['oauth', 'OAuth Clients'],
            ['webhooks', 'Webhooks'],
            ['usage', 'API Usage'],
            ['docs', 'Documentation'],
            ['console', 'Test Console'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={tab === id ? g.tabActive : g.tab}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'keys' && (
        <section className={g.panel}>
          <header className={g.row}>
            <h2>API keys</h2>
            <div className={g.toolbar}>
              <Input
                aria-label="New API key name"
                placeholder="Key name"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
              />
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  createApiKey(newKeyName)
                  setNewKeyName('')
                }}
              >
                Generate key
              </Button>
            </div>
          </header>
          <ul className={g.list}>
            {apiKeys.map((key) => (
              <li key={key.id} className={g.listItem}>
                <span>
                  <strong>{key.name}</strong>
                  <br />
                  <span className={g.muted}>
                    {key.prefix} · {key.scopes.join(', ')}
                    {key.lastUsedAt ? ` · Last used ${formatRelativeTime(key.lastUsedAt)}` : ''}
                  </span>
                </span>
                <div className={g.toolbar}>
                  <Badge variant={key.status === 'active' ? 'success' : 'neutral'}>{key.status}</Badge>
                  {key.status === 'active' && (
                    <Button size="sm" variant="secondary" onClick={() => revokeApiKey(key.id)}>
                      Revoke
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab === 'oauth' && (
        <section className={g.panel}>
          <h2>OAuth clients</h2>
          <ul className={g.list}>
            {oauthClients.map((client) => (
              <li key={client.id} className={g.listItem}>
                <span>
                  <strong>{client.name}</strong>
                  <br />
                  <span className={g.muted}>
                    {client.clientId} · {client.scopes.join(', ')}
                  </span>
                  <br />
                  <span className={g.muted}>Redirect: {client.redirectUris.join(', ')}</span>
                </span>
                <time dateTime={client.createdAt}>{formatRelativeTime(client.createdAt)}</time>
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab === 'webhooks' && (
        <div className={styles.split}>
          <section className={g.panel}>
            <h2>Webhook endpoints</h2>
            <ul className={g.list}>
              {webhooks.map((hook) => (
                <li key={hook.id} className={g.listItem}>
                  <span>
                    <strong>{hook.url}</strong>
                    <br />
                    <span className={g.muted}>
                      {hook.events.join(', ')} · Secret {hook.secretPrefix}
                    </span>
                  </span>
                  <Badge
                    variant={
                      hook.status === 'active' ? 'success' : hook.status === 'failing' ? 'error' : 'warning'
                    }
                  >
                    {hook.status}
                  </Badge>
                </li>
              ))}
            </ul>
          </section>
          <section className={g.panel}>
            <h2>Event logs</h2>
            <ul className={g.list}>
              {webhookEvents.map((event) => (
                <li key={event.id} className={g.listItem}>
                  <span>
                    <strong>{event.event}</strong>
                    <br />
                    <span className={g.muted}>{event.payloadSummary}</span>
                  </span>
                  <div className={g.toolbar}>
                    <Badge variant={event.status === 'delivered' ? 'success' : event.status === 'failed' ? 'error' : 'accent'}>
                      {event.status}
                    </Badge>
                    <time dateTime={event.at}>{formatRelativeTime(event.at)}</time>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}

      {tab === 'usage' && (
        <section className={g.panel}>
          <h2>API usage & rate limits</h2>
          <div className={styles.field}>
            <label>
              Current window ({rateLimit.window})
            </label>
            <p>
              {rateLimit.used} / {rateLimit.limit} requests
            </p>
            <div className={styles.usageBar} aria-hidden="true">
              <span style={{ width: `${Math.round((rateLimit.used / rateLimit.limit) * 100)}%` }} />
            </div>
          </div>
          <ul className={g.list}>
            {apiUsage.map((point) => (
              <li key={point.day} className={g.listItem}>
                <span>
                  <strong>{point.day}</strong>
                  <br />
                  <span className={g.muted}>
                    {point.requests} requests · {point.errors} errors
                  </span>
                </span>
                <div className={styles.usageBar} style={{ width: 120 }} aria-hidden="true">
                  <span style={{ width: `${Math.min(100, Math.round(point.requests / 12))}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab === 'docs' && (
        <section className={g.panel}>
          <h2>API documentation</h2>
          <div className={styles.docs}>
            <MarkdownContent content={apiDocs} />
          </div>
        </section>
      )}

      {tab === 'console' && (
        <section className={g.panel}>
          <h2>Test console</h2>
          <div className={styles.console}>
            <div className={g.toolbar}>
              <Select aria-label="HTTP method" value={method} onChange={(e) => setMethod(e.target.value)}>
                {['GET', 'POST', 'PATCH', 'DELETE'].map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
              <Input aria-label="Request path" value={path} onChange={(e) => setPath(e.target.value)} />
              <Button size="sm" variant="primary" onClick={runConsole}>
                Send
              </Button>
            </div>
            {method !== 'GET' && (
              <Textarea aria-label="Request body" rows={6} value={body} onChange={(e) => setBody(e.target.value)} />
            )}
            <pre className={styles.consoleOut}>{consoleOut}</pre>
          </div>
        </section>
      )}
    </PageContainer>
  )
}
