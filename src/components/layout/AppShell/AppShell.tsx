import { CommandPalette } from '../../CommandPalette/CommandPalette'
import { AnalyticsProvider } from '../../../context/AnalyticsProvider'
import { AutonomousProvider } from '../../../context/AutonomousProvider'
import { ConnectedProvider } from '../../../context/ConnectedProvider'
import { CopilotProvider } from '../../../context/CopilotProvider'
import { EcosystemProvider } from '../../../context/EcosystemProvider'
import { DeveloperProvider } from '../../../context/DeveloperProvider'
import { GovernanceProvider } from '../../../context/GovernanceProvider'
import { InvestigationsProvider } from '../../../context/InvestigationsProvider'
import { KnowledgeProvider } from '../../../context/KnowledgeProvider'
import { OperationsProvider } from '../../../context/OperationsProvider'
import { ShellLayoutProvider } from '../../../context/ShellLayoutProvider'
import { WorkProvider } from '../../../context/WorkProvider'
import { ToastCenter } from '../../operations/ToastCenter'
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
                <AnalyticsProvider>
                  <OperationsProvider>
                    <EcosystemProvider>
                      <DeveloperProvider>
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
                            <ToastCenter />
                          </ShellLayoutProvider>
                        </CopilotProvider>
                      </DeveloperProvider>
                    </EcosystemProvider>
                  </OperationsProvider>
                </AnalyticsProvider>
              </AutonomousProvider>
            </ConnectedProvider>
          </GovernanceProvider>
        </InvestigationsProvider>
      </WorkProvider>
    </KnowledgeProvider>
  )
}
