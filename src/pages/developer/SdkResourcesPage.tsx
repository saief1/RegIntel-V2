import { useState } from 'react'
import { Package } from 'lucide-react'
import { CodeBlock } from '../../components/developer/CodeBlock'
import { CopyButton } from '../../components/developer/CopyButton'
import g from '../../components/governance/governance.module.css'
import { Badge } from '../../components/ui/Badge/Badge'
import { Button } from '../../components/ui/Button/Button'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { useDeveloper } from '../../hooks/useDeveloper'
import { DeveloperHubNav } from './DeveloperHubNav'
import styles from './developer.module.css'

type SdkTab = 'sdks' | 'cli' | 'examples' | 'postman'

const POSTMAN_COLLECTION = `{
  "info": { "name": "RegIntel Public API", "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json" },
  "variable": [
    { "key": "baseUrl", "value": "https://api.regintel.example" },
    { "key": "apiKey", "value": "ri_test_..." }
  ],
  "item": [
    { "name": "List policies", "request": { "method": "GET", "url": "{{baseUrl}}/v1/policies" } },
    { "name": "Create task", "request": { "method": "POST", "url": "{{baseUrl}}/v1/tasks" } }
  ]
}`

const POSTMAN_ENV = `{
  "name": "RegIntel Sandbox",
  "values": [
    { "key": "baseUrl", "value": "https://sandbox.api.regintel.example", "enabled": true },
    { "key": "apiKey", "value": "ri_test_replace_me", "enabled": true },
    { "key": "orgId", "value": "org_contoso", "enabled": true }
  ]
}`

export function SdkResourcesPage() {
  const { sdkPackages, cliCommands, sampleProjects } = useDeveloper()
  const [tab, setTab] = useState<SdkTab>('sdks')
  const [selectedSdk, setSelectedSdk] = useState(sdkPackages[0]?.id ?? 'typescript')
  const sdk = sdkPackages.find((item) => item.id === selectedSdk) ?? sdkPackages[0]

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        title="SDK & Developer Resources"
        description="Official SDKs, CLI, sample projects, and Postman assets for integrating RegIntel."
        icon={<Package size={20} />}
      />

      <DeveloperHubNav current="/developer/sdk" />

      <div className={g.tabs} role="tablist" aria-label="Developer resources">
        {(
          [
            ['sdks', 'SDKs'],
            ['cli', 'CLI'],
            ['examples', 'Examples'],
            ['postman', 'Postman'],
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

      {tab === 'sdks' && (
        <div className={styles.splitWide}>
          <section className={g.panel}>
            <h2>SDKs</h2>
            <div className={g.grid}>
              {sdkPackages.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={g.card}
                  aria-pressed={sdk?.id === item.id}
                  onClick={() => setSelectedSdk(item.id)}
                >
                  <div className={g.meta}>
                    <Badge variant="accent">v{item.version}</Badge>
                  </div>
                  <h3>{item.label}</h3>
                  <p className={g.muted}>{item.description}</p>
                </button>
              ))}
            </div>
          </section>
          {sdk && (
            <aside className={g.panel}>
              <h2>{sdk.label} installer</h2>
              <p className={g.muted}>{sdk.description}</p>
              <CodeBlock code={sdk.install} label="Mock SDK installer" language="bash" />
              <CodeBlock
                label="Hello world"
                language={sdk.id === 'python' ? 'bash' : 'javascript'}
                code={
                  sdk.id === 'python'
                    ? `from regintel import Client\nclient = Client(api_key="ri_test_...")\nprint(client.policies.list())`
                    : `import { RegIntel } from "@regintel/sdk";\nconst ri = new RegIntel({ apiKey: process.env.RI_API_KEY });\nconst policies = await ri.policies.list();`
                }
              />
            </aside>
          )}
        </div>
      )}

      {tab === 'cli' && (
        <section className={g.panel}>
          <h2>Mock RegIntel CLI</h2>
          <CodeBlock
            label="Install CLI"
            language="bash"
            code={`npm install -g @regintel/cli\n# or\nbrew install regintel/tap/regintel`}
          />
          <ul className={g.list}>
            {cliCommands.map((item) => (
              <li key={item.command} className={g.listItem}>
                <span>
                  <code className={styles.mono}>{item.command}</code>
                  <br />
                  <span className={g.muted}>{item.description}</span>
                </span>
                <CopyButton value={item.command} label="Copy" />
              </li>
            ))}
          </ul>
          <CodeBlock
            label="Session example"
            language="bash"
            code={`regintel login\nregintel pull\nregintel validate\nregintel deploy\nregintel sync`}
          />
        </section>
      )}

      {tab === 'examples' && (
        <section className={g.panel}>
          <h2>Sample projects</h2>
          <div className={g.grid}>
            {sampleProjects.map((project) => (
              <article key={project.id} className={g.card} style={{ cursor: 'default' }}>
                <div className={g.meta}>
                  <Badge variant="neutral">{project.stack}</Badge>
                </div>
                <h3>{project.title}</h3>
                <p className={g.muted}>{project.description}</p>
                <p className={`${g.muted} ${styles.mono}`}>{project.repoHint}</p>
                <CopyButton value={`git clone https://${project.repoHint}.git`} label="Copy clone" />
              </article>
            ))}
          </div>
        </section>
      )}

      {tab === 'postman' && (
        <div className={styles.splitWide}>
          <section className={g.panel}>
            <h2>Postman collection</h2>
            <p className={g.muted}>Download mock collection JSON for the public API.</p>
            <CodeBlock code={POSTMAN_COLLECTION} label="regintel.postman_collection.json" language="json" />
            <Button
              variant="secondary"
              onClick={() => {
                const blob = new Blob([POSTMAN_COLLECTION], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const anchor = document.createElement('a')
                anchor.href = url
                anchor.download = 'regintel.postman_collection.json'
                anchor.click()
                URL.revokeObjectURL(url)
              }}
            >
              Collection download
            </Button>
          </section>
          <aside className={g.panel}>
            <h2>Environment & variables</h2>
            <CodeBlock code={POSTMAN_ENV} label="regintel.postman_environment.json" language="json" />
            <ul className={g.list}>
              <li className={g.listItem}><span>baseUrl</span><code className={styles.mono}>sandbox.api…</code></li>
              <li className={g.listItem}><span>apiKey</span><code className={styles.mono}>ri_test_…</code></li>
              <li className={g.listItem}><span>orgId</span><code className={styles.mono}>org_contoso</code></li>
            </ul>
          </aside>
        </div>
      )}
    </PageContainer>
  )
}
