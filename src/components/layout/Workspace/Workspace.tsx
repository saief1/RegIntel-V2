import { SectionHeader } from '../../ui/SectionHeader/SectionHeader'
import styles from './Workspace.module.css'

export function Workspace() {
  return (
    <main className={styles.workspace} aria-label="Workspace">
      <div className={styles.content}>
        <SectionHeader
          size="xl"
          align="center"
          title="Welcome to RegIntel Professional"
          description="Enterprise Regulatory Intelligence Platform"
        />
      </div>
    </main>
  )
}
