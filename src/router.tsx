import { Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell/AppShell'
import { NAV_ITEMS } from './config/navigation'
import { ComingSoonPage } from './pages/ComingSoonPage'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { CollectionDetailPage } from './pages/knowledge/CollectionDetailPage'
import { CollectionsPage } from './pages/knowledge/CollectionsPage'
import { DocumentViewerPage } from './pages/knowledge/DocumentViewerPage'
import { KnowledgeHomePage } from './pages/knowledge/KnowledgeHomePage'
import { RegulationLibraryPage } from './pages/knowledge/RegulationLibraryPage'

/**
 * Every non-home nav destination falls back to `ComingSoonPage` except
 * `knowledge`, which Sprint 3 builds out fully (see the nested routes
 * below). Keep this list in sync as future sprints add more sections.
 */
const BUILT_OUT_NAV_ITEM_IDS = new Set(['knowledge'])

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
