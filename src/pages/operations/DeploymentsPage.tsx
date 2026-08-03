import { Rocket } from 'lucide-react'
import g from '../../components/governance/governance.module.css'
import { Badge } from '../../components/ui/Badge/Badge'
import { Button } from '../../components/ui/Button/Button'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { useProdOps } from '../../hooks/useProdOps'
import type { OpsEnvironment } from '../../types/prodops'
import { formatRelativeTime } from '../../utils/date'
import { ProdOpsHubNav } from './ProdOpsHubNav'
import styles from './operations.module.css'

const ENVS: OpsEnvironment[] = ['development', 'qa', 'staging', 'production']

function deployVariant(status: string) {
  if (status === 'healthy') return 'success' as const
  if (status === 'failed' || status === 'rolled_back') return 'error' as const
  if (status === 'deploying' || status === 'approved') return 'accent' as const
  return 'neutral' as const
}

export function DeploymentsPage() {
  const {
    deployments,
    selectedEnvironment,
    setSelectedEnvironment,
    rollbackDeployment,
    approveDeployment,
    featureFlags,
    toggleDeployFlag,
  } = useProdOps()

  const filtered = deployments.filter((item) => item.environment === selectedEnvironment)
  const current = filtered[0]
  const history = filtered

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        title="Deployment Center"
        description="Environments, version history, rollbacks, feature flags, approvals, and health verification."
        icon={<Rocket size={20} />}
      />

      <ProdOpsHubNav current="/operations/deployments" />

      <div className={g.tabs} role="tablist" aria-label="Environments">
        {ENVS.map((env) => (
          <button
            key={env}
            type="button"
            role="tab"
            aria-selected={selectedEnvironment === env}
            className={selectedEnvironment === env ? g.tabActive : g.tab}
            onClick={() => setSelectedEnvironment(env)}
          >
            {env}
          </button>
        ))}
      </div>

      {current ? (
        <section className={g.panel}>
          <header className={g.row}>
            <div>
              <h2>
                {current.environment} · v{current.version}
              </h2>
              <p className={g.muted}>Previous v{current.previousVersion} · by {current.deployedBy}</p>
            </div>
            <Badge variant={deployVariant(current.status)}>{current.status}</Badge>
          </header>
          <p className={g.muted}>{current.releaseNotes}</p>
          <div className={g.toolbar}>
            <Button size="sm" variant="secondary" onClick={() => approveDeployment(current.id)} disabled={current.status === 'approved' || current.status === 'healthy'}>
              Approve
            </Button>
            <Button size="sm" variant="ghost" onClick={() => rollbackDeployment(current.id)}>
              Rollback
            </Button>
            <Badge variant={current.healthVerified ? 'success' : 'warning'}>
              Health {current.healthVerified ? 'verified' : 'pending'}
            </Badge>
          </div>
          <h3>Deployment checklist</h3>
          <ul className={g.list}>
            {current.checklist.map((item) => (
              <li key={item.id} className={g.listItem}>
                <span>{item.label}</span>
                <Badge variant={item.done ? 'success' : 'neutral'}>{item.done ? 'done' : 'todo'}</Badge>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section className={g.panel}>
          <p className={g.muted}>No deployments for this environment.</p>
        </section>
      )}

      <div className={styles.split}>
        <section className={g.panel}>
          <h2>Deployment history</h2>
          <ul className={g.list}>
            {history.map((item) => (
              <li key={item.id} className={g.listItem}>
                <span>
                  <strong>v{item.version}</strong>
                  <br />
                  <span className={g.muted}>
                    from v{item.previousVersion} · {formatRelativeTime(item.deployedAt)}
                  </span>
                </span>
                <Badge variant={deployVariant(item.status)}>{item.status}</Badge>
              </li>
            ))}
          </ul>
          <h3>Version history</h3>
          <p className={g.muted}>Release notes are attached to each deployment record above.</p>
        </section>

        <aside className={g.panel}>
          <h2>Feature flags</h2>
          <ul className={g.list}>
            {featureFlags
              .filter((flag) => flag.environment === selectedEnvironment || selectedEnvironment === 'production')
              .map((flag) => (
                <li key={flag.id} className={g.listItem}>
                  <span>
                    <strong>{flag.key}</strong>
                    <br />
                    <span className={g.muted}>{flag.environment}</span>
                  </span>
                  <Button size="sm" variant="secondary" onClick={() => toggleDeployFlag(flag.id)}>
                    {flag.enabled ? 'Disable' : 'Enable'}
                  </Button>
                </li>
              ))}
          </ul>
          <h3>Approval workflow</h3>
          <p className={g.muted}>Development → QA → Staging → Production with change approval gates (mock).</p>
        </aside>
      </div>
    </PageContainer>
  )
}
