import { Code2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CodeBlock } from '../../components/developer/CodeBlock'
import g from '../../components/governance/governance.module.css'
import { Badge } from '../../components/ui/Badge/Badge'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { useDeveloper } from '../../hooks/useDeveloper'
import { formatRelativeTime } from '../../utils/date'
import { DeveloperHubNav } from './DeveloperHubNav'
import styles from './developer.module.css'

function healthVariant(status: string) {
  if (status === 'operational') return 'success' as const
  if (status === 'degraded') return 'warning' as const
  return 'error' as const
}

export function DeveloperPortalPage() {
  const { health, metrics, apiKeys, oauthApps, webhooks, sdkPackages, changelog, requestHistory, apiVersion } =
    useDeveloper()

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        title="Developer Portal"
        description="API health, usage, applications, keys, webhooks, SDKs, and documentation for the RegIntel public platform."
        icon={<Code2 size={20} />}
      />

      <DeveloperHubNav current="/developer" />

      <div className={g.meta} aria-label="API status">
        <span className={health.status === 'operational' ? styles.statusDot : styles.statusDotWarn} />
        <Badge variant={healthVariant(health.status)}>API {health.status}</Badge>
        <Badge variant="accent">{apiVersion}</Badge>
        <Badge variant="neutral">Uptime {health.uptimePct}%</Badge>
      </div>

      <div className={g.metricGrid} aria-label="Developer metrics">
        {metrics.map((metric) => (
          <div key={metric.id} className={g.metric}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <span className={g.muted}>{metric.hint}</span>
          </div>
        ))}
      </div>

      <div className={g.grid}>
        <Link className={g.card} to="/developer/api" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className={g.meta}>
            <Badge variant="accent">Documentation</Badge>
            <Badge variant="neutral">{apiVersion}</Badge>
          </div>
          <h3>API Explorer</h3>
          <p className={g.muted}>Interactive Stripe-style docs with a mock request playground.</p>
        </Link>
        <Link className={g.card} to="/developer/apps" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className={g.meta}>
            <Badge variant="success">{apiKeys.filter((k) => k.status === 'active').length} keys</Badge>
            <Badge variant="neutral">{oauthApps.length} apps</Badge>
          </div>
          <h3>API Keys & OAuth Apps</h3>
          <p className={g.muted}>Live and sandbox credentials, rotation, scopes, and client secrets.</p>
        </Link>
        <Link className={g.card} to="/developer/webhooks" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className={g.meta}>
            <Badge variant="success">{webhooks.filter((w) => w.enabled).length} active</Badge>
            <Badge variant="neutral">{webhooks.length} total</Badge>
          </div>
          <h3>Webhooks Center</h3>
          <p className={g.muted}>Event subscriptions, delivery logs, payload viewer, and replay.</p>
        </Link>
        <Link className={g.card} to="/developer/sdk" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className={g.meta}>
            <Badge variant="accent">{sdkPackages.length} SDKs</Badge>
            <Badge variant="neutral">CLI</Badge>
          </div>
          <h3>SDK Downloads</h3>
          <p className={g.muted}>Install commands, sample projects, and Postman collection.</p>
        </Link>
      </div>

      <div className={styles.splitWide}>
        <section className={g.panel}>
          <h2>Request history</h2>
          <ul className={g.list}>
            {requestHistory.slice(0, 8).map((item) => (
              <li key={item.id} className={g.listItem}>
                <span className={styles.mono}>
                  <strong>{item.method}</strong> {item.path}
                  <br />
                  <span className={g.muted}>
                    {item.status} · {item.latencyMs}ms
                  </span>
                </span>
                <time dateTime={item.at}>{formatRelativeTime(item.at)}</time>
              </li>
            ))}
          </ul>
        </section>

        <aside className={g.stack}>
          <section className={g.panel}>
            <h2>API changelog</h2>
            <ul className={g.list}>
              {changelog.map((entry) => (
                <li key={entry.id} className={g.listItem}>
                  <span>
                    <Badge variant={entry.breaking ? 'warning' : 'neutral'}>{entry.version}</Badge>{' '}
                    <strong>{entry.summary}</strong>
                    <br />
                    <span className={g.muted}>{entry.date}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
          <CodeBlock
            label="Quickstart"
            language="bash"
            code={`npm install @regintel/sdk\nexport RI_API_KEY=ri_test_...\nregintel login --sandbox`}
          />
        </aside>
      </div>
    </PageContainer>
  )
}
