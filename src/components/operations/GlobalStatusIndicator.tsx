import { useProdOps } from '../../hooks/useProdOps'
import { Badge } from '../ui/Badge/Badge'
import { Button } from '../ui/Button/Button'
import styles from '../../pages/operations/operations.module.css'

function statusVariant(status: string) {
  if (status === 'operational') return 'success' as const
  if (status === 'degraded' || status === 'maintenance') return 'warning' as const
  return 'error' as const
}

/** Global status + environment badge for the shell header. */
export function GlobalStatusIndicator() {
  const { globalStatus, environment, setEnvironment, liveRefresh, toggleLiveRefresh, lastRefreshedAt, bumpRefresh } =
    useProdOps()

  return (
    <div className={styles.statusCluster} aria-label="Platform status">
      <span
        className={
          globalStatus === 'operational'
            ? styles.statusDot
            : globalStatus === 'outage'
              ? styles.statusDotBad
              : styles.statusDotWarn
        }
        aria-hidden="true"
      />
      <Badge variant={statusVariant(globalStatus)}>{globalStatus}</Badge>
      <label className={styles.envSelect}>
        <span className={styles.srOnly}>Environment</span>
        <select
          aria-label="Active environment"
          value={environment}
          onChange={(e) => setEnvironment(e.target.value as typeof environment)}
        >
          <option value="development">Development</option>
          <option value="qa">QA</option>
          <option value="staging">Staging</option>
          <option value="production">Production</option>
        </select>
      </label>
      <Button size="sm" variant={liveRefresh ? 'secondary' : 'ghost'} onClick={toggleLiveRefresh} aria-pressed={liveRefresh}>
        Live {liveRefresh ? 'on' : 'off'}
      </Button>
      <Button size="sm" variant="ghost" onClick={bumpRefresh} title={`Last refreshed ${lastRefreshedAt}`}>
        Refresh
      </Button>
    </div>
  )
}
