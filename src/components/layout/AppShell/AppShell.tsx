import { AIPanel } from '../AIPanel/AIPanel'
import { Header } from '../Header/Header'
import { Sidebar } from '../Sidebar/Sidebar'
import { Workspace } from '../Workspace/Workspace'
import styles from './AppShell.module.css'

export function AppShell() {
  return (
    <div className={styles.shell}>
      <Header />

      <div className={styles.body}>
        <Sidebar />
        <Workspace />
        <AIPanel />
      </div>
    </div>
  )
}
