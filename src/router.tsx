import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell/AppShell'
import { RouteFallback } from './components/layout/RouteFallback/RouteFallback'
import { NAV_ITEMS } from './config/navigation'
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
const AIWorkspacePage = lazy(() =>
  import('./pages/ai/AIWorkspacePage').then((module) => ({ default: module.AIWorkspacePage })),
)
const PromptsPage = lazy(() => import('./pages/ai/PromptsPage').then((module) => ({ default: module.PromptsPage })))
const MemoryPage = lazy(() => import('./pages/ai/MemoryPage').then((module) => ({ default: module.MemoryPage })))

const BUILT_OUT_NAV_ITEM_IDS = new Set(['knowledge', 'work', 'ai'])

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
        </Route>

        <Route path="work">
          <Route
            index
            element={
              <Suspense fallback={<RouteFallback />}>
                <WorkDashboardPage />
              </Suspense>
            }
          />
          <Route
            path="cases"
            element={
              <Suspense fallback={<RouteFallback />}>
                <CasesPage />
              </Suspense>
            }
          />
          <Route
            path="cases/:caseId"
            element={
              <Suspense fallback={<RouteFallback />}>
                <CaseDetailPage />
              </Suspense>
            }
          />
        </Route>

        <Route path="ai">
          <Route
            index
            element={
              <Suspense fallback={<RouteFallback />}>
                <AIWorkspacePage />
              </Suspense>
            }
          />
          <Route
            path="prompts"
            element={
              <Suspense fallback={<RouteFallback />}>
                <PromptsPage />
              </Suspense>
            }
          />
          <Route
            path="memory"
            element={
              <Suspense fallback={<RouteFallback />}>
                <MemoryPage />
              </Suspense>
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
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
