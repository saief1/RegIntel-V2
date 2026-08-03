import { useMemo, useState } from 'react'
import { Network } from 'lucide-react'
import { Link } from 'react-router-dom'
import g from '../../components/governance/governance.module.css'
import { Badge } from '../../components/ui/Badge/Badge'
import { Button } from '../../components/ui/Button/Button'
import { Input } from '../../components/ui/Input/Input'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { Select } from '../../components/ui/Select/Select'
import { useAutonomous } from '../../hooks/useAutonomous'
import type { GraphNodeKind } from '../../types/autonomous'
import styles from '../agents/autonomous.module.css'

const KIND_COLORS: Record<GraphNodeKind, string> = {
  regulation: '#6D5EF6',
  policy: '#2563eb',
  control: '#0891b2',
  risk: '#d97706',
  task: '#7c3aed',
  evidence: '#16a34a',
  report: '#db2777',
  business_unit: '#475569',
  vendor: '#dc2626',
  owner: '#0f766e',
}

export function KnowledgeGraphPage() {
  const { graphNodes, graphEdges } = useAutonomous()
  const [query, setQuery] = useState('')
  const [kindFilter, setKindFilter] = useState<'all' | GraphNodeKind>('all')
  const [selectedId, setSelectedId] = useState<string | null>(graphNodes[0]?.id ?? null)
  const [zoom, setZoom] = useState(1)
  const [view, setView] = useState<'graph' | 'list'>('graph')

  const nodes = useMemo(() => {
    return graphNodes.filter((node) => {
      if (kindFilter !== 'all' && node.kind !== kindFilter) return false
      if (query && !node.label.toLowerCase().includes(query.toLowerCase())) return false
      return true
    })
  }, [graphNodes, kindFilter, query])

  const nodeIds = useMemo(() => new Set(nodes.map((node) => node.id)), [nodes])
  const edges = useMemo(
    () => graphEdges.filter((edge) => nodeIds.has(edge.from) && nodeIds.has(edge.to)),
    [graphEdges, nodeIds],
  )
  const selected = nodes.find((node) => node.id === selectedId) ?? nodes[0]
  const related = selected
    ? edges.filter((edge) => edge.from === selected.id || edge.to === selected.id)
    : []

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        title="Knowledge Graph"
        description="Explore relationships across regulations, policies, controls, risks, work, and owners."
        icon={<Network size={20} />}
      />

      <nav className={styles.hubLinks} aria-label="Autonomous platform areas">
        <Link className={styles.hubLink} to="/knowledge">
          Library
        </Link>
        <Link className={styles.hubLink} to="/agents">
          AI Agents
        </Link>
        <Link className={styles.hubLink} to="/reports/command">
          Command Center
        </Link>
      </nav>

      <div className={g.toolbar}>
        <Input
          aria-label="Search graph"
          placeholder="Search nodes"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Select
          aria-label="Filter by type"
          value={kindFilter}
          onChange={(e) => setKindFilter(e.target.value as 'all' | GraphNodeKind)}
        >
          <option value="all">All types</option>
          {(Object.keys(KIND_COLORS) as GraphNodeKind[]).map((kind) => (
            <option key={kind} value={kind}>
              {kind.replace(/_/g, ' ')}
            </option>
          ))}
        </Select>
        <Button size="sm" variant={view === 'graph' ? 'primary' : 'secondary'} onClick={() => setView('graph')}>
          Graph
        </Button>
        <Button size="sm" variant={view === 'list' ? 'primary' : 'secondary'} onClick={() => setView('list')}>
          List
        </Button>
        {view === 'graph' && (
          <>
            <Button size="sm" variant="ghost" onClick={() => setZoom((z) => Math.min(1.8, Number((z + 0.1).toFixed(2))))}>
              Zoom in
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setZoom((z) => Math.max(0.6, Number((z - 0.1).toFixed(2))))}>
              Zoom out
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setZoom(1)}>
              Reset
            </Button>
          </>
        )}
      </div>

      <div className={styles.split}>
        <section className={g.panel}>
          {view === 'graph' ? (
            <div className={styles.graphShell}>
              <svg
                className={styles.graphCanvas}
                viewBox="0 0 600 480"
                role="img"
                aria-label="Knowledge relationship graph"
              >
                <g transform={`translate(20 20) scale(${zoom})`}>
                  {edges.map((edge) => {
                    const from = graphNodes.find((n) => n.id === edge.from)
                    const to = graphNodes.find((n) => n.id === edge.to)
                    if (!from || !to) return null
                    return (
                      <g key={edge.id}>
                        <line
                          x1={from.x}
                          y1={from.y}
                          x2={to.x}
                          y2={to.y}
                          stroke="rgb(15 23 42 / 18%)"
                          strokeWidth={1.5}
                        />
                      </g>
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
                        r={selected?.id === node.id ? 18 : 14}
                        fill={KIND_COLORS[node.kind]}
                        opacity={0.9}
                      />
                      <text
                        x={node.x}
                        y={node.y + 28}
                        textAnchor="middle"
                        fontSize="11"
                        fill="var(--ri-color-text-primary)"
                      >
                        {node.label}
                      </text>
                    </g>
                  ))}
                </g>
              </svg>
            </div>
          ) : (
            <ul className={g.list} aria-label="Knowledge graph list fallback">
              {nodes.map((node) => (
                <li key={node.id} className={g.listItem}>
                  <button type="button" onClick={() => setSelectedId(node.id)} style={{ all: 'unset', cursor: 'pointer', flex: 1 }}>
                    <strong>{node.label}</strong>
                    <br />
                    <span className={g.muted}>{node.detail}</span>
                  </button>
                  <Badge variant="neutral">{node.kind.replace(/_/g, ' ')}</Badge>
                </li>
              ))}
            </ul>
          )}
          <p className={styles.srOnly}>
            Use list view for a fully accessible relationship browser. Graph nodes are keyboard focusable.
          </p>
        </section>

        <aside className={g.panel}>
          {selected ? (
            <>
              <header className={g.row}>
                <h2>{selected.label}</h2>
                <Badge variant="accent">{selected.kind.replace(/_/g, ' ')}</Badge>
              </header>
              <p className={g.muted}>{selected.detail}</p>
              <h3>Relationships</h3>
              {related.length === 0 ? (
                <p className={g.muted}>No edges in the current filter.</p>
              ) : (
                <ul className={g.list}>
                  {related.map((edge) => {
                    const otherId = edge.from === selected.id ? edge.to : edge.from
                    const other = graphNodes.find((n) => n.id === otherId)
                    return (
                      <li key={edge.id} className={g.listItem}>
                        <span>
                          <strong>{edge.label}</strong> · {other?.label ?? otherId}
                        </span>
                        <Button size="sm" variant="ghost" onClick={() => setSelectedId(otherId)}>
                          Focus
                        </Button>
                      </li>
                    )
                  })}
                </ul>
              )}
              {selected.href && (
                <Link className={styles.hubLink} to={selected.href}>
                  Open linked record
                </Link>
              )}
            </>
          ) : (
            <p className={g.muted}>No nodes match the current filters.</p>
          )}
        </aside>
      </div>
    </PageContainer>
  )
}
