import { Suspense, lazy, type ReactNode } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Plug } from 'lucide-react'
import { AppShell } from './components/layout/AppShell/AppShell'
import { RouteFallback } from './components/layout/RouteFallback/RouteFallback'
import { NAV_ITEMS, SECONDARY_DESTINATIONS } from './config/navigation'
import { HomePage } from './pages/HomePage'

const ComingSoonPage = lazy(() =>
  import('./pages/ComingSoonPage').then((module) => ({ default: module.ComingSoonPage })),
)
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })),
)

const KnowledgeHomePage = lazy(() =>
  import('./pages/knowledge/KnowledgeHomePage').then((module) => ({ default: module.KnowledgeHomePage })),
)
const RegulationLibraryPage = lazy(() =>
  import('./pages/knowledge/RegulationLibraryPage').then((module) => ({ default: module.RegulationLibraryPage })),
)
const DocumentViewerPage = lazy(() =>
  import('./pages/knowledge/DocumentViewerPage').then((module) => ({ default: module.DocumentViewerPage })),
)
const CollectionsPage = lazy(() =>
  import('./pages/knowledge/CollectionsPage').then((module) => ({ default: module.CollectionsPage })),
)
const CollectionDetailPage = lazy(() =>
  import('./pages/knowledge/CollectionDetailPage').then((module) => ({ default: module.CollectionDetailPage })),
)

