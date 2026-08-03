import { CommandPalette } from '../../CommandPalette/CommandPalette'
import { AutonomousProvider } from '../../../context/AutonomousProvider'
import { ConnectedProvider } from '../../../context/ConnectedProvider'
import { CopilotProvider } from '../../../context/CopilotProvider'
import { GovernanceProvider } from '../../../context/GovernanceProvider'
import { InvestigationsProvider } from '../../../context/InvestigationsProvider'
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
        <InvestigationsProvider>
          <GovernanceProvider>
            <ConnectedProvider>
              <AutonomousProvider>
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
              </AutonomousProvider>
            </ConnectedProvider>
          </GovernanceProvider>
        </InvestigationsProvider>
      </WorkProvider>
    </KnowledgeProvider>
  )
}
