import { useMemo, useState } from 'react'
import { Radar } from 'lucide-react'
import g from '../../components/governance/governance.module.css'
import { Badge } from '../../components/ui/Badge/Badge'
import { Button } from '../../components/ui/Button/Button'
import { Input } from '../../components/ui/Input/Input'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { Select } from '../../components/ui/Select/Select'
import { useProdOps } from '../../hooks/useProdOps'
import type { MetricPoint } from '../../types/prodops'
import { formatRelativeTime } from '../../utils/date'
import { ProdOpsHubNav } from './ProdOpsHubNav'
import styles from './operations.module.css'

function MetricBars({ title, points, unit = '' }: { title: string; points: MetricPoint[]; unit?: string }) {
  const max = Math.max(...points.map((point) => point.value), 1)
  return (
    <article className={g.card} style={{ cursor: 'default' }}>
      <h3>{title}</h3>
      <div className={styles.bars} role="img" aria-label={`${title} chart`}>
        {points.map((point) => (
          <div key={point.label} className={styles.barCol}>
            <div className={styles.bar} style={{ height: `${(point.value / max) * 72}px` }} title={`${point.value}${unit}`} />
            <span className={styles.barLabel}>{point.label.replace(':00', '')}</span>
          </div>
        ))}
      </div>
      <p className={g.muted}>
        Latest {points[points.length - 1]?.value}
        {unit}
      </p>
    </article>
  )
}

