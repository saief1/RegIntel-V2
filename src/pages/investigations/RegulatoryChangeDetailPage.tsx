import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Scale } from 'lucide-react'
import { ImpactAssessmentCard } from '../../components/investigations/ImpactAssessmentCard/ImpactAssessmentCard'
import { RegulatoryChangeStatusBadge } from '../../components/investigations/InvestigationStatusBadge/InvestigationStatusBadge'
import { EmptyState } from '../../components/ui/EmptyState/EmptyState'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { SectionHeader } from '../../components/ui/SectionHeader/SectionHeader'
import { useGovernance } from '../../hooks/useGovernance'
import { useInvestigations } from '../../hooks/useInvestigations'
import { useWork } from '../../hooks/useWork'
import { formatDate } from '../../utils/date'
import styles from './RegulatoryChangeDetailPage.module.css'

export function RegulatoryChangeDetailPage() {
  const { changeId = '' } = useParams()
  const navigate = useNavigate()
  const { getChange, getUser, getInvestigation } = useInvestigations()
  const { getImpact } = useGovernance()
  const { getUser: getWorkUser } = useWork()
  const change = getChange(changeId)
  const impact =
    change &&
    (getImpact(change.updatedRegulationId) ||
      getImpact(change.originalRegulationId) ||
      getImpact('d-02') ||
      getImpact('d-01'))

  if (!change) {
    return (
      <PageContainer>
        <EmptyState
          icon={<Scale size={20} />}
          title="Regulatory change not found"
          description="This change ID is not in the local workspace."
          action={
            <button type="button" className={styles.back} onClick={() => navigate('/regulatory-changes')}>
              Back to regulatory changes
            </button>
          }
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className={styles.page}>
        <button type="button" className={styles.back} onClick={() => navigate('/regulatory-changes')}>
          <ArrowLeft size={14} aria-hidden="true" />
          Back to regulatory changes
        </button>

        <PageHeader
          icon={<Scale size={20} />}
          title={change.title}
          description={`${change.jurisdiction} · ${change.category} · Effective ${formatDate(change.effectiveDate)}`}
          actions={<RegulatoryChangeStatusBadge status={change.status} />}
        />

        <section className={styles.panel}>
          <SectionHeader title="Summary" as="h2" />
          <p className={styles.copy}>{change.summary}</p>
          <p className={styles.meta}>Assigned reviewer: {getUser(change.reviewerId)?.name ?? 'Unassigned'}</p>
        </section>

        <div className={styles.twoCol}>
          <section className={styles.panel}>
            <SectionHeader title="Original regulation" as="h2" />
            <Link to={`/knowledge/library/${change.originalRegulationId}`}>{change.originalRegulationTitle}</Link>
          </section>
          <section className={styles.panel}>
            <SectionHeader title="Updated regulation" as="h2" />
            <Link to={`/knowledge/library/${change.updatedRegulationId}`}>{change.updatedRegulationTitle}</Link>
          </section>
        </div>

        <ImpactAssessmentCard impact={change.impact} />

        {impact && (
          <section className={styles.panel}>
            <SectionHeader title="AI Impact Analysis" as="h2" />
            <ul className={styles.list}>
              <li>Affected policies: {impact.affectedPolicies.join(', ')}</li>
              <li>Affected procedures: {impact.affectedProcedures.join(', ')}</li>
              <li>Affected controls: {impact.affectedControls.join(', ')}</li>
              <li>Affected vendors: {impact.affectedVendors.join(', ')}</li>
              <li>Affected tasks: {impact.affectedTasks.join(', ')}</li>
              <li>
                Estimated work: {impact.estimatedWorkItems} items · {impact.estimatedHours} hours
              </li>
              <li>
                Recommended owners:{' '}
                {impact.recommendedOwnerIds.map((id) => getWorkUser(id)?.name ?? id).join(', ')}
              </li>
            </ul>
          </section>
        )}

        <section className={styles.panel}>
          <SectionHeader title="Affected policies" as="h2" />
          <ul className={styles.list}>
            {change.affectedPolicyTitles.map((title) => (
              <li key={title}>
                <Link to="/knowledge/policies">{title}</Link>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.panel}>
          <SectionHeader title="Affected investigations" as="h2" />
          <ul className={styles.list}>
            {change.affectedInvestigationIds.map((id) => {
              const investigation = getInvestigation(id)
              return (
                <li key={id}>
                  <Link to={`/investigations/${id}`}>
                    {investigation ? `${investigation.caseId} · ${investigation.title}` : id}
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>

        <section className={styles.panel}>
          <SectionHeader title="Recommended actions" as="h2" />
          <ol className={styles.list}>
            {change.recommendedActions.map((action) => (
              <li key={action}>{action}</li>
            ))}
          </ol>
        </section>

        <section className={styles.panel}>
          <SectionHeader title="AI summary" as="h2" />
          <p className={styles.copy}>{change.aiSummary}</p>
        </section>

        <section className={styles.panel}>
          <SectionHeader title="Supporting references" as="h2" />
          <ul className={styles.list}>
            {change.supportingReferenceIds.map((id, index) => (
              <li key={id}>
                <Link to={`/knowledge/library/${id}`}>{change.supportingReferenceTitles[index] ?? id}</Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </PageContainer>
  )
}
