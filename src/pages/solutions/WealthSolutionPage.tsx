import { useEffect } from 'react'
import { Landmark } from 'lucide-react'
import g from '../../components/governance/governance.module.css'
import { Badge } from '../../components/ui/Badge/Badge'
import { Button } from '../../components/ui/Button/Button'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { useSolutions } from '../../hooks/useSolutions'
import { SolutionsHubNav } from './SolutionsHubNav'
import styles from './solutions.module.css'

export function WealthSolutionPage() {
  const { wealth, selectedTemplateId, selectTemplate, setActiveSolutionId } = useSolutions()
  const selected = wealth.aiTemplates.find((item) => item.id === selectedTemplateId) ?? wealth.aiTemplates[0]

  useEffect(() => {
    setActiveSolutionId('wealth')
  }, [setActiveSolutionId])

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        title="Wealth Management Pack"
        description="Flagship Canadian wealth solution for investment dealers, portfolio managers, EMDs, and mutual fund dealers."
        icon={<Landmark size={20} />}
      />

      <SolutionsHubNav current="/solutions/wealth" />

      <div className={g.meta}>
        <span className={styles.industryBadge}>Wealth · Canada</span>
        {wealth.regulators.map((reg) => (
          <Badge key={reg} variant="neutral">
            {reg}
          </Badge>
        ))}
      </div>

      <p className={g.muted}>Target segments: {wealth.targets.join(' · ')}</p>

      <div className={g.metricGrid} aria-label="Wealth management metrics">
        {wealth.metrics.map((metric) => (
          <div key={metric.id} className={g.metric}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <span className={g.muted}>{metric.hint}</span>
          </div>
        ))}
      </div>

      <section className={g.panel}>
        <h2>Industry-specific dashboards</h2>
        <div className={g.grid}>
          {wealth.dashboards.map((panel) => (
            <article key={panel.id} className={g.card} style={{ cursor: 'default' }}>
              <h3>{panel.title}</h3>
              <p className={g.muted}>{panel.summary}</p>
              <ul className={g.list}>
                {panel.items.map((item) => (
                  <li key={item} className={g.listItem}>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <div className={styles.split}>
        <section className={g.panel}>
          <h2>Industry AI prompt library</h2>
          <div className={g.grid}>
            {wealth.aiTemplates.map((template) => (
              <button
                key={template.id}
                type="button"
                className={g.card}
                aria-pressed={selected?.id === template.id}
                onClick={() => selectTemplate(template.id)}
              >
                <div className={g.meta}>
                  <Badge variant="accent">{template.category}</Badge>
                </div>
                <h3>{template.title}</h3>
                <p className={g.muted}>{template.prompt}</p>
              </button>
            ))}
          </div>
          {selected && (
            <div className={g.toolbar}>
              <Button size="sm" variant="primary" disabled>
                Run in AI Workspace (mock)
              </Button>
              <span className={g.muted}>Selected: {selected.title}</span>
            </div>
          )}
        </section>

        <aside className={g.panel}>
          <h2>Solution templates & presets</h2>
          <ul className={g.list}>
            {wealth.presets.map((preset) => (
              <li key={preset.id} className={g.listItem}>
                <span>
                  <Badge variant="neutral">{preset.kind}</Badge> <strong>{preset.title}</strong>
                  <br />
                  <span className={g.muted}>{preset.detail}</span>
                </span>
              </li>
            ))}
          </ul>
          <h3>Policy · Report · Workflow presets</h3>
          <p className={g.muted}>
            Wealth presets seed Policy Workspace, Reporting Engine, and Automation Studio without redesigning those
            surfaces.
          </p>
        </aside>
      </div>
    </PageContainer>
  )
}
