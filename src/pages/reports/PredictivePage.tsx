import { useMemo, useState } from 'react'
import { Sparkles } from 'lucide-react'
import g from '../../components/governance/governance.module.css'
import { Badge } from '../../components/ui/Badge/Badge'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { Select } from '../../components/ui/Select/Select'
import { useAnalytics } from '../../hooks/useAnalytics'
import type { PredictionItem } from '../../types/analytics'
import { confidenceVariant } from '../agents/agentBadges'
import styles from './analytics.module.css'
import { ReportsHubNav } from './ReportsHubNav'

export function PredictivePage() {
  const { predictions } = useAnalytics()
  const [category, setCategory] = useState<'all' | PredictionItem['category']>('all')

  const filtered = useMemo(
    () => predictions.filter((item) => category === 'all' || item.category === category),
    [category, predictions],
  )

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        title="Predictive Compliance"
        description="AI forecasting for workload, audit findings, risk concentration, and resource needs."
        icon={<Sparkles size={20} />}
      />

      <ReportsHubNav current="/reports/predictive" />

      <div className={g.toolbar}>
        <Select
          aria-label="Filter predictions"
          value={category}
          onChange={(e) => setCategory(e.target.value as 'all' | PredictionItem['category'])}
        >
          <option value="all">All forecasts</option>
          {(
            [
              'workload',
              'audit',
              'department_risk',
              'resources',
              'deadlines',
              'policy_review',
              'agent_workload',
            ] as const
          ).map((item) => (
            <option key={item} value={item}>
              {item.replace(/_/g, ' ')}
            </option>
          ))}
        </Select>
      </div>

      <div className={g.grid}>
        {filtered.map((item) => (
          <article key={item.id} className={g.card} style={{ cursor: 'default' }}>
            <div className={g.meta}>
              <Badge variant="neutral">{item.category.replace(/_/g, ' ')}</Badge>
              <Badge variant={confidenceVariant(item.confidence)}>{item.confidence}% confidence</Badge>
              <span className={g.muted}>{item.horizon}</span>
            </div>
            <h3>{item.title}</h3>
            <p className={g.muted}>{item.forecast}</p>
            <div className={styles.field}>
              <h4>Reasoning</h4>
              <p className={g.muted}>{item.reasoning}</p>
              <h4>Suggested mitigation</h4>
              <p className={g.muted}>{item.mitigation}</p>
            </div>
          </article>
        ))}
      </div>
    </PageContainer>
  )
}