const WorkDashboardPage = lazy(() =>
  import('./pages/work/WorkDashboardPage').then((module) => ({ default: module.WorkDashboardPage })),
)
const CasesPage = lazy(() => import('./pages/work/CasesPage').then((module) => ({ default: module.CasesPage })))
const CaseDetailPage = lazy(() =>
  import('./pages/work/CaseDetailPage').then((module) => ({ default: module.CaseDetailPage })),
)
const TaskDetailPage = lazy(() =>
  import('./pages/work/TaskDetailPage').then((module) => ({ default: module.TaskDetailPage })),
)
const WorkflowsPage = lazy(() =>
  import('./pages/work/WorkflowsPage').then((module) => ({ default: module.WorkflowsPage })),
)
const ComplianceCalendarPage = lazy(() =>
  import('./pages/work/ComplianceCalendarPage').then((module) => ({ default: module.ComplianceCalendarPage })),
)
const PoliciesPage = lazy(() =>
  import('./pages/knowledge/PoliciesPage').then((module) => ({ default: module.PoliciesPage })),
)
const PolicyDetailPage = lazy(() =>
  import('./pages/knowledge/PolicyDetailPage').then((module) => ({ default: module.PolicyDetailPage })),
)
const ReportsPage = lazy(() =>
  import('./pages/reports/ReportsPage').then((module) => ({ default: module.ReportsPage })),
)
const CommandCenterPage = lazy(() =>
  import('./pages/reports/CommandCenterPage').then((module) => ({ default: module.CommandCenterPage })),
)
const AnalyticsCenterPage = lazy(() =>
  import('./pages/reports/AnalyticsCenterPage').then((module) => ({ default: module.AnalyticsCenterPage })),
)
const KpiBuilderPage = lazy(() =>
  import('./pages/reports/KpiBuilderPage').then((module) => ({ default: module.KpiBuilderPage })),
)
const PredictivePage = lazy(() =>
  import('./pages/reports/PredictivePage').then((module) => ({ default: module.PredictivePage })),
)
const BoardStudioPage = lazy(() =>
  import('./pages/reports/BoardStudioPage').then((module) => ({ default: module.BoardStudioPage })),
)
const BenchmarkPage = lazy(() =>
  import('./pages/reports/BenchmarkPage').then((module) => ({ default: module.BenchmarkPage })),
)
const DataManagementPage = lazy(() =>
  import('./pages/settings/DataManagementPage').then((module) => ({ default: module.DataManagementPage })),
)
const SecurityCenterPage = lazy(() =>
  import('./pages/settings/SecurityCenterPage').then((module) => ({ default: module.SecurityCenterPage })),
)
const SsoSettingsPage = lazy(() =>
  import('./pages/settings/SsoSettingsPage').then((module) => ({ default: module.SsoSettingsPage })),
)
const AuditCenterPage = lazy(() =>
  import('./pages/audit/AuditCenterPage').then((module) => ({ default: module.AuditCenterPage })),
)
const AutomationStudioPage = lazy(() =>
  import('./pages/automation/AutomationStudioPage').then((module) => ({ default: module.AutomationStudioPage })),
)
const SystemHealthPage = lazy(() =>
  import('./pages/system/SystemHealthPage').then((module) => ({ default: module.SystemHealthPage })),
)
const MarketplacePage = lazy(() =>
  import('./pages/integrations/MarketplacePage').then((module) => ({ default: module.MarketplacePage })),
)
const IntegrationBuilderPage = lazy(() =>
  import('./pages/integrations/IntegrationBuilderPage').then((module) => ({ default: module.IntegrationBuilderPage })),
)
const WorkflowCanvasPage = lazy(() =>
  import('./pages/automation/WorkflowCanvasPage').then((module) => ({ default: module.WorkflowCanvasPage })),
)
const DataLineagePage = lazy(() =>
  import('./pages/data/DataLineagePage').then((module) => ({ default: module.DataLineagePage })),
)
const DigitalTwinPage = lazy(() =>
  import('./pages/reports/DigitalTwinPage').then((module) => ({ default: module.DigitalTwinPage })),
)
const DeveloperPortalPage = lazy(() =>
  import('./pages/developer/DeveloperPortalPage').then((module) => ({ default: module.DeveloperPortalPage })),
)
const ApiExplorerPage = lazy(() =>
  import('./pages/developer/ApiExplorerPage').then((module) => ({ default: module.ApiExplorerPage })),
)
const DeveloperAppsPage = lazy(() =>
  import('./pages/developer/DeveloperAppsPage').then((module) => ({ default: module.DeveloperAppsPage })),
)
const WebhooksCenterPage = lazy(() =>
  import('./pages/developer/WebhooksCenterPage').then((module) => ({ default: module.WebhooksCenterPage })),
)
const SdkResourcesPage = lazy(() =>
  import('./pages/developer/SdkResourcesPage').then((module) => ({ default: module.SdkResourcesPage })),
)
const OperationsCenterPage = lazy(() =>
  import('./pages/operations/OperationsCenterPage').then((module) => ({ default: module.OperationsCenterPage })),
)
const IncidentsPage = lazy(() =>
  import('./pages/operations/IncidentsPage').then((module) => ({ default: module.IncidentsPage })),
)
const BackupsPage = lazy(() =>
  import('./pages/operations/BackupsPage').then((module) => ({ default: module.BackupsPage })),
)
const DeploymentsPage = lazy(() =>
  import('./pages/operations/DeploymentsPage').then((module) => ({ default: module.DeploymentsPage })),
)
const ObservabilityPage = lazy(() =>
  import('./pages/operations/ObservabilityPage').then((module) => ({ default: module.ObservabilityPage })),
)
const SolutionsMarketplacePage = lazy(() =>
  import('./pages/solutions/SolutionsMarketplacePage').then((module) => ({ default: module.SolutionsMarketplacePage })),
)
const WealthSolutionPage = lazy(() =>
  import('./pages/solutions/WealthSolutionPage').then((module) => ({ default: module.WealthSolutionPage })),
)
const BankingSolutionPage = lazy(() =>
  import('./pages/solutions/BankingSolutionPage').then((module) => ({ default: module.BankingSolutionPage })),
)
const InsuranceSolutionPage = lazy(() =>
  import('./pages/solutions/InsuranceSolutionPage').then((module) => ({ default: module.InsuranceSolutionPage })),
)
const GrcSolutionPage = lazy(() =>
  import('./pages/solutions/GrcSolutionPage').then((module) => ({ default: module.GrcSolutionPage })),
)
const OnboardingPage = lazy(() =>
  import('./pages/adoption/OnboardingPage').then((module) => ({ default: module.OnboardingPage })),
)
const LearningCenterPage = lazy(() =>
  import('./pages/adoption/LearningCenterPage').then((module) => ({ default: module.LearningCenterPage })),
)
const CustomerSuccessPage = lazy(() =>
  import('./pages/adoption/CustomerSuccessPage').then((module) => ({ default: module.CustomerSuccessPage })),
)
const ToursPage = lazy(() =>
  import('./pages/adoption/ToursPage').then((module) => ({ default: module.ToursPage })),
)
const CommunityPage = lazy(() =>
  import('./pages/adoption/CommunityPage').then((module) => ({ default: module.CommunityPage })),
)
const BillingPage = lazy(() =>
  import('./pages/commercial/BillingPage').then((module) => ({ default: module.BillingPage })),
)
const CustomerPortalPage = lazy(() =>
  import('./pages/commercial/CustomerPortalPage').then((module) => ({ default: module.CustomerPortalPage })),
)
const PartnersPage = lazy(() =>
  import('./pages/commercial/PartnersPage').then((module) => ({ default: module.PartnersPage })),
)
const UsagePage = lazy(() =>
  import('./pages/commercial/UsagePage').then((module) => ({ default: module.UsagePage })),
)
const LicensingPage = lazy(() =>
  import('./pages/commercial/LicensingPage').then((module) => ({ default: module.LicensingPage })),
)
const KnowledgeGraphPage = lazy(() =>
  import('./pages/knowledge/KnowledgeGraphPage').then((module) => ({ default: module.KnowledgeGraphPage })),
)
const AgentWorkspacePage = lazy(() =>
  import('./pages/agents/AgentWorkspacePage').then((module) => ({ default: module.AgentWorkspacePage })),
)
const AgentBuilderPage = lazy(() =>
  import('./pages/agents/AgentBuilderPage').then((module) => ({ default: module.AgentBuilderPage })),
)
const AutonomousQueuePage = lazy(() =>
  import('./pages/agents/AutonomousQueuePage').then((module) => ({ default: module.AutonomousQueuePage })),
)
const SettingsPage = lazy(() =>
  import('./pages/settings/SettingsPage').then((module) => ({ default: module.SettingsPage })),
)
const IntegrationsPage = lazy(() =>
  import('./pages/settings/IntegrationsPage').then((module) => ({ default: module.IntegrationsPage })),
)
const ApiPlatformPage = lazy(() =>
  import('./pages/settings/ApiPlatformPage').then((module) => ({ default: module.ApiPlatformPage })),
)
const AdminConsolePage = lazy(() =>
  import('./pages/settings/AdminConsolePage').then((module) => ({ default: module.AdminConsolePage })),
)
const CollaborationPage = lazy(() =>
  import('./pages/settings/CollaborationPage').then((module) => ({ default: module.CollaborationPage })),
)
const AIWorkspacePage = lazy(() =>
  import('./pages/ai/AIWorkspacePage').then((module) => ({ default: module.AIWorkspacePage })),
)
const PromptsPage = lazy(() => import('./pages/ai/PromptsPage').then((module) => ({ default: module.PromptsPage })))
const MemoryPage = lazy(() => import('./pages/ai/MemoryPage').then((module) => ({ default: module.MemoryPage })))
const AgentsPage = lazy(() => import('./pages/ai/AgentsPage').then((module) => ({ default: module.AgentsPage })))
const InvestigationsPage = lazy(() =>
  import('./pages/investigations/InvestigationsPage').then((module) => ({ default: module.InvestigationsPage })),
)
const InvestigationDetailPage = lazy(() =>
  import('./pages/investigations/InvestigationDetailPage').then((module) => ({
    default: module.InvestigationDetailPage,
  })),
)
const RegulatoryChangesPage = lazy(() =>
  import('./pages/investigations/RegulatoryChangesPage').then((module) => ({
    default: module.RegulatoryChangesPage,
  })),
)
const RegulatoryChangeDetailPage = lazy(() =>
  import('./pages/investigations/RegulatoryChangeDetailPage').then((module) => ({
    default: module.RegulatoryChangeDetailPage,
  })),
)

