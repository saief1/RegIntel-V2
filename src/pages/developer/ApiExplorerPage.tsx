import { useMemo, useState } from 'react'
import { BookOpen } from 'lucide-react'
import { CodeBlock } from '../../components/developer/CodeBlock'
import { JsonViewer } from '../../components/developer/JsonViewer'
import g from '../../components/governance/governance.module.css'
import { Badge } from '../../components/ui/Badge/Badge'
import { Button } from '../../components/ui/Button/Button'
import { Input } from '../../components/ui/Input/Input'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { Select } from '../../components/ui/Select/Select'
import { Textarea } from '../../components/ui/Textarea/Textarea'
import { useDeveloper } from '../../hooks/useDeveloper'
import type { ApiCategory } from '../../types/developer'
import { DeveloperHubNav } from './DeveloperHubNav'
import styles from './developer.module.css'

export function ApiExplorerPage() {
  const {
    endpoints,
    categories,
    selectedEndpointId,
    selectEndpoint,
    apiVersion,
    setApiVersion,
    runPlayground,
    openApiDocument,
    requestHistory,
  } = useDeveloper()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<'all' | ApiCategory>('all')
  const [method, setMethod] = useState('GET')
  const [path, setPath] = useState('/v1/policies')
  const [body, setBody] = useState('{\n  "limit": 10\n}')
  const [response, setResponse] = useState('// Send a mock request to see a response')

  const filtered = useMemo(
    () =>
      endpoints.filter((item) => {
        if (category !== 'all' && item.category !== category) return false
        if (!query) return true
        const hay = `${item.method} ${item.path} ${item.summary} ${item.description}`.toLowerCase()
        return hay.includes(query.toLowerCase())
      }),
    [category, endpoints, query],
  )

  const selected = filtered.find((item) => item.id === selectedEndpointId) ?? filtered[0]

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        title="Public API Explorer"
        description="Interactive documentation with authentication guidance, examples, errors, and a mock request playground."
        icon={<BookOpen size={20} />}
      />

      <DeveloperHubNav current="/developer/api" />

      <div className={g.toolbar}>
        <Input aria-label="Search endpoints" placeholder="Search endpoints" value={query} onChange={(e) => setQuery(e.target.value)} />
        <Select aria-label="Category" value={category} onChange={(e) => setCategory(e.target.value as 'all' | ApiCategory)}>
          <option value="all">All categories</option>
          {categories.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </Select>
        <Select aria-label="API version" value={apiVersion} onChange={(e) => setApiVersion(e.target.value)}>
          <option value="v1.5">v1.5</option>
          <option value="v1.4">v1.4</option>
          <option value="v1.3">v1.3</option>
        </Select>
        <Badge variant="accent">{apiVersion}</Badge>
      </div>

      <div className={styles.split}>
        <nav className={g.panel} aria-label="Endpoint navigation">
          <h2>Endpoints</h2>
          <div className={styles.endpointNav}>
            {filtered.length === 0 ? (
              <p className={g.muted}>No endpoints match.</p>
            ) : (
              filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={selected?.id === item.id ? styles.endpointBtnActive : styles.endpointBtn}
                  aria-pressed={selected?.id === item.id}
                  onClick={() => {
                    selectEndpoint(item.id)
                    setMethod(item.method)
                    setPath(item.path.replace('{id}', 'pol-aml'))
                    setBody(item.method === 'GET' || item.method === 'DELETE' ? '' : item.requestExample)
                  }}
                >
                  <span className={styles.method}>{item.method}</span>
                  <span className={styles.mono}>{item.path}</span>
                  <br />
                  <span className={g.muted}>{item.summary}</span>
                </button>
              ))
            )}
          </div>
        </nav>

        <div className={g.stack}>
          {selected ? (
            <section className={g.panel} aria-label="Endpoint details">
              <header className={g.row}>
                <div>
                  <h2>
                    <span className={styles.method}>{selected.method}</span>
                    {selected.path}
                  </h2>
                  <p className={g.muted}>{selected.description}</p>
                </div>
                <Badge variant="neutral">{selected.category.replace(/_/g, ' ')}</Badge>
              </header>

              <h3>Authentication</h3>
              <p className={g.muted}>{selected.auth}</p>
              <h3>Rate limits</h3>
              <p className={g.muted}>{selected.rateLimit}</p>
              {selected.pagination && (
                <>
                  <h3>Pagination</h3>
                  <p className={g.muted}>{selected.pagination}</p>
                </>
              )}
              {selected.filtering && (
                <>
                  <h3>Filtering</h3>
                  <p className={g.muted}>{selected.filtering}</p>
                </>
              )}

              <h3>Request example</h3>
              <CodeBlock code={selected.requestExample} label="Request" language={selected.requestExample.trim().startsWith('{') ? 'json' : 'bash'} />
              <h3>Response example</h3>
              <JsonViewer value={selected.responseExample} label="Response" />
              <h3>Error codes</h3>
              <ul className={g.list}>
                {selected.errorCodes.map((error) => (
                  <li key={error.code} className={g.listItem}>
                    <span>
                      <strong>{error.code}</strong> — {error.meaning}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : (
            <section className={g.panel}>
              <p className={g.muted}>Select an endpoint to inspect.</p>
            </section>
          )}

          <section className={g.panel} aria-label="Request playground">
            <h2>Interactive request playground</h2>
            <p className={g.muted}>Mock only — responses are simulated locally.</p>
            <div className={styles.formGrid}>
              <label>
                Method
                <Select aria-label="Playground method" value={method} onChange={(e) => setMethod(e.target.value)}>
                  {['GET', 'POST', 'PATCH', 'PUT', 'DELETE'].map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </Select>
              </label>
              <label>
                Path
                <Input aria-label="Playground path" value={path} onChange={(e) => setPath(e.target.value)} />
              </label>
              <label style={{ gridColumn: '1 / -1' }}>
                Body
                <Textarea aria-label="Playground body" rows={5} value={body} onChange={(e) => setBody(e.target.value)} />
              </label>
            </div>
            <div className={g.toolbar}>
              <Button
                variant="primary"
                onClick={() => setResponse(runPlayground({ method, path, body }))}
              >
                Send mock request
              </Button>
            </div>
            <JsonViewer value={response} label="Playground response" />
          </section>

          <section className={g.panel}>
            <h2>OpenAPI mock schema</h2>
            <JsonViewer value={openApiDocument} label="openapi.json" />
          </section>

          <section className={g.panel}>
            <h2>Recent playground history</h2>
            <ul className={g.list}>
              {requestHistory.slice(0, 5).map((item) => (
                <li key={item.id} className={g.listItem}>
                  <span className={styles.mono}>
                    {item.method} {item.path}
                  </span>
                  <Badge variant={item.status >= 400 ? 'error' : 'success'}>{item.status}</Badge>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </PageContainer>
  )
}
