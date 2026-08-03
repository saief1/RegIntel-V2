import { CommandPalette } from '../../CommandPalette/CommandPalette'
import { CopilotProvider } from '../../../context/CopilotProvider'
import { KnowledgeProvider } from '../../../context/KnowledgeProvider'
import { ShellLayoutProvider } from '../../../context/ShellLayoutProvider'
import { WorkProvider } from '../../../context/WorkProvider'
import { AIPanel } from '../AIPanel/AIPanel'
import { Header } from '../Header/Header'
import { Sidebar } from '../Sidebar/Sidebar'
import { Workspace } from '../Workspace/Workspace'
import styles from './AppShell.module.css'

export function AppShell() {
  return (
    <KnowledgeProvider>
      <WorkProvider>
        <CopilotProvider>
          <ShellLayoutProvider>
            <div className={styles.shell}>
              <Header />
              <div className={styles.body}>
                <Sidebar />
                <Workspace />
                <AIPanel />
              </div>
            </div>
            <CommandPalette />
          </ShellLayoutProvider>
        </CopilotProvider>
      </WorkProvider>
    </KnowledgeProvider>
  )
}
