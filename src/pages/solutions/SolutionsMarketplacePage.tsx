import { Layers } from 'lucide-react'
import { Link } from 'react-router-dom'
import g from '../../components/governance/governance.module.css'
import { Badge } from '../../components/ui/Badge/Badge'
import { Button } from '../../components/ui/Button/Button'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { useSolutions } from '../../hooks/useSolutions'
import { SolutionsHubNav } from './SolutionsHubNav'
import styles from './solutions.module.css'

function stateVariant(state: string) {
  if (state === 'installed') return 'success' as const
  if (state === 'preview') return 'accent' as const
  if (state === 'updating') return 'warning' as const
  return 'neutral' as const
}

export function SolutionsMarketplacePage() {
  const { packs, installPack, previewPack, setActiveSolutionId } = useSolutions()

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        title="Solution Marketplace"
        description="Industry solution packs with modules, dashboards, AI agents, templates, playbooks, and regulatory libraries."
        icon={<Layers size={20} />}
      />

      <SolutionsHubNav current="/solutions" />

      <p className={g.muted}>
        Flagship recommendation: start with <strong>Wealth Management (Canada)</strong> — CIRO, CSA, FINTRAC, OBSI — then
        reuse the same platform for Banking, Insurance, and GRC.
      </p>

      <div className={g.grid}>
        {packs.map((pack) => (
          <article key={pack.id} className={`${g.card} ${pack.flagship ? styles.flagship : ''}`} style={{ cursor: 'default' }}>
            <div className={g.meta}>
              <Badge variant={stateVariant(pack.state)}>{pack.state}</Badge>
              <Badge variant="neutral">v{pack.version}</Badge>
              {pack.flagship && <Badge variant="accent">Flagship</Badge>}
            </div>
            <h3>{pack.name}</h3>
            <p className={g.muted}>{pack.tagline}</p>
            <p className={g.muted}>{pack.description}</p>
            <h4>Modules</h4>
            <p className={g.muted}>{pack.modules.join(' · ')}</p>
            <h4>Dashboards</h4>
            <p className={g.muted}>{pack.dashboards.join(' · ')}</p>
            <h4>AI Agents</h4>
            <p className={g.muted}>{pack.aiAgents.join(' · ')}</p>
            <h4>Templates</h4>
            <p className={g.muted}>{pack.templates.join(' · ')}</p>
            <h4>Playbooks</h4>
            <p className={g.muted}>{pack.playbooks.join(' · ')}</p>
            <h4>Regulatory libraries</h4>
            <p className={g.muted}>{pack.regulatoryLibraries.join(' · ')}</p>
            <p className={g.muted}>Release notes: {pack.releaseNotes}</p>
            <div className={g.toolbar}>
              {pack.href && (
                <Link
                  className={styles.hubLink}
                  to={pack.href}
                  onClick={() => setActiveSolutionId(pack.id)}
                >
                  Preview
                </Link>
              )}
              {pack.state !== 'installed' && (
                <Button size="sm" variant="primary" onClick={() => installPack(pack.id)}>
                  Install
                </Button>
              )}
              {pack.state === 'available' && (
                <Button size="sm" variant="secondary" onClick={() => previewPack(pack.id)}>
                  Mark preview
                </Button>
              )}
              <Button size="sm" variant="ghost" disabled>
                Documentation
              </Button>
            </div>
          </article>
        ))}
      </div>
    </PageContainer>
  )
}