const BUILT_OUT_NAV_ITEM_IDS = new Set([
  'knowledge',
  'work',
  'ai',
  'reports',
  'settings',
  'investigations',
  'regulatory-changes',
])

function LazyPage({ children }: { children: ReactNode }) {
  return <Suspense fallback={<RouteFallback />}>{children}</Suspense>
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />

        <Route path="knowledge">
          <Route
            index
            element={
              <LazyPage>
                <KnowledgeHomePage />
              </LazyPage>
            }
          />
          <Route
            path="library"
            element={
              <LazyPage>
                <RegulationLibraryPage />
              </LazyPage>
            }
          />
          <Route
            path="library/:documentId"
            element={
              <LazyPage>
                <DocumentViewerPage />
              </LazyPage>
            }
          />
          <Route
            path="collections"
            element={
              <LazyPage>
                <CollectionsPage />
              </LazyPage>
            }
          />
          <Route
            path="collections/:collectionId"
            element={
              <LazyPage>
                <CollectionDetailPage />
              </LazyPage>
            }
          />
          <Route
            path="policies"
            element={
              <LazyPage>
                <PoliciesPage />
              </LazyPage>
            }
          />
          <Route
            path="policies/:policyId"
            element={
              <LazyPage>
                <PolicyDetailPage />
              </LazyPage>
            }
          />
          <Route
            path="graph"
            element={
              <LazyPage>
                <KnowledgeGraphPage />
              </LazyPage>
            }
          />
        </Route>

        <Route path="work">
          <Route
            index
            element={
              <LazyPage>
                <WorkDashboardPage />
              </LazyPage>
            }
          />
          <Route
            path="cases"
            element={
              <LazyPage>
                <CasesPage />
              </LazyPage>
            }
          />
          <Route
            path="cases/:caseId"
            element={
              <LazyPage>
                <CaseDetailPage />
              </LazyPage>
            }
          />
          <Route
            path="tasks/:taskId"
            element={
              <LazyPage>
                <TaskDetailPage />
              </LazyPage>
            }
          />
          <Route
            path="workflows"
            element={
              <LazyPage>
                <WorkflowsPage />
              </LazyPage>
            }
          />
          <Route
            path="calendar"
            element={
              <LazyPage>
                <ComplianceCalendarPage />
              </LazyPage>
            }
          />
        </Route>

        <Route path="ai">
          <Route
            index
            element={
              <LazyPage>
                <AIWorkspacePage />
              </LazyPage>
            }
          />
          <Route
            path="prompts"
            element={
              <LazyPage>
                <PromptsPage />
              </LazyPage>
            }
          />
          <Route
            path="memory"
            element={
              <LazyPage>
                <MemoryPage />
              </LazyPage>
            }
          />
          <Route
            path="agents"
            element={
              <LazyPage>
                <AgentsPage />
              </LazyPage>
            }
          />
        </Route>

        <Route path="reports">
          <Route
            index
            element={
              <LazyPage>
                <ReportsPage />
              </LazyPage>
            }
          />
          <Route
            path="command"
            element={
              <LazyPage>
                <CommandCenterPage />
              </LazyPage>
            }
          />
          <Route
            path="analytics"
            element={
              <LazyPage>
                <AnalyticsCenterPage />
              </LazyPage>
            }
          />
          <Route
            path="kpis"
            element={
              <LazyPage>
                <KpiBuilderPage />
              </LazyPage>
            }
          />
          <Route
            path="predictive"
            element={
              <LazyPage>
                <PredictivePage />
              </LazyPage>
            }
          />
          <Route
            path="board"
            element={
              <LazyPage>
                <BoardStudioPage />
              </LazyPage>
            }
          />
          <Route
            path="benchmark"
            element={
              <LazyPage>
                <BenchmarkPage />
              </LazyPage>
            }
          />
          <Route
            path="digital-twin"
            element={
              <LazyPage>
                <DigitalTwinPage />
              </LazyPage>
            }
          />
        </Route>

        <Route path="agents">
          <Route
            index
            element={
              <LazyPage>
                <AgentWorkspacePage />
              </LazyPage>
            }
          />
          <Route
            path="builder"
            element={
              <LazyPage>
                <AgentBuilderPage />
              </LazyPage>
            }
          />
          <Route
            path="queue"
            element={
              <LazyPage>
                <AutonomousQueuePage />
              </LazyPage>
            }
          />
        </Route>

        <Route path="settings">
          <Route
            index
            element={
              <LazyPage>
                <SettingsPage />
              </LazyPage>
            }
          />
          <Route
            path="integrations"
            element={
              <LazyPage>
                <IntegrationsPage />
              </LazyPage>
            }
          />
          <Route
            path="api"
            element={
              <LazyPage>
                <ApiPlatformPage />
              </LazyPage>
            }
          />
          <Route
            path="admin"
            element={
              <LazyPage>
                <AdminConsolePage />
              </LazyPage>
            }
          />
          <Route
            path="collaboration"
            element={
              <LazyPage>
                <CollaborationPage />
              </LazyPage>
            }
          />
          <Route
            path="data"
            element={
              <LazyPage>
                <DataManagementPage />
              </LazyPage>
            }
          />
          <Route
            path="security"
            element={
              <LazyPage>
                <SecurityCenterPage />
              </LazyPage>
            }
          />
          <Route
            path="security/sso"
            element={
              <LazyPage>
                <SsoSettingsPage />
              </LazyPage>
            }
          />
          <Route
            path="tours"
            element={
              <LazyPage>
                <ToursPage />
              </LazyPage>
            }
          />
          <Route
            path="billing"
            element={
              <LazyPage>
                <BillingPage />
              </LazyPage>
            }
          />
          <Route
            path="usage"
            element={
              <LazyPage>
                <UsagePage />
              </LazyPage>
            }
          />
          <Route
            path="licensing"
            element={
              <LazyPage>
                <LicensingPage />
              </LazyPage>
            }
          />
        </Route>

        <Route
          path="audit"
          element={
            <LazyPage>
              <AuditCenterPage />
            </LazyPage>
          }
        />
        <Route path="automation">
          <Route
            index
            element={
              <LazyPage>
                <AutomationStudioPage />
              </LazyPage>
            }
          />
          <Route
            path="canvas"
            element={
              <LazyPage>
                <WorkflowCanvasPage />
              </LazyPage>
            }
          />
        </Route>
        <Route
          path="system"
          element={
            <LazyPage>
              <SystemHealthPage />
            </LazyPage>
          }
        />

        <Route path="integrations">
          <Route
            index
            element={
              <LazyPage>
                <IntegrationsPage />
              </LazyPage>
            }
          />
          <Route
            path="marketplace"
            element={
              <LazyPage>
                <MarketplacePage />
              </LazyPage>
            }
          />
          <Route
            path="builder"
            element={
              <LazyPage>
                <IntegrationBuilderPage />
              </LazyPage>
            }
          />
        </Route>

        <Route path="data">
          <Route
            path="lineage"
            element={
              <LazyPage>
                <DataLineagePage />
              </LazyPage>
            }
          />
        </Route>

        <Route path="developer">
          <Route
            index
            element={
              <LazyPage>
                <DeveloperPortalPage />
              </LazyPage>
            }
          />
          <Route
            path="api"
            element={
              <LazyPage>
                <ApiExplorerPage />
              </LazyPage>
            }
          />
          <Route
            path="apps"
            element={
              <LazyPage>
                <DeveloperAppsPage />
              </LazyPage>
            }
          />
          <Route
            path="webhooks"
            element={
              <LazyPage>
                <WebhooksCenterPage />
              </LazyPage>
            }
          />
          <Route
            path="sdk"
            element={
              <LazyPage>
                <SdkResourcesPage />
              </LazyPage>
            }
          />
        </Route>

        <Route path="operations">
          <Route
            index
            element={
              <LazyPage>
                <OperationsCenterPage />
              </LazyPage>
            }
          />
          <Route
            path="incidents"
            element={
              <LazyPage>
                <IncidentsPage />
              </LazyPage>
            }
          />
          <Route
            path="backups"
            element={
              <LazyPage>
                <BackupsPage />
              </LazyPage>
            }
          />
          <Route
            path="deployments"
            element={
              <LazyPage>
                <DeploymentsPage />
              </LazyPage>
            }
          />
          <Route
            path="observability"
            element={
              <LazyPage>
                <ObservabilityPage />
              </LazyPage>
            }
          />
        </Route>

        <Route path="solutions">
          <Route
            index
            element={
              <LazyPage>
                <SolutionsMarketplacePage />
              </LazyPage>
            }
          />
          <Route
            path="wealth"
            element={
              <LazyPage>
                <WealthSolutionPage />
              </LazyPage>
            }
          />
          <Route
            path="banking"
            element={
              <LazyPage>
                <BankingSolutionPage />
              </LazyPage>
            }
          />
          <Route
            path="insurance"
            element={
              <LazyPage>
                <InsuranceSolutionPage />
              </LazyPage>
            }
          />
          <Route
            path="grc"
            element={
              <LazyPage>
                <GrcSolutionPage />
              </LazyPage>
            }
          />
        </Route>

        <Route
          path="onboarding"
          element={
            <LazyPage>
              <OnboardingPage />
            </LazyPage>
          }
        />
        <Route
          path="help"
          element={
            <LazyPage>
              <LearningCenterPage />
            </LazyPage>
          }
        />
        <Route
          path="customer-success"
          element={
            <LazyPage>
              <CustomerSuccessPage />
            </LazyPage>
          }
        />
        <Route
          path="community"
          element={
            <LazyPage>
              <CommunityPage />
            </LazyPage>
          }
        />
        <Route
          path="customer"
          element={
            <LazyPage>
              <CustomerPortalPage />
            </LazyPage>
          }
        />
        <Route
          path="partners"
          element={
            <LazyPage>
              <PartnersPage />
            </LazyPage>
          }
        />

        <Route path="investigations">
          <Route
            index
            element={
              <LazyPage>
                <InvestigationsPage />
              </LazyPage>
            }
          />
          <Route
            path=":investigationId"
            element={
              <LazyPage>
                <InvestigationDetailPage />
              </LazyPage>
            }
          />
        </Route>

        <Route path="regulatory-changes">
          <Route
            index
            element={
              <LazyPage>
                <RegulatoryChangesPage />
              </LazyPage>
            }
          />
          <Route
            path=":changeId"
            element={
              <LazyPage>
                <RegulatoryChangeDetailPage />
              </LazyPage>
            }
          />
        </Route>

        {NAV_ITEMS.filter((item) => item.path !== '/' && !BUILT_OUT_NAV_ITEM_IDS.has(item.id)).map((item) => (
          <Route
            key={item.id}
            path={item.path.slice(1)}
            element={<ComingSoonPage title={item.label} description={item.description} icon={item.icon} />}
          />
        ))}
        {SECONDARY_DESTINATIONS.filter(
          (item) =>
            ![
              'investigations',
              'regulatory-changes',
              'policies',
              'workflows',
              'calendar',
              'integrations',
              'api-platform',
              'admin-console',
              'collaboration',
              'ai-agents',
              'agent-builder',
              'autonomous-queue',
              'knowledge-graph',
              'command-center',
              'continuous-monitoring',
              'analytics-center',
              'kpi-builder',
              'predictive',
              'board-studio',
              'benchmarking',
              'data-management',
              'security-center',
              'audit-center',
              'automation-studio',
              'system-health',
              'integration-marketplace',
              'integration-builder',
              'workflow-canvas',
              'data-lineage',
              'digital-twin',
              'developer-portal',
              'developer-api',
              'developer-apps',
              'developer-webhooks',
              'developer-sdk',
              'operations-center',
              'operations-incidents',
              'operations-backups',
              'operations-deployments',
              'operations-observability',
              'solutions-marketplace',
              'solutions-wealth',
              'solutions-banking',
              'solutions-insurance',
              'solutions-grc',
              'onboarding',
              'learning-center',
              'customer-success',
              'product-tours',
              'community',
            ].includes(item.id),
        ).map((item) => (
          <Route
            key={item.id}
            path={item.path.slice(1)}
            element={<ComingSoonPage title={item.label} description={item.description} icon={Plug} />}
          />
        ))}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
