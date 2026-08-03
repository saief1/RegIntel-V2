import { Handshake } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import g from '../../components/governance/governance.module.css'
import { Badge } from '../../components/ui/Badge/Badge'
import { Button } from '../../components/ui/Button/Button'
import { Input } from '../../components/ui/Input/Input'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { Select } from '../../components/ui/Select/Select'
import { useCommercial } from '../../hooks/useCommercial'
import type { PartnerType } from '../../types/commercial'
import { CommercialHubNav } from './CommercialHubNav'
import styles from './commercial.module.css'

const TYPE_LABELS: Record<PartnerType | 'all', string> = {
  all: 'All types',
  consulting: 'Consulting',
  implementation: 'Implementation',
  technology: 'Technology',
  marketplace: 'Marketplace',
}

export function PartnersPage() {
  const {
    partners,
    partnerFilter,
    setPartnerFilter,
    certifications,
    referrals,
    registeredDeals,
    partnerRevenue,
    marketingResources,
    partnerTraining,
    registerDeal,
  } = useCommercial()

  const [account, setAccount] = useState('')
  const [amount, setAmount] = useState('')

  const filtered =
    partnerFilter === 'all' ? partners : partners.filter((partner) => partner.type === partnerFilter)

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        title="Partner Portal"
        description="Consulting, implementation, technology, and marketplace partners — certifications, deals, and enablement."
        icon={<Handshake size={20} />}
      />

      <CommercialHubNav current="/partners" />

      <div className={g.metricGrid} aria-label="Partner revenue dashboard">
        {partnerRevenue.map((metric) => (
          <div key={metric.id} className={g.metric}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <span className={g.muted}>{metric.hint}</span>
          </div>
        ))}
      </div>

      <section className={g.panel}>
        <header className={g.row}>
          <h2>Partner directory</h2>
          <Select
            aria-label="Filter partner type"
            value={partnerFilter}
            onChange={(event) => setPartnerFilter(event.target.value as PartnerType | 'all')}
            style={{ maxWidth: 220 }}
          >
            {(Object.keys(TYPE_LABELS) as Array<PartnerType | 'all'>).map((key) => (
              <option key={key} value={key}>
                {TYPE_LABELS[key]}
              </option>
            ))}
          </Select>
        </header>
        <div className={g.grid}>
          {filtered.map((partner) => (
            <article key={partner.id} className={g.card} style={{ cursor: 'default' }}>
              <header className={g.row}>
                <h3>{partner.name}</h3>
                <Badge variant={partner.certified ? 'success' : 'neutral'}>
                  {partner.certified ? 'Certified' : 'Pending'}
                </Badge>
              </header>
              <p className={g.meta}>
                <span>{TYPE_LABELS[partner.type]}</span>
                <span>{partner.region}</span>
                <span>{partner.tier}</span>
              </p>
              <p className={g.muted}>{partner.description}</p>
            </article>
          ))}
        </div>
      </section>

      <div className={styles.split}>
        <div className={g.stack}>
          <section className={g.panel}>
            <h2>Certifications</h2>
            <ul className={g.list}>
              {certifications.map((cert) => (
                <li key={cert.id} className={g.listItem}>
                  <span>
                    <strong>{cert.name}</strong>
                    <br />
                    <span className={g.muted}>
                      {cert.level} · earned {cert.earnedAt}
                    </span>
                  </span>
                  <Badge variant="accent">Exp {cert.expiresAt}</Badge>
                </li>
              ))}
            </ul>
          </section>

          <section className={g.panel}>
            <h2>Referrals</h2>
            <ul className={g.list}>
              {referrals.map((referral) => (
                <li key={referral.id} className={g.listItem}>
                  <span>
                    <strong>{referral.company}</strong>
                    <br />
                    <span className={g.muted}>
                      {referral.valueLabel} · {referral.submittedAt}
                    </span>
                  </span>
                  <Badge
                    variant={
                      referral.status === 'won'
                        ? 'success'
                        : referral.status === 'qualified'
                          ? 'accent'
                          : 'neutral'
                    }
                  >
                    {referral.status}
                  </Badge>
                </li>
              ))}
            </ul>
          </section>

          <section className={g.panel}>
            <h2>Registered deals</h2>
            <div className={styles.formRow}>
              <Input
                aria-label="Deal account"
                placeholder="Account name"
                value={account}
                onChange={(event) => setAccount(event.target.value)}
              />
              <Input
                aria-label="Deal amount"
                placeholder="Amount e.g. $30,000"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
              <Button
                size="sm"
                onClick={() => {
                  if (!account.trim()) return
                  registerDeal(account, amount)
                  setAccount('')
                  setAmount('')
                }}
              >
                Register deal (mock)
              </Button>
            </div>
            <ul className={g.list} style={{ marginTop: 12 }}>
              {registeredDeals.map((deal) => (
                <li key={deal.id} className={g.listItem}>
                  <span>
                    <strong>{deal.account}</strong>
                    <br />
                    <span className={g.muted}>
                      {deal.stage} · {deal.owner} · {deal.registeredAt}
                    </span>
                  </span>
                  <span>{deal.amountLabel}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className={g.stack}>
          <section className={g.panel}>
            <h2>Marketing resources</h2>
            <ul className={g.list}>
              {marketingResources.map((resource) => (
                <li key={resource.id} className={g.listItem}>
                  <span>
                    <strong>{resource.title}</strong>
                    <br />
                    <span className={g.muted}>{resource.kind}</span>
                  </span>
                  <Link className={styles.hubLink} to={resource.href}>
                    Open
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          <section className={g.panel}>
            <h2>Partner training</h2>
            <ul className={g.list}>
              {partnerTraining.map((item) => (
                <li key={item.id} className={g.listItem}>
                  <span>
                    <strong>{item.title}</strong>
                    <br />
                    <span className={g.muted}>{item.hours} hours</span>
                  </span>
                  <Badge
                    variant={
                      item.status === 'completed'
                        ? 'success'
                        : item.status === 'in_progress'
                          ? 'accent'
                          : 'neutral'
                    }
                  >
                    {item.status.replace('_', ' ')}
                  </Badge>
                </li>
              ))}
            </ul>
          </section>
          <section className={g.panel}>
            <h2>Enablement links</h2>
            <div className={styles.hubLinks}>
              <Link className={styles.hubLink} to="/help">
                Learning Center
              </Link>
              <Link className={styles.hubLink} to="/solutions">
                Solution packs
              </Link>
              <Link className={styles.hubLink} to="/settings/billing">
                Billing
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </PageContainer>
  )
}
