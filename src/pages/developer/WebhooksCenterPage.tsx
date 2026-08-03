import { Webhook } from 'lucide-react'
import { JsonViewer } from '../../components/developer/JsonViewer'
import g from '../../components/governance/governance.module.css'
import { Badge } from '../../components/ui/Badge/Badge'
import { Button } from '../../components/ui/Button/Button'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { useDeveloper } from '../../hooks/useDeveloper'
import { formatRelativeTime } from '../../utils/date'
import { DeveloperHubNav } from './DeveloperHubNav'
import styles from './developer.module.css'

function deliveryVariant(status: string) {
  if (status === 'success') return 'success' as const
  if (status === 'retried' || status === 'pending') return 'accent' as const
  return 'error' as const
}

export function WebhooksCenterPage() {
  const {
    webhooks,
    deliveries,
    webhookEvents,
    selectedWebhookId,
    selectWebhook,
    selectedDeliveryId,
    selectDelivery,
    toggleWebhook,
    replayDelivery,
  } = useDeveloper()

  const selected = webhooks.find((item) => item.id === selectedWebhookId) ?? webhooks[0]
  const selectedDelivery = deliveries.find((item) => item.id === selectedDeliveryId) ?? deliveries[0]
  const webhookDeliveries = deliveries.filter((item) => item.webhookId === selected?.id)

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        title="Webhooks Center"
        description="Subscribe to compliance events, inspect payloads, replay deliveries, and monitor success rates."
        icon={<Webhook size={20} />}
      />

      <DeveloperHubNav current="/developer/webhooks" />

      <section className={g.panel}>
        <h2>Supported events</h2>
        <div className={g.toolbar} role="list">
          {webhookEvents.map((event) => (
            <Badge key={event} variant="neutral">
              {event}
            </Badge>
          ))}
        </div>
      </section>

      <div className={styles.splitWide}>
        <section aria-label="Webhook endpoints">
          <div className={g.grid}>
            {webhooks.map((item) => (
              <button
                key={item.id}
                type="button"
                className={g.card}
                aria-pressed={selected?.id === item.id}
                onClick={() => selectWebhook(item.id)}
              >
                <div className={g.meta}>
                  <Badge variant={item.enabled ? 'success' : 'warning'}>{item.enabled ? 'enabled' : 'disabled'}</Badge>
                  <Badge variant="neutral">{item.successRatePct}% success</Badge>
                </div>
                <h3>{item.name}</h3>
                <p className={`${g.muted} ${styles.mono}`}>{item.url}</p>
                <p className={g.muted}>
                  Secret {item.secretMasked} · Retries {item.retryCount}
                  {item.lastDeliveryAt ? ` · Last ${formatRelativeTime(item.lastDeliveryAt)}` : ''}
                </p>
              </button>
            ))}
          </div>
        </section>

        <aside className={g.stack}>
          {selected && (
            <section className={g.panel}>
              <header className={g.row}>
                <div>
                  <h2>{selected.name}</h2>
                  <p className={`${g.muted} ${styles.mono}`}>{selected.url}</p>
                </div>
                <Button size="sm" variant="secondary" onClick={() => toggleWebhook(selected.id)}>
                  {selected.enabled ? 'Disable' : 'Enable'}
                </Button>
              </header>
              <h3>Events</h3>
              <p className={g.muted}>{selected.events.join(', ')}</p>
              <h3>Secret</h3>
              <p className={`${g.muted} ${styles.mono}`}>{selected.secretMasked}</p>
              <h3>Delivery log</h3>
              {webhookDeliveries.length === 0 ? (
                <p className={g.muted}>No deliveries yet.</p>
              ) : (
                <ul className={g.list}>
                  {webhookDeliveries.map((item) => (
                    <li key={item.id} className={g.listItem}>
                      <button type="button" className={styles.endpointBtn} onClick={() => selectDelivery(item.id)}>
                        <strong>{item.event}</strong>
                        <br />
                        <span className={g.muted}>
                          Attempt {item.attempt} · {item.latencyMs}ms · {item.responseCode ?? '—'}
                        </span>
                      </button>
                      <div className={g.toolbar}>
                        <Badge variant={deliveryVariant(item.status)}>{item.status}</Badge>
                        <Button size="sm" variant="ghost" onClick={() => replayDelivery(item.id)}>
                          Replay event
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {selectedDelivery && (
            <section className={g.panel}>
              <h2>Payload viewer</h2>
              <p className={g.muted}>
                {selectedDelivery.event} · {formatRelativeTime(selectedDelivery.deliveredAt)}
              </p>
              <JsonViewer value={selectedDelivery.payload} label="Webhook payload" />
            </section>
          )}
        </aside>
      </div>
    </PageContainer>
  )
}
