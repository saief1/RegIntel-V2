import { useCallback, useMemo, useState, type ReactNode } from 'react'
import {
  ANALYTICS_METRICS,
  BENCHMARKS,
  BOARD_SECTIONS,
  BOARD_TEMPLATES,
  BOARD_VERSIONS,
  BOOKMARKS,
  BUSINESS_UNITS,
  DEPARTMENT_PERFORMANCE,
  EXPORT_QUEUE,
  IMPROVEMENTS,
  KPI_CATALOG_METRICS,
  KPI_DEFINITIONS,
  PREDICTIONS,
  REGULATORY_TREND,
  RISK_HEATMAP,
  SAVED_VIEWS,
  SCHEDULED_REPORTS,
} from '../data/analytics/platform'
import { createId } from '../utils/id'
import type {
  BoardPackageVersion,
  BoardTemplate,
  DateRangeKey,
  ExportFormat,
  ExportJob,
  KpiDefinition,
  SavedDashboardView,
  ScheduledReport,
} from '../types/analytics'
import { AnalyticsContext, type AnalyticsContextValue } from './AnalyticsContext'

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const [dateRange, setDateRange] = useState<DateRangeKey>('30d')
  const [businessUnit, setBusinessUnit] = useState('all')
  const [savedViews, setSavedViews] = useState<SavedDashboardView[]>(SAVED_VIEWS)
  const [activeViewId, setActiveViewId] = useState<string | null>(SAVED_VIEWS[0]?.id ?? null)
  const [kpis, setKpis] = useState<KpiDefinition[]>(KPI_DEFINITIONS)
  const [boardSectionOrder, setBoardSectionOrder] = useState<string[]>(BOARD_SECTIONS.map((s) => s.id))
  const [boardTemplates, setBoardTemplates] = useState<BoardTemplate[]>(BOARD_TEMPLATES)
  const [boardVersions, setBoardVersions] = useState<BoardPackageVersion[]>(BOARD_VERSIONS)
  const [benchmarkKind, setBenchmarkKind] = useState<AnalyticsContextValue['benchmarkKind']>('department')
  const [exportQueue, setExportQueue] = useState<ExportJob[]>(EXPORT_QUEUE)
  const [bookmarks, setBookmarks] = useState(BOOKMARKS)
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>(SCHEDULED_REPORTS)

  const filteredDepartments = useMemo(
    () =>
      DEPARTMENT_PERFORMANCE.filter(
        (item) => businessUnit === 'all' || item.businessUnit === businessUnit,
      ),
    [businessUnit],
  )

  const applyView = useCallback((id: string) => {
    const view = savedViews.find((item) => item.id === id)
    if (!view) return
    setActiveViewId(id)
    setDateRange(view.dateRange)
    setBusinessUnit(view.businessUnit)
  }, [savedViews])

  const saveCurrentView = useCallback(
    (name: string) => {
      const view: SavedDashboardView = {
        id: createId('view'),
        name: name.trim() || 'Untitled view',
        dateRange,
        businessUnit,
        favorite: false,
        shared: false,
        permission: 'edit',
        createdAt: new Date().toISOString(),
      }
      setSavedViews((current) => [view, ...current])
      setActiveViewId(view.id)
    },
    [businessUnit, dateRange],
  )

  const createKpi = useCallback(
    (input: Omit<KpiDefinition, 'id' | 'trend' | 'currentValue'> & { currentValue?: number }) => {
      const currentValue = input.currentValue ?? input.goal
      const created: KpiDefinition = {
        ...input,
        id: createId('kpi'),
        currentValue,
        trend: [
          { label: 'T1', value: Math.max(0, currentValue - 3) },
          { label: 'T2', value: Math.max(0, currentValue - 2) },
          { label: 'T3', value: Math.max(0, currentValue - 1) },
          { label: 'T4', value: currentValue },
        ],
      }
      setKpis((current) => [created, ...current])
      return created
    },
    [],
  )

  const moveBoardSection = useCallback((id: string, direction: 'up' | 'down') => {
    setBoardSectionOrder((current) => {
      const index = current.indexOf(id)
      if (index < 0) return current
      const target = direction === 'up' ? index - 1 : index + 1
      if (target < 0 || target >= current.length) return current
      const next = [...current]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }, [])

  const saveBoardTemplate = useCallback(
    (name: string) => {
      const template: BoardTemplate = {
        id: createId('tpl'),
        name: name.trim() || 'Custom template',
        sectionOrder: boardSectionOrder,
        schedule: 'Manual',
        createdAt: new Date().toISOString(),
      }
      setBoardTemplates((current) => [template, ...current])
    },
    [boardSectionOrder],
  )

  const applyBoardTemplate = useCallback(
    (id: string) => {
      const template = boardTemplates.find((item) => item.id === id)
      if (template) setBoardSectionOrder(template.sectionOrder)
    },
    [boardTemplates],
  )

  const generateBoardPackage = useCallback(() => {
    const pack: BoardPackageVersion = {
      id: createId('bv'),
      title: `Board package · ${new Date().toLocaleDateString()}`,
      createdAt: new Date().toISOString(),
      format: 'pdf',
      status: 'queued',
    }
    setBoardVersions((current) => [pack, ...current])
    setExportQueue((current) => [
      {
        id: createId('ex'),
        title: pack.title,
        format: 'pdf',
        status: 'processing',
        createdAt: pack.createdAt,
        destination: 'Exports / Board',
      },
      ...current,
    ])
  }, [])

  const queueExport = useCallback((title: string, format: ExportFormat) => {
    setExportQueue((current) => [
      {
        id: createId('ex'),
        title,
        format,
        status: 'queued',
        createdAt: new Date().toISOString(),
        destination: 'Exports / Analytics',
      },
      ...current,
    ])
  }, [])

  const value = useMemo<AnalyticsContextValue>(
    () => ({
      metrics: ANALYTICS_METRICS,
      heatmap: RISK_HEATMAP,
      regulatoryTrend: REGULATORY_TREND,
      departments: filteredDepartments,
      dateRange,
      setDateRange,
      businessUnit,
      setBusinessUnit,
      savedViews,
      activeViewId,
      applyView,
      saveCurrentView,
      toggleFavoriteView: (id) =>
        setSavedViews((current) =>
          current.map((view) => (view.id === id ? { ...view, favorite: !view.favorite } : view)),
        ),
      toggleSharedView: (id) =>
        setSavedViews((current) =>
          current.map((view) => (view.id === id ? { ...view, shared: !view.shared } : view)),
        ),
      kpis,
      createKpi,
      toggleKpiAlert: (id) =>
        setKpis((current) =>
          current.map((kpi) => (kpi.id === id ? { ...kpi, alertEnabled: !kpi.alertEnabled } : kpi)),
        ),
      kpiCatalogMetrics: KPI_CATALOG_METRICS,
      predictions: PREDICTIONS,
      boardSections: BOARD_SECTIONS,
      boardSectionOrder,
      moveBoardSection,
      boardTemplates,
      saveBoardTemplate,
      applyBoardTemplate,
      boardVersions,
      generateBoardPackage,
      benchmarks: BENCHMARKS,
      improvements: IMPROVEMENTS,
      benchmarkKind,
      setBenchmarkKind,
      exportQueue,
      queueExport,
      bookmarks,
      addBookmark: (label, href) =>
        setBookmarks((current) => [
          { id: createId('bm'), label, href, createdAt: new Date().toISOString() },
          ...current,
        ]),
      scheduledReports,
      toggleScheduledReport: (id) =>
        setScheduledReports((current) =>
          current.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item)),
        ),
      businessUnits: BUSINESS_UNITS,
    }),
    [
      activeViewId,
      applyBoardTemplate,
      applyView,
      benchmarkKind,
      boardSectionOrder,
      boardTemplates,
      boardVersions,
      bookmarks,
      businessUnit,
      createKpi,
      dateRange,
      exportQueue,
      filteredDepartments,
      generateBoardPackage,
      kpis,
      moveBoardSection,
      queueExport,
      saveBoardTemplate,
      saveCurrentView,
      savedViews,
      scheduledReports,
    ],
  )

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>
}
