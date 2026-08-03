import { useState } from 'react'
import { ArchiveRestore } from 'lucide-react'
import g from '../../components/governance/governance.module.css'
import { Badge } from '../../components/ui/Badge/Badge'
import { Button } from '../../components/ui/Button/Button'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { useProdOps } from '../../hooks/useProdOps'
import type { BackupKind } from '../../types/prodops'
import { formatRelativeTime } from '../../utils/date'
import { ProdOpsHubNav } from './ProdOpsHubNav'
import styles from './operations.module.css'

function backupVariant(status: string) {
  if (status === 'verified' || status === 'succeeded') return 'success' as const
  if (status === 'running') return 'accent' as const
  return 'error' as const
}

const KINDS: BackupKind[] = ['full', 'incremental', 'database', 'files', 'configuration']

export function BackupsPage() {
  const { backups, recovery, createBackup, verifyBackup, restoreBackup, simulateRestore } = useProdOps()
  const [message, setMessage] = useState('')

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        title="Backup & Disaster Recovery"
        description="Full and incremental backups, restore actions, RPO/RTO policy, and restore simulation."
        icon={<ArchiveRestore size={20} />}
      />

      <ProdOpsHubNav current="/operations/backups" />

      <div className={g.metricGrid} aria-label="Recovery objectives">
        <div className={g.metric}>
          <span>RPO</span>
          <strong>{recovery.rpoMinutes}m</strong>
        </div>
        <div className={g.metric}>
          <span>RTO</span>
          <strong>{recovery.rtoMinutes}m</strong>
        </div>
        <div className={g.metric}>
          <span>Retention</span>
          <strong>{recovery.retentionDays}d</strong>
        </div>
        <div className={g.metric}>
          <span>Storage</span>
          <strong>Multi-region</strong>
        </div>
      </div>

      <section className={g.panel}>
        <header className={g.row}>
          <h2>Recovery policy</h2>
          <Button
            size="sm"
            variant="primary"
            onClick={() => setMessage(simulateRestore())}
          >
            Restore simulation
          </Button>
        </header>
        <p className={g.muted}>Schedule: {recovery.schedule}</p>
        <p className={g.muted}>Location: {recovery.storageLocation}</p>
        {message && <p className={g.muted} role="status">{message}</p>}
      </section>

      <section className={g.panel}>
        <header className={g.row}>
          <h2>Backups</h2>
          <div className={g.toolbar}>
            {KINDS.map((kind) => (
              <Button key={kind} size="sm" variant="secondary" onClick={() => createBackup(kind)}>
                Create {kind}
              </Button>
            ))}
          </div>
        </header>
        <ul className={g.list}>
          {backups.map((item) => (
            <li key={item.id} className={g.listItem}>
              <span>
                <strong>{item.name}</strong>
                <br />
                <span className={g.muted}>
                  {item.kind} · {item.sizeLabel} · {item.location}
                  <br />
                  Created {formatRelativeTime(item.createdAt)}
                  {item.verifiedAt ? ` · Verified ${formatRelativeTime(item.verifiedAt)}` : ''}
                </span>
              </span>
              <div className={g.toolbar}>
                <Badge variant={backupVariant(item.status)}>{item.status}</Badge>
                <Button size="sm" variant="ghost" onClick={() => verifyBackup(item.id)} disabled={item.status === 'verified'}>
                  Verify
                </Button>
                <Button size="sm" variant="secondary" onClick={() => restoreBackup(item.id)}>
                  Restore
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const blob = new Blob(
                      [JSON.stringify({ id: item.id, name: item.name, kind: item.kind, location: item.location }, null, 2)],
                      { type: 'application/json' },
                    )
                    const url = URL.createObjectURL(blob)
                    const anchor = document.createElement('a')
                    anchor.href = url
                    anchor.download = `${item.name}.metadata.json`
                    anchor.click()
                    URL.revokeObjectURL(url)
                  }}
                >
                  Download metadata
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </PageContainer>
  )
}
