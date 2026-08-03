import { KeyRound } from 'lucide-react'
import { useState } from 'react'
import { SeatUtilizationWidget } from '../../components/commercial/SeatUtilizationWidget'
import g from '../../components/governance/governance.module.css'
import { Badge } from '../../components/ui/Badge/Badge'
import { Button } from '../../components/ui/Button/Button'
import { Input } from '../../components/ui/Input/Input'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { Select } from '../../components/ui/Select/Select'
import { useCommercial } from '../../hooks/useCommercial'
import { CommercialHubNav } from './CommercialHubNav'
import styles from './commercial.module.css'

export function LicensingPage() {
  const {
    seats,
    featureEntitlements,
    moduleLicenses,
    environmentLicenses,
    trialLicenses,
    assignSeat,
    revokeSeat,
    transferSeat,
    bulkAssignSeats,
    inviteUser,
    licenseAlerts,
    subscription,
  } = useCommercial()

  const [assignName, setAssignName] = useState('')
  const [assignEmail, setAssignEmail] = useState('')
  const [assignSeatId, setAssignSeatId] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteLicense, setInviteLicense] = useState('Full')
  const [transferFrom, setTransferFrom] = useState('')
  const [transferTo, setTransferTo] = useState('')
  const [bulkText, setBulkText] = useState('Alex Kim, alex.kim@northwind.example')

  const availableSeats = seats.filter((seat) => seat.status === 'available')
  const assignedSeats = seats.filter((seat) => seat.status === 'assigned')

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        title="Enterprise Licensing"
        description="Seat allocation, entitlements, modules, environments, trials, and renewal reminders."
        icon={<KeyRound size={20} />}
      />

      <CommercialHubNav current="/settings/licensing" />

      <div className={g.metricGrid} aria-label="License overview">
        <div className={g.metric}>
          <span>Active licenses</span>
          <strong>{assignedSeats.length}</strong>
          <span className={g.muted}>{subscription.planLabel}</span>
        </div>
        <div className={g.metric}>
          <span>Available seats</span>
          <strong>{availableSeats.length}</strong>
          <span className={g.muted}>Ready to assign</span>
        </div>
        <div className={g.metric}>
          <span>Modules</span>
          <strong>{moduleLicenses.filter((item) => item.status === 'active').length}</strong>
          <span className={g.muted}>Active modules</span>
        </div>
        <div className={g.metric}>
          <span>Trial licenses</span>
          <strong>{trialLicenses.length}</strong>
          <span className={g.muted}>Expiring soon</span>
        </div>
      </div>

      <div className={styles.split}>
        <div className={g.stack}>
          <section className={g.panel}>
            <header className={g.row}>
              <h2>Seat allocation</h2>
              <Badge variant="neutral">{seats.length} seats</Badge>
            </header>
            <ul className={g.list}>
              {seats.map((seat) => (
                <li key={seat.id} className={g.listItem}>
                  <span>
                    <strong>{seat.userName ?? seat.email ?? 'Unassigned seat'}</strong>
                    <br />
                    <span className={g.muted}>
                      {seat.licenseType}
                      {seat.assignedAt ? ` · since ${seat.assignedAt}` : ''}
                      {seat.email && seat.userName ? ` · ${seat.email}` : ''}
                    </span>
                  </span>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Badge
                      variant={
                        seat.status === 'assigned'
                          ? 'success'
                          : seat.status === 'invited'
                            ? 'accent'
                            : 'neutral'
                      }
                    >
                      {seat.status}
                    </Badge>
                    {(seat.status === 'assigned' || seat.status === 'invited') && (
                      <Button size="sm" variant="ghost" onClick={() => revokeSeat(seat.id)}>
                        Revoke
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className={g.panel}>
            <h2>Assign / invite</h2>
            <div className={styles.formRow}>
              <Select
                aria-label="Available seat"
                value={assignSeatId}
                onChange={(event) => setAssignSeatId(event.target.value)}
              >
                <option value="">Select available seat</option>
                {availableSeats.map((seat) => (
                  <option key={seat.id} value={seat.id}>
                    {seat.id} · {seat.licenseType}
                  </option>
                ))}
              </Select>
              <Input
                aria-label="Assignee name"
                placeholder="Full name"
                value={assignName}
                onChange={(event) => setAssignName(event.target.value)}
              />
              <Input
                aria-label="Assignee email"
                placeholder="Email"
                value={assignEmail}
                onChange={(event) => setAssignEmail(event.target.value)}
              />
              <Button
                size="sm"
                onClick={() => {
                  if (!assignSeatId || !assignName.trim() || !assignEmail.trim()) return
                  assignSeat(assignSeatId, assignName, assignEmail)
                  setAssignSeatId('')
                  setAssignName('')
                  setAssignEmail('')
                }}
              >
                Assign seat
              </Button>
            </div>
            <div className={styles.formRow} style={{ marginTop: 12 }}>
              <Input
                aria-label="Invite email"
                placeholder="Invite user email"
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
              />
              <Select
                aria-label="Invite license type"
                value={inviteLicense}
                onChange={(event) => setInviteLicense(event.target.value)}
              >
                <option value="Full">Full</option>
                <option value="Auditor">Auditor</option>
                <option value="Read-only">Read-only</option>
              </Select>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  if (!inviteEmail.trim()) return
                  inviteUser(inviteEmail, inviteLicense)
                  setInviteEmail('')
                }}
              >
                Invite user (mock)
              </Button>
            </div>
          </section>

          <section className={g.panel}>
            <h2>Transfer seat</h2>
            <div className={styles.formRow}>
              <Select
                aria-label="Transfer from seat"
                value={transferFrom}
                onChange={(event) => setTransferFrom(event.target.value)}
              >
                <option value="">From assigned</option>
                {assignedSeats.map((seat) => (
                  <option key={seat.id} value={seat.id}>
                    {seat.userName}
                  </option>
                ))}
              </Select>
              <Select
                aria-label="Transfer to seat"
                value={transferTo}
                onChange={(event) => setTransferTo(event.target.value)}
              >
                <option value="">To available</option>
                {availableSeats.map((seat) => (
                  <option key={seat.id} value={seat.id}>
                    {seat.id}
                  </option>
                ))}
              </Select>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  if (!transferFrom || !transferTo) return
                  transferSeat(transferFrom, transferTo)
                  setTransferFrom('')
                  setTransferTo('')
                }}
              >
                Transfer
              </Button>
            </div>
          </section>

          <section className={g.panel}>
            <h2>Bulk assignment</h2>
            <p className={g.muted}>One line: Name, email — assigns to the next available seats.</p>
            <Input
              aria-label="Bulk assignment lines"
              value={bulkText}
              onChange={(event) => setBulkText(event.target.value)}
            />
            <div style={{ marginTop: 12 }}>
              <Button
                size="sm"
                onClick={() => {
                  const lines = bulkText
                    .split(';')
                    .map((line) => line.trim())
                    .filter(Boolean)
                  const targets = availableSeats.slice(0, lines.length)
                  const assignments = lines
                    .map((line, index) => {
                      const [userName = '', email = ''] = line.split(',').map((part) => part.trim())
                      const seat = targets[index]
                      if (!seat || !userName || !email) return null
                      return { seatId: seat.id, userName, email }
                    })
                    .filter((item): item is { seatId: string; userName: string; email: string } => Boolean(item))
                  if (assignments.length) bulkAssignSeats(assignments)
                }}
              >
                Bulk assign (mock)
              </Button>
            </div>
          </section>
        </div>

        <aside className={g.stack}>
          <SeatUtilizationWidget />
          <section className={g.panel}>
            <h2>Feature entitlements</h2>
            <ul className={g.list}>
              {featureEntitlements.map((item) => (
                <li key={item.id} className={g.listItem}>
                  <span>
                    <strong>{item.feature}</strong>
                    <br />
                    <span className={g.muted}>Min plan {item.planMin.replace('_', ' ')}</span>
                  </span>
                  <Badge variant={item.included ? 'success' : 'warning'}>
                    {item.included ? 'included' : 'upgrade'}
                  </Badge>
                </li>
              ))}
            </ul>
          </section>
          <section className={g.panel}>
            <h2>Modules</h2>
            <ul className={g.list}>
              {moduleLicenses.map((item) => (
                <li key={item.id} className={g.listItem}>
                  <span>
                    <strong>{item.name}</strong>
                    <br />
                    <span className={g.muted}>{item.expiresAt ? `Expires ${item.expiresAt}` : 'No expiry'}</span>
                  </span>
                  <Badge
                    variant={
                      item.status === 'active' ? 'success' : item.status === 'trial' ? 'accent' : 'error'
                    }
                  >
                    {item.status}
                  </Badge>
                </li>
              ))}
            </ul>
          </section>
          <section className={g.panel}>
            <h2>Environment licenses</h2>
            <ul className={g.list}>
              {environmentLicenses.map((item) => (
                <li key={item.id} className={g.listItem}>
                  <span>
                    <strong>{item.environment}</strong>
                    <br />
                    <span className={g.muted}>
                      {item.seats} seats · {item.region}
                    </span>
                  </span>
                  <Badge variant={item.status === 'active' ? 'success' : 'neutral'}>{item.status}</Badge>
                </li>
              ))}
            </ul>
          </section>
          <section className={g.panel}>
            <h2>Trial licenses & renewal</h2>
            <ul className={g.list}>
              {trialLicenses.map((item) => (
                <li key={item.id} className={g.listItem}>
                  <span>
                    <strong>{item.name}</strong>
                    <br />
                    <span className={g.muted}>Expires {item.expiresAt}</span>
                  </span>
                  <Badge variant="warning">{item.daysLeft}d left</Badge>
                </li>
              ))}
            </ul>
            <h3>Renewal reminders</h3>
            <ul className={g.list}>
              {licenseAlerts.map((alert) => (
                <li key={alert.id} className={g.listItem}>
                  <span>
                    <strong>{alert.title}</strong>
                    <br />
                    <span className={g.muted}>{alert.body}</span>
                  </span>
                  <Badge variant={alert.severity === 'warning' ? 'warning' : 'neutral'}>{alert.severity}</Badge>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </PageContainer>
  )
}
