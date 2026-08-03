import { CreditCard } from 'lucide-react'
import { SeatUtilizationWidget } from '../../components/commercial/SeatUtilizationWidget'
import g from '../../components/governance/governance.module.css'
import { Badge } from '../../components/ui/Badge/Badge'
import { Button } from '../../components/ui/Button/Button'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { useCommercial } from '../../hooks/useCommercial'
import type { PlanTier } from '../../types/commercial'
import { CommercialHubNav } from './CommercialHubNav'
import styles from './commercial.module.css'

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100)
}

export function BillingPage() {
  const {
    subscription,
    usageMeters,
    planOptions,
    paymentMethods,
    billingContacts,
    taxInfo,
    invoices,
    costBreakdown,
    changePlan,
    setDefaultPaymentMethod,
    downloadInvoice,
    lastDownloadedInvoice,
    planFeatureFlags,
  } = useCommercial()

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        title="Billing & Subscription Center"
        description="Current plan, usage meters, payment methods, invoices, and plan comparison."
        icon={<CreditCard size={20} />}
      />

      <CommercialHubNav current="/settings/billing" />

      <div className={g.metricGrid} aria-label="Subscription summary">
        <div className={g.metric}>
          <span>Current plan</span>
          <strong>{subscription.planLabel}</strong>
          <span className={g.muted}>{subscription.billingCycle} · {subscription.status}</span>
        </div>
        <div className={g.metric}>
          <span>Trial status</span>
          <strong>{subscription.status === 'trial' ? 'Active trial' : 'Paid'}</strong>
          <span className={g.muted}>
            {subscription.trialEndsAt
              ? `Ends ${new Date(subscription.trialEndsAt).toLocaleDateString()}`
              : 'No trial'}
          </span>
        </div>
        <div className={g.metric}>
          <span>Renewal date</span>
          <strong>{new Date(subscription.renewsAt).toLocaleDateString()}</strong>
          <span className={g.muted}>{formatMoney(subscription.amountCents, subscription.currency)} / yr</span>
        </div>
        <div className={g.metric}>
          <span>Seats</span>
          <strong>
            {subscription.seatsUsed}/{subscription.seatsIncluded}
          </strong>
          <span className={g.muted}>Assigned + invited</span>
        </div>
      </div>

      <section className={g.panel}>
        <h2>Usage meters</h2>
        <div className={g.grid}>
          {usageMeters.map((meter) => {
            const pct = Math.round((meter.used / Math.max(meter.limit, 1)) * 100)
            const warn = pct >= meter.warnAtPct
            return (
              <div key={meter.id} className={g.card} style={{ cursor: 'default' }}>
                <header className={g.row}>
                  <h3>{meter.label}</h3>
                  <Badge variant={warn ? 'warning' : 'neutral'}>{pct}%</Badge>
                </header>
                <p className={g.muted}>
                  {meter.used.toLocaleString()} / {meter.limit.toLocaleString()} {meter.unit}
                </p>
                <div className={styles.meterTrack} aria-hidden="true">
                  <div
                    className={warn ? styles.meterFillWarn : styles.meterFill}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className={g.panel}>
        <header className={g.row}>
          <h2>Plan comparison</h2>
          <Badge variant="accent">Upgrade / downgrade (mock)</Badge>
        </header>
        <div className={styles.planGrid}>
          {planOptions.map((plan) => {
            const active = plan.id === subscription.plan
            return (
              <article key={plan.id} className={active ? styles.planCardActive : styles.planCard}>
                <header className={g.row}>
                  <h3>{plan.name}</h3>
                  {plan.recommended && <Badge variant="accent">Recommended</Badge>}
                  {active && <Badge variant="success">Current</Badge>}
                </header>
                <p>
                  <strong>{plan.priceLabel}</strong>
                  <br />
                  <span className={g.muted}>{plan.seats}</span>
                </p>
                <ul className={g.muted} style={{ margin: 0, paddingLeft: 18 }}>
                  {plan.highlights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <Button
                  size="sm"
                  variant={active ? 'secondary' : 'primary'}
                  disabled={active}
                  onClick={() => changePlan(plan.id as PlanTier)}
                >
                  {active ? 'Selected' : plan.id === 'starter' ? 'Downgrade (mock)' : 'Upgrade (mock)'}
                </Button>
              </article>
            )
          })}
        </div>
      </section>

      <div className={styles.split}>
        <div className={g.stack}>
          <section className={g.panel}>
            <h2>Payment methods</h2>
            <ul className={g.list}>
              {paymentMethods.map((method) => (
                <li key={method.id} className={g.listItem}>
                  <span>
                    <strong>
                      {method.brand} ···· {method.last4}
                    </strong>
                    <br />
                    <span className={g.muted}>
                      Exp {method.expMonth}/{method.expYear}
                    </span>
                  </span>
                  {method.isDefault ? (
                    <Badge variant="success">Default</Badge>
                  ) : (
                    <Button size="sm" variant="secondary" onClick={() => setDefaultPaymentMethod(method.id)}>
                      Make default
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section className={g.panel}>
            <h2>Billing contacts</h2>
            <ul className={g.list}>
              {billingContacts.map((contact) => (
                <li key={contact.id} className={g.listItem}>
                  <span>
                    <strong>{contact.name}</strong>
                    <br />
                    <span className={g.muted}>
                      {contact.email} · {contact.role}
                    </span>
                  </span>
                  {contact.primary && <Badge variant="accent">Primary</Badge>}
                </li>
              ))}
            </ul>
          </section>

          <section className={g.panel}>
            <h2>Tax information</h2>
            <p>
              <strong>{taxInfo.companyLegalName}</strong>
            </p>
            <p className={g.muted}>
              Tax ID {taxInfo.taxId}
              <br />
              {taxInfo.address}
              <br />
              {taxInfo.country} · {taxInfo.vatExempt ? 'VAT exempt' : 'Taxable'}
            </p>
          </section>
        </div>

        <aside className={g.stack}>
          <SeatUtilizationWidget />
          <section className={g.panel}>
            <h2>Cost breakdown</h2>
            <ul className={g.list}>
              {costBreakdown.map((item) => (
                <li key={item.id} className={g.listItem}>
                  <span>
                    <strong>{item.category}</strong>
                    <br />
                    <span className={g.muted}>{item.pct}% of period</span>
                  </span>
                  <span>{formatMoney(item.amountCents, subscription.currency)}</span>
                </li>
              ))}
            </ul>
          </section>
          <section className={g.panel}>
            <h2>Plan-aware feature flags</h2>
            <ul className={g.list}>
              {planFeatureFlags.map((flag) => (
                <li key={flag.id} className={g.listItem}>
                  <span>
                    <strong>{flag.label}</strong>
                    <br />
                    <span className={g.muted}>Requires {flag.requiredPlan.replace('_', ' ')}</span>
                  </span>
                  <Badge variant={flag.enabled ? 'success' : 'neutral'}>
                    {flag.enabled ? 'on' : 'off'}
                  </Badge>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>

      <section className={g.panel}>
        <header className={g.row}>
          <h2>Invoice history</h2>
          {lastDownloadedInvoice && (
            <Badge variant="accent">Downloaded {lastDownloadedInvoice}</Badge>
          )}
        </header>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Issued</th>
                <th>Due</th>
                <th>Amount</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td>{invoice.number}</td>
                  <td>{invoice.issuedAt}</td>
                  <td>{invoice.dueAt}</td>
                  <td>{formatMoney(invoice.amountCents, subscription.currency)}</td>
                  <td>
                    <Badge
                      variant={
                        invoice.status === 'paid' ? 'success' : invoice.status === 'open' ? 'warning' : 'neutral'
                      }
                    >
                      {invoice.status}
                    </Badge>
                  </td>
                  <td>
                    <Button size="sm" variant="secondary" onClick={() => downloadInvoice(invoice.id)}>
                      Download
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </PageContainer>
  )
}
