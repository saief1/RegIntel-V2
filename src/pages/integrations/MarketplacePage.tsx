import { useMemo, useState } from 'react'
import { Store } from 'lucide-react'
import g from '../../components/governance/governance.module.css'
import { Badge } from '../../components/ui/Badge/Badge'
import { Button } from '../../components/ui/Button/Button'
import { Input } from '../../components/ui/Input/Input'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { Select } from '../../components/ui/Select/Select'
import { useEcosystem } from '../../hooks/useEcosystem'
import type { MarketplaceCategory } from '../../types/ecosystem'
import { formatRelativeTime } from '../../utils/date'
import { EcosystemHubNav } from '../ecosystem/EcosystemHubNav'
import styles from '../ecosystem/ecosystem.module.css'

function healthClass(status: string) {
  if (status === 'connected') return styles.healthDot
  if (status === 'degraded') return styles.healthDotWarn
  return styles.healthDotBad
}

export function MarketplacePage() {
  const {
    connectors,
    categories,
    selectedConnectorId,
    selectConnector,
    installConnector,
    enableConnector,
    disableConnector,
    updateConnectorConfig,
    activity,
  } = useEcosystem()
  const [category, setCategory] = useState<'all' | MarketplaceCategory>('all')
  const [query, setQuery] = useState('')
  const [configDraft, setConfigDraft] = useState('')

  const filtered = useMemo(
    () =>
      connectors.filter((item) => {
        if (category !== 'all' && item.category !== category) return false
        if (query && !`${item.name} ${item.vendor} ${item.description}`.toLowerCase().includes(query.toLowerCase())) {
          return false
        }
        return true
      }),
    [category, connectors, query],
  )

  const selected = filtered.find((item) => item.id === selectedConnectorId) ?? filtered[0]

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        title="Enterprise Integration Marketplace"
        description="Browse, install, configure, and monitor enterprise connectors across identity, productivity, and more."
        icon={<Store size={20} />}
      />

      <EcosystemHubNav current="/integrations/marketplace" />

      <div className={g.toolbar}>
        <Input aria-label="Search connectors" placeholder="Search connectors" value={query} onChange={(e) => setQuery(e.target.value)} />
        <Select
          aria-label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value as 'all' | MarketplaceCategory)}
        >
          <option value="all">All categories</option>
          {categories.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </Select>
      </div>

      <div className={styles.split}>
        <section aria-label="Connector catalog">
          <div className={g.grid}>
            {filtered.map((item) => (
              <button
                key={item.id}
                type="button"
                className={g.card}
                aria-pressed={selected?.id === item.id}
                onClick={() => {
                  selectConnector(item.id)
                  setConfigDraft(item.configSummary)
                }}
              >
                <div className={g.meta}>
                  <Badge variant="neutral">{item.category.replace(/_/g, ' ')}</Badge>
                  <Badge
                    variant={
                      item.state === 'enabled' ? 'success' : item.state === 'installed' ? 'accent' : item.state === 'disabled' ? 'warning' : 'neutral'
                    }
                  >
                    {item.state}
                  </Badge>
                  <span className={healthClass(item.connectionStatus)} aria-label={item.connectionStatus} />
                </div>
                <h3>{item.name}</h3>
                <p className={g.muted}>{item.description}</p>
                <p className={g.muted}>{item.vendor}</p>
              </button>
            ))}
          </div>
        </section>

        <aside className={g.stack}>
          {selected && (
            <section className={g.panel} aria-label={`${selected.name} configuration`}>
              <header className={g.row}>
                <div>
                  <h2>{selected.name}</h2>
                  <p className={g.muted}>{selected.vendor}</p>
                </div>
                <Badge variant={selected.connectionStatus === 'connected' ? 'success' : selected.connectionStatus === 'degraded' ? 'warning' : 'neutral'}>
                  {selected.connectionStatus}
                </Badge>
              </header>
              <p className={g.muted}>{selected.description}</p>
              <h3>Permissions</h3>
              <p className={g.muted}>{selected.permissions.join(', ') || 'None'}</p>
              <h3>Configuration</h3>
              <Input
                aria-label="Configuration summary"
                value={configDraft || selected.configSummary}
                onChange={(e) => setConfigDraft(e.target.value)}
              />
              <div className={g.toolbar}>
                <Button size="sm" variant="secondary" onClick={() => updateConnectorConfig(selected.id, configDraft || selected.configSummary)}>
                  Save config
                </Button>
                {selected.state === 'available' && (
                  <Button size="sm" variant="primary" onClick={() => installConnector(selected.id)}>
                    Install
                  </Button>
                )}
                {(selected.state === 'installed' || selected.state === 'disabled') && (
                  <Button size="sm" variant="primary" onClick={() => enableConnector(selected.id)}>
                    Enable
                  </Button>
                )}
                {selected.state === 'enabled' && (
                  <Button size="sm" variant="secondary" onClick={() => disableConnector(selected.id)}>
                    Disable
                  </Button>
                )}
              </div>
              <h3>Sync history</h3>
              {selected.syncHistory.length === 0 ? (
                <p className={g.muted}>No sync history yet.</p>
              ) : (
                <ul className={g.list}>
                  {selected.syncHistory.map((entry) => (
                    <li key={entry.id} className={g.listItem}>
                      <span>
                        <strong>{entry.result}</strong> · {entry.message}
                      </span>
                      <time dateTime={entry.at}>{formatRelativeTime(entry.at)}</time>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          <section className={g.panel}>
            <h2>Recent sync panel</h2>
            <ul className={g.list}>
              {activity
                .filter((item) => item.source === 'integration' || item.source === 'marketplace')
                .slice(0, 6)
                .map((item) => (
                  <li key={item.id} className={g.listItem}>
                    <span>
                      <strong>{item.title}</strong>
                      <br />
                      <span className={g.muted}>{item.detail}</span>
                    </span>
                    <time dateTime={item.at}>{formatRelativeTime(item.at)}</time>
                  </li>
                ))}
            </ul>
          </section>
        </aside>
      </div>
    </PageContainer>
  )
}
