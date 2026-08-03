import { Link } from 'react-router-dom'
import { useCommercial } from '../../hooks/useCommercial'
import { Badge } from '../ui/Badge/Badge'
import g from '../governance/governance.module.css'
import styles from '../../pages/commercial/commercial.module.css'

export function SeatUtilizationWidget() {
  const { subscription, seatUtilizationPct, licenseAlerts, upgradeRecommendations } = useCommercial()
  const warn = seatUtilizationPct >= 80

  return (
    <section className={g.panel} aria-label="Seat utilization">
      <header className={g.row}>
        <h2>Seat utilization</h2>
        <Badge variant={warn ? 'warning' : 'success'}>{seatUtilizationPct}%</Badge>
      </header>
      <p className={g.muted}>
        {subscription.seatsUsed} of {subscription.seatsIncluded} seats in use
      </p>
      <div className={styles.meterTrack} aria-hidden="true">
        <div
          className={warn ? styles.meterFillWarn : styles.meterFill}
          style={{ width: `${Math.min(100, seatUtilizationPct)}%` }}
        />
      </div>
      <ul className={g.list}>
        {licenseAlerts.slice(0, 2).map((alert) => (
          <li key={alert.id} className={g.listItem}>
            <span>
              <strong>{alert.title}</strong>
              <br />
              <span className={g.muted}>{alert.body}</span>
            </span>
            <Link className={styles.hubLink} to={alert.href}>
              Review
            </Link>
          </li>
        ))}
      </ul>
      <h3>Upgrade recommendations</h3>
      <ul className={g.list}>
        {upgradeRecommendations.map((item) => (
          <li key={item.id} className={g.listItem}>
            <span>
              <strong>{item.title}</strong>
              <br />
              <span className={g.muted}>{item.detail}</span>
            </span>
            <Link className={styles.hubLink} to={item.href}>
              View
            </Link>
          </li>
        ))}
      </ul>
      <Link className={styles.hubLink} to="/settings/licensing">
        Manage licensing
      </Link>
    </section>
  )
}
