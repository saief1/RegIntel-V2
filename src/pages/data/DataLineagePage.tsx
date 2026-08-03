import { useMemo, useState } from 'react'
import { GitBranch } from 'lucide-react'
import { Link } from 'react-router-dom'
import g from '../../components/governance/governance.module.css'
import { Badge } from '../../components/ui/Badge/Badge'
import { Button } from '../../components/ui/Button/Button'
import { Input } from '../../components/ui/Input/Input'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { useEcosystem } from '../../hooks/useEcosystem'
import type { LineageKind } from '../../types/ecosystem'
import { edgePath, filterGraph, impactClosure, relatedEdges } from '../../utils/graph'
import { formatRelativeTime } from '../../utils/date'
import { EcosystemHubNav } from '../ecosystem/EcosystemHubNav'
import styles from '../ecosystem/ecosystem.module.css'

const KIND_COLORS: Record<LineageKind, string> = {
  regulation: '#6D5EF6',
  policy: '#2563eb',
  control: '#0891b2',
  risk: '#d97706',
  finding: '#dc2626',
  task: '#7c3aed',
  evidence: '#16a34a',
  report: '#db2777',
}

export function DataLineagePage() {
  const { lineageNodes, lineageEdges, activity } = useEcosystem()
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(lineageNodes[0]?.id ?? '')
  const [zoom, setZoom] = useState(1)
  const [view, setView] = useState<'graph' | 'list'>('graph')

  const { nodes, edges } = useMemo(
    () =>
      filterGraph(lineageNodes, lineageEdges, (node) =>
        query ? node.label.toLowerCase().includes(query.toLowerCase()) || node.kind.includes(query.toLowerCase()) : true,
      ),
    [lineageEdges, lineageNodes, query],
  )

  const selected = nodes.find((node) => node.id === selectedId) ?? nodes[0]
  const related = selected ? relatedEdges(edges, selected.id) : []
  const impactIds = selected ? new Set(impactClosure(lineageEdges, selected.id, 'downstream')) : new Set<string>()
  const upstreamIds = selected ? impactClosure(lineageEdges, selected.id, 'upstream') : []
  const relationshipTrail = upstreamIds
    .map((id) => lineageNodes.find((node) => node.id === id))
    .filter((node): node is (typeof lineageNodes)[number] => Boolean(node))

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        title="Enterprise Data Lineage"
        description="Trace regulation → policy → control → risk → finding → task → evidence → report with impact analysis."
        icon={<GitBranch size={20} />}
      />

      <EcosystemHubNav current="/data/lineage" />

      {selected && (
        <nav className={styles.hubLinks} aria-label="Relationship breadcrumbs">
          {relationshipTrail.map((node, index) => (
            <button
              key={node.id}
              type="button"
              className={node.id === selected.id ? styles.chipActive : styles.chip}
              onClick={() => setSelectedId(node.id)}
            >
              {index > 0 ? '← ' : ''}
              {node.kind}: {node.label}
            </button>
          ))}
        </nav>
      )}

      <div className={g.toolbar}>
        <Input aria-label="Search lineage" placeholder="Search nodes" value={query} onChange={(e) => setQuery(e.target.value)} />
        <Button size="sm" variant={view === 'graph' ? 'primary' : 'secondary'} onClick={() => setView('graph')}>
          Graph
        </Button>
        <Button size="sm" variant={view === 'list' ? 'primary' : 'secondary'} onClick={() => setView('list')}>
          List
        </Button>
        {view === 'graph' && (
          <>
            <Button size="sm" variant="ghost" onClick={() => setZoom((z) => Math.min(1.8, z + 0.1))}>
              Zoom in
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))}>
              Zoom out
            </Button>
          </>
        )}
      </div>

      <p className={g.muted}>
        Regulation ↓ Policy ↓ Control ↓ Risk ↓ Finding ↓ Task ↓ Evidence ↓ Report
      </p>

      <div className={styles.split}>
        <section className={g.panel}>
          {view === 'graph' ? (
            <div className={styles.canvasShell}>
              <svg className={styles.canvas} viewBox="0 0 860 300" role="img" aria-label="Data lineage graph">
                <g transform={`translate(10 10) scale(${zoom})`}>
                  {edges.map((edge) => {
                    const from = lineageNodes.find((n) => n.id === edge.from)
                    const to = lineageNodes.find((n) => n.id === edge.to)
                    if (!from || !to) return null
                    return (
                      <path
                        key={edge.id}
                        d={edgePath({ x: from.x, y: from.y }, { x: to.x, y: to.y }, true)}
                        fill="none"
                        stroke="rgb(15 23 42 / 18%)"
                        strokeWidth={1.5}
                      />
                    )
                  })}
                  {nodes.map((node) => (
                    <g
                      key={node.id}
                      className={styles.graphNode}
                      tabIndex={0}
                      role="button"
                      aria-label={`${node.kind} ${node.label}`}
                      aria-pressed={selected?.id === node.id}
                      onClick={() => setSelectedId(node.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          setSelectedId(node.id)
                        }
                      }}
                    >
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={selected?.id === node.id || impactIds.has(node.id) ? 16 : 12}
                        fill={KIND_COLORS[node.kind]}
                        opacity={impactIds.has(node.id) || !selected ? 0.95 : 0.45}
                      />
                      <text x={node.x} y={node.y + 28} textAnchor="middle" fontSize="11" fill="var(--ri-color-text-primary)">
                        {node.label}
                      </text>
                    </g>
                  ))}
                </g>
              </svg>
            </div>
          ) : (
            <ul className={g.list} aria-label="Lineage list fallback">
              {nodes.map((node) => (
                <li key={node.id} className={g.listItem}>
                  <button type="button" onClick={() => setSelectedId(node.id)} style={{ all: 'unset', cursor: 'pointer', flex: 1 }}>
                    <strong>{node.label}</strong>
                    <br />
                    <span className={g.muted}>{node.changeSummary}</span>
                  </button>
                  <Badge variant="neutral">{node.kind}</Badge>
                </li>
              ))}
            </ul>
          )}
          <p className={styles.srOnly}>List view is the accessible dependency browser. Graph nodes are keyboard focusable.</p>
        </section>

        <aside className={g.stack}>
          <section className={g.panel}>
            {selected ? (
              <>
                <header className={g.row}>
                  <h2>{selected.label}</h2>
                  <Badge variant="accent">{selected.kind}</Badge>
                </header>
                <p className={g.muted}>Origin: {selected.origin}</p>
                <p className={g.muted}>
                  Changed by {selected.lastChangedBy} · {formatRelativeTime(selected.lastChangedAt)}
                </p>
                <p className={g.muted}>{selected.changeSummary}</p>
                <h3>Relationships</h3>
                <ul className={g.list}>
                  {related.map((edge) => {
                    const otherId = edge.from === selected.id ? edge.to : edge.from
                    const other = lineageNodes.find((n) => n.id === otherId)
                    return (
                      <li key={edge.id} className={g.listItem}>
                        <span>
                          <strong>{edge.label}</strong> · {other?.label}
                        </span>
                        <Button size="sm" variant="ghost" onClick={() => setSelectedId(otherId)}>
                          Focus
                        </Button>
                      </li>
                    )
                  })}
                </ul>
                <h3>Impact analysis</h3>
                <p className={g.muted}>{impactIds.size - 1} downstream dependencies highlighted.</p>
                {selected.href && (
                  <Link className={styles.hubLink} to={selected.href}>
                    Open record
                  </Link>
                )}
              </>
            ) : (
              <p className={g.muted}>No nodes match.</p>
            )}
          </section>

          <section className={g.panel}>
            <h2>Unified activity</h2>
            <ul className={g.list}>
              {activity.slice(0, 5).map((item) => (
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
