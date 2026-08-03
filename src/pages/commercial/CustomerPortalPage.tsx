import { Building2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SeatUtilizationWidget } from '../../components/commercial/SeatUtilizationWidget'
import g from '../../components/governance/governance.module.css'
import { Badge } from '../../components/ui/Badge/Badge'
import { Button } from '../../components/ui/Button/Button'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { useCommercial } from '../../hooks/useCommercial'
import { CommercialHubNav } from './CommercialHubNav'
import styles from './commercial.module.css'

export function CustomerPortalPage() {
  const {
    customerOrg,
    contracts,
    successManager,
    supportTickets,
    productUpdates,
    trainingItems,
    toggleTrainingComplete,
    licenseSummary,
    deployments,
    healthScore,
    openRecommendations,
    customerTimeline,
    qbr,
    renewalReadiness,
    adoptionSummary,
  } = useCommercial()

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        title="Customer Portal"
        description="Organization profile, contracts, success manager, support, training, and renewal readiness."
        icon={<Building2 size={20} />}
      />

      <CommercialHubNav current="/customer" />

      <div className={g.metricGrid} aria-label="Customer health">
        <div className={g.metric}>
          <span>Health score</span>
          <strong>{healthScore.score}</strong>
          <span className={g.muted}>
            {healthScore.label} · {healthScore.trend}
          </span>
        </div>
        <div className={g.metric}>
          <span>Renewal readiness</span>
          <strong>{renewalReadiness.score}</strong>
          <span className={g.muted}>{renewalReadiness.status}</span>
        </div>
        <div className={g.metric}>
          <span>Adoption</span>
          <strong>{adoptionSummary.score}</strong>
          <span className={g.muted}>{adoptionSummary.activeUsers30d} active · 30d</span>
        </div>
        <div className={g.metric}>
          <span>Licenses</span>
          <strong>
            {licenseSummary.activeSeats}/{licenseSummary.activeSeats + licenseSummary.availableSeats}
          </strong>
          <span className={g.muted}>{licenseSummary.availableSeats} available</span>
        </div>
      </div>

      <div className={styles.split}>
        <div className={g.stack}>
          <section className={g.panel}>
            <h2>Organization profile</h2>
            <p>
              <strong>{customerOrg.name}</strong>
            </p>
            <p className={g.muted}>
              {customerOrg.industry} · {customerOrg.region} · {customerOrg.employees}
              <br />
              Primary: {customerOrg.primaryContact}
              <br />
              {customerOrg.website}
            </p>
          </section>

          <section className={g.panel}>
            <h2>Contracts</h2>
            <ul className={g.list}>
              {contracts.map((contract) => (
                <li key={contract.id} className={g.listItem}>
                  <span>
                    <strong>{contract.name}</strong>
                    <br />
                    <span className={g.muted}>
                      {contract.startsAt} → {contract.endsAt} · {contract.valueLabel}
                    </span>
                  </span>
                  <Badge variant={contract.status === 'active' ? 'success' : 'warning'}>{contract.status}</Badge>
                </li>
              ))}
            </ul>
          </section>

          <section className={g.panel}>
            <header className={g.row}>
              <h2>Success manager</h2>
              <Badge variant="accent">CSM</Badge>
            </header>
            <p>
              <strong>{successManager.name}</strong> — {successManager.title}
            </p>
            <p className={g.muted}>
              {successManager.email}
              <br />
              Next check-in {successManager.nextCheckIn}
            </p>
            <Button size="sm" variant="secondary" disabled>
              Message CSM (mock)
            </Button>
          </section>

          <section className={g.panel}>
            <h2>Support tickets</h2>
            <ul className={g.list}>
              {supportTickets.map((ticket) => (
                <li key={ticket.id} className={g.listItem}>
                  <span>
                    <strong>{ticket.subject}</strong>
                    <br />
                    <span className={g.muted}>
                      {ticket.priority} · updated {new Date(ticket.updatedAt).toLocaleDateString()}
                    </span>
                  </span>
                  <Badge
                    variant={
                      ticket.status === 'resolved' ? 'success' : ticket.status === 'open' ? 'warning' : 'neutral'
                    }
                  >
                    {ticket.status}
                  </Badge>
                </li>
              ))}
            </ul>
          </section>

          <section className={g.panel}>
            <h2>Product updates</h2>
            <ul className={g.list}>
              {productUpdates.map((update) => (
                <li key={update.id} className={g.listItem}>
                  <span>
                    <strong>{update.title}</strong>
                    <br />
                    <span className={g.muted}>{update.summary}</span>
                  </span>
                  <span className={g.muted}>{update.publishedAt}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className={g.panel}>
            <h2>Training</h2>
            <ul className={g.list}>
              {trainingItems.map((item) => (
                <li key={item.id} className={g.listItem}>
                  <label style={{ display: 'inline-flex', gap: 8, alignItems: 'center', flex: 1 }}>
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => toggleTrainingComplete(item.id)}
                    />
                    <span>
                      <strong>{item.title}</strong>
                      <br />
                      <span className={g.muted}>{item.durationLabel}</span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className={g.stack}>
          <SeatUtilizationWidget />
          <section className={g.panel}>
            <h2>License summary</h2>
            <p className={g.muted}>Modules: {licenseSummary.modules.join(', ')}</p>
            <p className={g.muted}>Environments: {licenseSummary.environments.join(', ')}</p>
            <Link className={styles.hubLink} to="/settings/licensing">
              Open licensing
            </Link>
          </section>
          <section className={g.panel}>
            <h2>Deployment status</h2>
            <ul className={g.list}>
              {deployments.map((item) => (
                <li key={item.environment} className={g.listItem}>
                  <span>
                    <strong>{item.environment}</strong>
                    <br />
                    <span className={g.muted}>
                      {item.version} · {item.region}
                    </span>
                  </span>
                  <Badge variant={item.healthy ? 'success' : 'error'}>
                    {item.healthy ? 'healthy' : 'degraded'}
                  </Badge>
                </li>
              ))}
            </ul>
          </section>
          <section className={g.panel}>
            <h2>Open recommendations</h2>
            <ul className={g.list}>
              {openRecommendations.map((item) => (
                <li key={item.id} className={g.listItem}>
                  <span>
                    <strong>{item.title}</strong>
                    <br />
                    <span className={g.muted}>{item.detail}</span>
                  </span>
                  <Link className={styles.hubLink} to={item.href}>
                    Go
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          <section className={g.panel}>
            <h2>Customer timeline</h2>
            <ul className={g.list}>
              {customerTimeline.map((event) => (
                <li key={event.id} className={g.listItem}>
                  <span>
                    <strong>{event.title}</strong>
                    <br />
                    <span className={g.muted}>{event.detail}</span>
                  </span>
                  <span className={g.muted}>{event.at}</span>
                </li>
              ))}
            </ul>
          </section>
          <section className={g.panel}>
            <h2>QBR · {qbr.quarter}</h2>
            <p className={g.muted}>{qbr.summary}</p>
            <p>
              <strong>Next focus:</strong> {qbr.nextFocus}
            </p>
            <Button size="sm" variant="secondary" disabled>
              Schedule QBR (mock)
            </Button>
          </section>
          <section className={g.panel}>
            <h2>Renewal readiness</h2>
            <p className={g.muted}>{renewalReadiness.status}</p>
            <ul className={g.muted} style={{ margin: 0, paddingLeft: 18 }}>
              {renewalReadiness.riskNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </section>
          <section className={g.panel}>
            <h2>Adoption summary</h2>
            <p className={g.muted}>
              Feature adoption {adoptionSummary.featureAdoptionPct}% · {adoptionSummary.notes}
            </p>
            <Link className={styles.hubLink} to="/customer-success">
              Customer Success Center
            </Link>
          </section>
        </aside>
      </div>
    </PageContainer>
  )
}
