import { AIWorkspaceIcon } from '../../icons'
import { EmptyState } from '../../ui/EmptyState/EmptyState'
import { Panel } from '../../ui/Panel/Panel'
import styles from './AIPanel.module.css'

export function AIPanel() {
  return (
    <Panel
      variant="flush"
      className={styles.panel}
      headerClassName={styles.header}
      bodyClassName={styles.body}
      title="AI Assistant"
      icon={<AIWorkspaceIcon width={18} height={18} />}
      aria-label="AI Assistant"
    >
      <EmptyState
        icon={<AIWorkspaceIcon width={20} height={20} />}
        title="AI workspace coming soon."
      />
    </Panel>
  )
}
