import { Suspense, lazy, type ReactNode } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Plug } from 'lucide-react'
import { AppShell } from './components/layout/AppShell/AppShell'
import { RouteFallback } from './components/layout/RouteFallback/RouteFallback'
import { NAV_ITEMS, SECONDARY_DESTINATIONS } from './config/navigation'
import { ComingSoonPage } from './pages/ComingSoonPage'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { CollectionDetailPage } from './pages/knowledge/CollectionDetailPage'
import { CollectionsPage } from './pages/knowledge/CollectionsPage'
import { DocumentViewerPage } from './pages/knowledge/DocumentViewerPage'
import { KnowledgeHomePage } from './pages/knowledge/KnowledgeHomePage'
import { RegulationLibraryPage } from './pages/knowledge/RegulationLibraryPage'

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
const SettingsPage = lazy(() =>
  import('./pages/settings/SettingsPage').then((module) => ({ default: module.SettingsPage })),
)
const AIWorkspacePage = lazy(() =>
  import('./pages/ai/AIWorkspacePage').then((module) => ({ default: module.AIWorkspacePage })),
)
const PromptsPage = lazy(() => import('./pages/ai/PromptsPage').then((module) => ({ default: module.PromptsPage })))
const MemoryPage = lazy(() => import('./pages/ai/MemoryPage').then((module) => ({ default: module.MemoryPage })))
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
          <Route index element={<KnowledgeHomePage />} />
          <Route path="library" element={<RegulationLibraryPage />} />
          <Route path="library/:documentId" element={<DocumentViewerPage />} />
          <Route path="collections" element={<CollectionsPage />} />
          <Route path="collections/:collectionId" element={<CollectionDetailPage />} />
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
        </Route>

        <Route
          path="reports"
          element={
            <LazyPage>
              <ReportsPage />
            </LazyPage>
          }
        />
        <Route
          path="settings"
          element={
            <LazyPage>
              <SettingsPage />
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
          (item) => !['investigations', 'regulatory-changes'].includes(item.id),
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
