import { useMemo } from 'react'
import { Trophy } from 'lucide-react'
import g from '../../components/governance/governance.module.css'
import { Badge } from '../../components/ui/Badge/Badge'
import { Button } from '../../components/ui/Button/Button'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { Select } from '../../components/ui/Select/Select'
import { useAnalytics } from '../../hooks/useAnalytics'
import type { BenchmarkEntity } from '../../types/analytics'
import styles from './analytics.module.css'
import { ReportsHubNav } from './ReportsHubNav'

const RADAR_KEYS: Array<keyof Omit<BenchmarkEntity, 'id' | 'name' | 'kind'>> = [
  'complianceMaturity',
  'policyCoverage',
  'auditReadiness',
  'agentEfficiency',
  'workCompletion',
  'riskExposure',
  'reviewSpeed',
]

const LABELS: Record<(typeof RADAR_KEYS)[number], string> = {
  complianceMaturity: 'Maturity',
  policyCoverage: 'Coverage',
  auditReadiness: 'Audit',
  agentEfficiency: 'Agents',
  workCompletion: 'Completion',
  riskExposure: 'Risk',
  reviewSpeed: 'Review speed',
}

function radarPoints(entity: BenchmarkEntity, size: number) {
  const cx = size / 2
  const cy = size / 2
  const radius = size * 0.36
  return RADAR_KEYS.map((key, index) => {
    const angle = (-Math.PI / 2) + (index * 2 * Math.PI) / RADAR_KEYS.length
    const value = entity[key] / 100
    return {
      x: cx + Math.cos(angle) * radius * value,
      y: cy + Math.sin(angle) * radius * value,
      labelX: cx + Math.cos(angle) * (radius + 18),
      labelY: cy + Math.sin(angle) * (radius + 18),
      key,
    }
  })
}

export function BenchmarkPage() {
  const { benchmarks, improvements, benchmarkKind, setBenchmarkKind, queueExport } = useAnalytics()

  const filtered = useMemo(
    () => benchmarks.filter((item) => benchmarkKind === 'all' || item.kind === benchmarkKind),
    [benchmarkKind, benchmarks],
  )

  const leaderboard = useMemo(
    () => [...filtered].sort((a, b) => b.complianceMaturity - a.complianceMaturity),
    [filtered],
  )

  const primary = leaderboard[0]
  const secondary = leaderboard[1]

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        title="Enterprise Benchmarking"
        description="Compare departments, regions, business units, and product lines on maturity and operating metrics."
        icon={<Trophy size={20} />}
      />

      <ReportsHubNav current="/reports/benchmark" />

      <div className={g.toolbar}>
        <Select
          aria-label="Benchmark entity type"
          value={benchmarkKind}
          onChange={(e) => setBenchmarkKind(e.target.value as typeof benchmarkKind)}
        >
          <option value="all">All entities</option>
          <option value="department">Departments</option>
          <option value="region">Regions</option>
          <option value="business_unit">Business units</option>
          <option value="product_line">Product lines</option>
        </Select>
        <Button size="sm" variant="secondary" onClick={() => queueExport('Benchmark comparison', 'csv')}>
          Export CSV
        </Button>
        <Button size="sm" variant="secondary" onClick={() => queueExport('Benchmark comparison', 'xlsx')}>
          Export Excel
        </Button>
      </div>

      <div className={styles.split}>
        <section className={g.panel}>
          <h2>Leaderboard</h2>
          <ul className={g.list}>
            {leaderboard.map((entity, index) => (
              <li key={entity.id} className={g.listItem}>
                <span>
                  <strong>
                    #{index + 1} {entity.name}
                  </strong>
                  <br />
                  <span className={g.muted}>{entity.kind.replace(/_/g, ' ')}</span>
                </span>
                <Badge variant={index === 0 ? 'success' : 'neutral'}>{entity.complianceMaturity}</Badge>
              </li>
            ))}
          </ul>
        </section>

        <aside className={g.panel}>
          <h2>Radar comparison</h2>
          {primary ? (
            <>
              <div className={styles.radarWrap}>
                <svg viewBox="0 0 320 320" role="img" aria-label={`Radar chart for ${primary.name}`}>
                  {[0.25, 0.5, 0.75, 1].map((scale) => (
                    <polygon
                      key={scale}
                      fill="none"
                      stroke="rgb(15 23 42 / 10%)"
                      points={RADAR_KEYS.map((_, index) => {
                        const angle = (-Math.PI / 2) + (index * 2 * Math.PI) / RADAR_KEYS.length
                        const r = 115 * scale
                        return `${160 + Math.cos(angle) * r},${160 + Math.sin(angle) * r}`
                      }).join(' ')}
                    />
                  ))}
                  <polygon
                    fill="rgb(109 94 246 / 18%)"
                    stroke="var(--ri-color-accent)"
                    points={radarPoints(primary, 320)
                      .map((point) => `${point.x},${point.y}`)
                      .join(' ')}
                  />
                  {secondary && (
                    <polygon
                      fill="rgb(37 99 235 / 10%)"
                      stroke="#2563eb"
                      strokeDasharray="4 3"
                      points={radarPoints(secondary, 320)
                        .map((point) => `${point.x},${point.y}`)
                        .join(' ')}
                    />
                  )}
                  {radarPoints(primary, 320).map((point) => (
                    <text
                      key={point.key}
                      x={point.labelX}
                      y={point.labelY}
                      textAnchor="middle"
                      fontSize="10"
                      fill="var(--ri-color-text-muted)"
                    >
                      {LABELS[point.key]}
                    </text>
                  ))}
                </svg>
              </div>
              <p className={g.muted}>
                Solid: {primary.name}
                {secondary ? ` · Dashed: ${secondary.name}` : ''}
              </p>
            </>
          ) : (
            <p className={g.muted}>No entities for this filter.</p>
          )}
        </aside>
      </div>

      <section className={g.panel}>
        <h2>Accessible metrics table</h2>
        <div style={{ overflowX: 'auto' }}>
          <table className={g.list} style={{ width: '100%', borderCollapse: 'collapse' }}>
            <caption className={styles.srOnly}>Benchmark metrics fallback table</caption>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: 8 }}>Entity</th>
                {RADAR_KEYS.map((key) => (
                  <th key={key} style={{ textAlign: 'right', padding: 8 }}>
                    {LABELS[key]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((entity) => (
                <tr key={entity.id}>
                  <td style={{ padding: 8 }}>
                    <strong>{entity.name}</strong>
                    <div className={g.muted}>{entity.kind.replace(/_/g, ' ')}</div>
                  </td>
                  {RADAR_KEYS.map((key) => (
                    <td key={key} style={{ textAlign: 'right', padding: 8 }}>
                      {entity[key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={g.panel}>
        <h2>Improvement opportunities</h2>
        <ul className={g.list}>
          {improvements.map((item) => (
            <li key={item.id} className={g.listItem}>
              <span>
                <strong>
                  {item.entityName} · {item.metric}
                </strong>
                <br />
                <span className={g.muted}>
                  {item.gap} — {item.recommendation}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </PageContainer>
  )
}
