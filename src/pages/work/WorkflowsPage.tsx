import { useMemo, useState } from 'react'
import { GitBranch } from 'lucide-react'
import g from '../../components/governance/governance.module.css'
import { Button } from '../../components/ui/Button/Button'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { useGovernance } from '../../hooks/useGovernance'
import type { WorkflowNode } from '../../types/governance'
import styles from './WorkflowsPage.module.css'

export function WorkflowsPage() {
  const { workflows, templates, createWorkflowFromTemplate, updateWorkflowNodes, can } = useGovernance()
  const [activeId, setActiveId] = useState(workflows[0]?.id ?? '')
  const [dragId, setDragId] = useState<string | null>(null)

  const active = useMemo(
    () => workflows.find((item) => item.id === activeId) ?? workflows[0],
    [activeId, workflows],
  )

  function moveNode(targetId: string) {
    if (!active || !dragId || dragId === targetId || !can('manage')) return
    const nodes = [...active.nodes].sort((a, b) => a.order - b.order)
    const from = nodes.findIndex((node) => node.id === dragId)
    const to = nodes.findIndex((node) => node.id === targetId)
    if (from < 0 || to < 0) return
    const [moved] = nodes.splice(from, 1)
    nodes.splice(to, 0, moved)
    updateWorkflowNodes(active.id, nodes.map((node, index) => ({ ...node, order: index })))
    setDragId(null)
  }

  function addNode(type: WorkflowNode['type']) {
    if (!active || !can('manage')) return
    const label = type.replace(/_/g, ' ')
    updateWorkflowNodes(active.id, [
      ...active.nodes,
      { id: `tmp-${Date.now()}`, type, label: label.replace(/\b\w/g, (c) => c.toUpperCase()), order: active.nodes.length },
    ])
  }

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        title="Workflow Builder"
        description="Visual compliance workflows with reusable enterprise templates."
        icon={<GitBranch size={20} />}
      />

      <section className={g.panel}>
        <h2>Templates</h2>
        <div className={g.grid}>
          {templates.map((template) => (
            <article key={template.id} className={g.card} style={{ cursor: 'default' }}>
              <h3>{template.name}</h3>
              <p className={g.muted}>{template.description}</p>
              <Button
                size="sm"
                variant="secondary"
                disabled={!can('manage')}
                onClick={() => {
                  const created = createWorkflowFromTemplate(template.id)
                  setActiveId(created.id)
                }}
              >
                Use template
              </Button>
            </article>
          ))}
        </div>
      </section>

      <div className={styles.split}>
        <section className={g.panel}>
          <h2>Active workflows</h2>
          <ul className={g.list}>
            {workflows.map((workflow) => (
              <li key={workflow.id}>
                <button type="button" onClick={() => setActiveId(workflow.id)}>
                  <span>{workflow.name}</span>
                  <span>{workflow.nodes.length} nodes</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        {active && (
          <section className={g.panel}>
            <header className={g.row}>
              <div>
                <h2>{active.name}</h2>
                <p className={g.muted}>{active.description}</p>
              </div>
              <div className={g.toolbar}>
                <Button size="sm" variant="ghost" onClick={() => addNode('notify')}>
                  + Notify
                </Button>
                <Button size="sm" variant="ghost" onClick={() => addNode('checklist')}>
                  + Checklist
                </Button>
              </div>
            </header>
            <div className={g.flow} aria-label="Workflow nodes">
              {[...active.nodes]
                .sort((a, b) => a.order - b.order)
                .map((node, index) => (
                  <div key={node.id} className={styles.nodeWrap}>
                    {index > 0 && <span className={g.arrow}>↓</span>}
                    <div
                      className={dragId === node.id ? `${g.node} ${g.nodeActive}` : g.node}
                      draggable={can('manage')}
                      onDragStart={() => setDragId(node.id)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => moveNode(node.id)}
                    >
                      {node.label}
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}
      </div>
    </PageContainer>
  )
}
