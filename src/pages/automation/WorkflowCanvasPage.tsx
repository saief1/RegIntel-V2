import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { Waypoints } from 'lucide-react'
import { Link } from 'react-router-dom'
import g from '../../components/governance/governance.module.css'
import { Badge } from '../../components/ui/Badge/Badge'
import { Button } from '../../components/ui/Button/Button'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { useEcosystem } from '../../hooks/useEcosystem'
import { edgePath } from '../../utils/graph'
import { formatRelativeTime } from '../../utils/date'
import { EcosystemHubNav } from '../ecosystem/EcosystemHubNav'
import styles from '../ecosystem/ecosystem.module.css'

export function WorkflowCanvasPage() {
  const {
    workflow,
    workflowVersions,
    moveWorkflowNode,
    validateWorkflow,
    publishWorkflow,
    rollbackWorkflow,
    canvasZoom,
    setCanvasZoom,
    canvasPan,
    setCanvasPan,
  } = useEcosystem()
  const [selectedId, setSelectedId] = useState(workflow.nodes[0]?.id ?? '')
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [panning, setPanning] = useState(false)
  const lastPointer = useRef<{ x: number; y: number } | null>(null)
  const selected = workflow.nodes.find((node) => node.id === selectedId)

  function onPointerDownCanvas(event: ReactPointerEvent<SVGSVGElement>) {
    if ((event.target as Element).closest('[data-node="true"]')) return
    setPanning(true)
    lastPointer.current = { x: event.clientX, y: event.clientY }
  }

  function onPointerMove(event: ReactPointerEvent<SVGSVGElement>) {
    if (panning && lastPointer.current) {
      const dx = event.clientX - lastPointer.current.x
      const dy = event.clientY - lastPointer.current.y
      lastPointer.current = { x: event.clientX, y: event.clientY }
      setCanvasPan({ x: canvasPan.x + dx, y: canvasPan.y + dy })
      return
    }
    if (!draggingId) return
    const svg = event.currentTarget
    const rect = svg.getBoundingClientRect()
    const x = (event.clientX - rect.left - canvasPan.x) / canvasZoom - 48
    const y = (event.clientY - rect.top - canvasPan.y) / canvasZoom - 18
    moveWorkflowNode(draggingId, Math.max(0, x), Math.max(0, y))
  }

  function onPointerUp() {
    setDraggingId(null)
    setPanning(false)
    lastPointer.current = null
  }

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        title="Enterprise Workflow Studio 2.0"
        description="Visual canvas with zoom, pan, validation, versioning, publish, and rollback."
        icon={<Waypoints size={20} />}
      />

      <EcosystemHubNav current="/automation/canvas" />

      <div className={g.toolbar}>
        <Button size="sm" variant="ghost" onClick={() => setCanvasZoom(canvasZoom + 0.1)}>
          Zoom in
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setCanvasZoom(canvasZoom - 0.1)}>
          Zoom out
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setCanvasZoom(1)
            setCanvasPan({ x: 0, y: 0 })
          }}
        >
          Reset view
        </Button>
        <Button size="sm" variant="secondary" onClick={() => validateWorkflow()}>
          Validate
        </Button>
        <Button size="sm" variant="primary" onClick={publishWorkflow}>
          Publish
        </Button>
        <Badge variant={workflow.status === 'published' ? 'success' : 'accent'}>
          v{workflow.version} · {workflow.status}
        </Badge>
        <Link className={styles.hubLink} to="/automation">
          Classic Automation Studio
        </Link>
      </div>

      <div className={styles.split}>
        <section className={g.panel}>
          <h2>{workflow.name}</h2>
          <div className={styles.canvasShell}>
            <svg
              className={styles.canvas}
              viewBox="0 0 1100 360"
              role="img"
              aria-label="Workflow canvas"
              onPointerDown={onPointerDownCanvas}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={onPointerUp}
            >
              <g transform={`translate(${canvasPan.x} ${canvasPan.y}) scale(${canvasZoom})`}>
                {workflow.edges.map((edge) => {
                  const from = workflow.nodes.find((node) => node.id === edge.from)
                  const to = workflow.nodes.find((node) => node.id === edge.to)
                  if (!from || !to) return null
                  return (
                    <g key={edge.id}>
                      <path
                        d={edgePath({ x: from.x + 48, y: from.y + 18 }, { x: to.x + 48, y: to.y + 18 }, true)}
                        fill="none"
                        stroke="rgb(15 23 42 / 20%)"
                        strokeWidth={1.5}
                      />
                      {edge.label && (
                        <text x={(from.x + to.x) / 2 + 48} y={(from.y + to.y) / 2} fontSize="10" fill="var(--ri-color-text-muted)">
                          {edge.label}
                        </text>
                      )}
                    </g>
                  )
                })}
                {workflow.nodes.map((node) => (
                  <g
                    key={node.id}
                    className={styles.graphNode}
                    data-node="true"
                    tabIndex={0}
                    role="button"
                    aria-label={`${node.type} ${node.label}`}
                    aria-pressed={selectedId === node.id}
                    transform={`translate(${node.x} ${node.y})`}
                    onPointerDown={(event) => {
                      event.stopPropagation()
                      setSelectedId(node.id)
                      setDraggingId(node.id)
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        setSelectedId(node.id)
                      }
                      const step = 8
                      if (event.key === 'ArrowRight') moveWorkflowNode(node.id, node.x + step, node.y)
                      if (event.key === 'ArrowLeft') moveWorkflowNode(node.id, Math.max(0, node.x - step), node.y)
                      if (event.key === 'ArrowUp') moveWorkflowNode(node.id, node.x, Math.max(0, node.y - step))
                      if (event.key === 'ArrowDown') moveWorkflowNode(node.id, node.x, node.y + step)
                    }}
                  >
                    <rect
                      width={96}
                      height={36}
                      rx={8}
                      fill={selectedId === node.id ? 'var(--ri-color-accent-subtle)' : 'var(--ri-color-surface)'}
                      stroke={selectedId === node.id ? 'var(--ri-color-accent)' : 'var(--ri-color-border)'}
                    />
                    <text x={48} y={22} textAnchor="middle" fontSize="11" fill="var(--ri-color-text-primary)">
                      {node.label}
                    </text>
                  </g>
                ))}
              </g>
            </svg>
          </div>
          <p className={g.muted}>Drag nodes or use arrow keys. Pan empty canvas. Zoom {Math.round(canvasZoom * 100)}%.</p>
        </section>

        <aside className={g.stack}>
          <section className={g.panel}>
            <h2>Selected node</h2>
            {selected ? (
              <>
                <p>
                  <strong>{selected.label}</strong>
                </p>
                <Badge variant="accent">{selected.type.replace(/_/g, ' ')}</Badge>
                <p className={g.muted}>
                  Position {Math.round(selected.x)}, {Math.round(selected.y)}
                </p>
              </>
            ) : (
              <p className={g.muted}>Select a node to inspect.</p>
            )}
          </section>

          <section className={g.panel}>
            <h2>Validation</h2>
            {workflow.validationErrors.length === 0 ? (
              <p className={g.muted}>No validation errors.</p>
            ) : (
              <ul className={g.list}>
                {workflow.validationErrors.map((error) => (
                  <li key={error} className={g.listItem}>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={g.panel}>
            <h2>Version history</h2>
            <ul className={g.list}>
              {workflowVersions.map((version) => (
                <li key={version.id} className={g.listItem}>
                  <span>
                    <strong>
                      v{version.version} · {version.label}
                    </strong>
                    <br />
                    <span className={g.muted}>{version.snapshotName}</span>
                  </span>
                  <div className={g.toolbar}>
                    <Button size="sm" variant="secondary" onClick={() => rollbackWorkflow(version.id)}>
                      Rollback
                    </Button>
                    <time dateTime={version.createdAt}>{formatRelativeTime(version.createdAt)}</time>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </PageContainer>
  )
}