export function ObservabilityPage() {
  const { metrics, logs, traces, alerts, silenceAlert, toggleAlert, services } = useProdOps()
  const [query, setQuery] = useState('')
  const [level, setLevel] = useState<'all' | 'info' | 'warn' | 'error' | 'debug'>('all')
  const [liveStream, setLiveStream] = useState(true)
  const [selectedTraceId, setSelectedTraceId] = useState(traces[0]?.id ?? '')

  const filteredLogs = useMemo(
    () =>
      logs.filter((entry) => {
        if (level !== 'all' && entry.level !== level) return false
        if (!query) return true
        return `${entry.service} ${entry.message}`.toLowerCase().includes(query.toLowerCase())
      }),
    [level, logs, query],
  )

  const selectedTrace = traces.find((item) => item.id === selectedTraceId) ?? traces[0]

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        title="Observability"
        description="Metrics, logs, tracing, and alert policies for production systems."
        icon={<Radar size={20} />}
      />

      <ProdOpsHubNav current="/operations/observability" />

      <section className={g.panel}>
        <h2>Metrics</h2>
        <div className={g.grid}>
          <MetricBars title="CPU %" points={metrics.cpu} unit="%" />
          <MetricBars title="Memory %" points={metrics.memory} unit="%" />
          <MetricBars title="API latency ms" points={metrics.apiLatencyMs} unit="ms" />
          <MetricBars title="Error rate %" points={metrics.errorRatePct} unit="%" />
          <MetricBars title="Requests" points={metrics.requests} />
          <MetricBars title="Queue depth" points={metrics.queueDepth} />
          <MetricBars title="AI usage" points={metrics.aiUsage} />
          <article className={g.card} style={{ cursor: 'default' }}>
            <h3>Storage</h3>
            <strong style={{ fontSize: '1.5rem' }}>{metrics.storagePct}%</strong>
            <p className={g.muted}>Evidence and backup buckets</p>
          </article>
        </div>
      </section>

      <div className={styles.split}>
        <section className={g.panel}>
          <header className={g.row}>
            <h2>Logs</h2>
            <div className={g.toolbar}>
              <Button size="sm" variant={liveStream ? 'secondary' : 'ghost'} onClick={() => setLiveStream((v) => !v)} aria-pressed={liveStream}>
                Live stream {liveStream ? 'on' : 'off'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  const blob = new Blob([filteredLogs.map((l) => `${l.at} ${l.level} ${l.service} ${l.message}`).join('\n')], {
                    type: 'text/plain',
                  })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = 'regintel-logs.txt'
                  a.click()
                  URL.revokeObjectURL(url)
                }}
              >
                Export
              </Button>
            </div>
          </header>
          <div className={g.toolbar}>
            <Input aria-label="Search logs" placeholder="Search logs" value={query} onChange={(e) => setQuery(e.target.value)} />
            <Select aria-label="Log level" value={level} onChange={(e) => setLevel(e.target.value as typeof level)}>
              <option value="all">All levels</option>
              <option value="error">error</option>
              <option value="warn">warn</option>
              <option value="info">info</option>
              <option value="debug">debug</option>
            </Select>
          </div>
          {filteredLogs.length === 0 ? (
            <p className={g.muted}>No log lines match.</p>
          ) : (
            <ul className={g.list}>
              {filteredLogs.map((entry) => (
                <li key={entry.id} className={g.listItem}>
                  <span>
                    <Badge variant={entry.level === 'error' ? 'error' : entry.level === 'warn' ? 'warning' : 'neutral'}>
                      {entry.level}
                    </Badge>{' '}
                    <strong>{entry.service}</strong>
                    <br />
                    <span className={g.muted}>{entry.message}</span>
                  </span>
                  <time dateTime={entry.at}>{formatRelativeTime(entry.at)}</time>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className={g.stack}>
          <section className={g.panel}>
            <h2>Tracing</h2>
            <div className={styles.chipRow}>
              {traces.map((trace) => (
                <button
                  key={trace.id}
                  type="button"
                  className={selectedTrace?.id === trace.id ? styles.chipActive : styles.chip}
                  onClick={() => setSelectedTraceId(trace.id)}
                >
                  {trace.path} {trace.slow ? '· slow' : ''}
                </button>
              ))}
            </div>
            {selectedTrace && (
              <>
                <p className={g.muted}>
                  Request timeline · {selectedTrace.totalMs}ms · status {selectedTrace.status}
                </p>
                <div className={styles.traceTrack} aria-label="Trace spans">
                  {selectedTrace.spans.map((span) => (
                    <div
                      key={span.id}
                      className={styles.traceSpan}
                      style={{
                        left: `${(span.startMs / selectedTrace.totalMs) * 100}%`,
                        width: `${Math.max(8, (span.durationMs / selectedTrace.totalMs) * 100)}%`,
                      }}
                      title={`${span.name} ${span.durationMs}ms`}
                    >
                      {span.name}
                    </div>
                  ))}
                </div>
                <h3>Dependency graph</h3>
                <div className={styles.depMap}>
                  {selectedTrace.spans.map((span, index) => (
                    <div key={span.id} className={styles.flow}>
                      <span className={styles.node}>{span.service}</span>
                      {index < selectedTrace.spans.length - 1 && <span className={styles.arrow}>→</span>}
                    </div>
                  ))}
                </div>
                <h3>Slow requests</h3>
                <ul className={g.list}>
                  {traces
                    .filter((item) => item.slow)
                    .map((item) => (
                      <li key={item.id} className={g.listItem}>
                        <span>{item.path}</span>
                        <Badge variant="warning">{item.totalMs}ms</Badge>
                      </li>
                    ))}
                </ul>
              </>
            )}
          </section>

          <section className={g.panel}>
            <h2>Alerts</h2>
            <ul className={g.list}>
              {alerts.map((alert) => (
                <li key={alert.id} className={g.listItem}>
                  <span>
                    <strong>{alert.name}</strong>
                    <br />
                    <span className={g.muted}>
                      {alert.metric} {alert.threshold}
                      <br />
                      Notify {alert.notify.join(', ')} · Escalation: {alert.escalation}
                      {alert.silencedUntil ? ` · Silenced until ${formatRelativeTime(alert.silencedUntil)}` : ''}
                    </span>
                  </span>
                  <div className={g.toolbar}>
                    <Badge variant={alert.severity === 'critical' ? 'error' : alert.severity === 'warning' ? 'warning' : 'neutral'}>
                      {alert.severity}
                    </Badge>
                    <Button size="sm" variant="ghost" onClick={() => silenceAlert(alert.id, 2)}>
                      Silence 2h
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => toggleAlert(alert.id)}>
                      {alert.enabled ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
            <p className={g.muted}>{services.length} services monitored for threshold rules.</p>
          </section>
        </aside>
      </div>
    </PageContainer>
  )
}
