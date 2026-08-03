import type { ImpactAssessment } from '../../../types/investigations'
import { Badge } from '../../ui/Badge/Badge'
import { RiskBadge } from '../../work/RiskBadge/RiskBadge'
import styles from './ImpactAssessmentCard.module.css'

interface ImpactAssessmentCardProps {
  impact: ImpactAssessment
}

export function ImpactAssessmentCard({ impact }: ImpactAssessmentCardProps) {
  return (
    <article className={styles.card} aria-label="Impact assessment">
      <header className={styles.header}>
        <h3 className={styles.title}>Impact assessment</h3>
        <div className={styles.badges}>
          <RiskBadge risk={impact.risk} />
          <Badge variant={impact.urgency === 'immediate' || impact.urgency === 'high' ? 'error' : 'warning'}>
            {impact.urgency} urgency
          </Badge>
          <Badge variant="accent">{Math.round(impact.confidence * 100)}% confidence</Badge>
        </div>
      </header>

      <dl className={styles.grid}>
        <div>
          <dt>Business impact</dt>
          <dd>{impact.businessImpact}</dd>
        </div>
        <div>
          <dt>Compliance impact</dt>
          <dd>{impact.complianceImpact}</dd>
        </div>
        <div>
          <dt>Operational impact</dt>
          <dd>{impact.operationalImpact}</dd>
        </div>
        <div>
          <dt>Affected departments</dt>
          <dd>{impact.affectedDepartments.join(', ')}</dd>
        </div>
      </dl>
    </article>
  )
}
