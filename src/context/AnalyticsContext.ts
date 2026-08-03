import { createContext } from 'react'
import type {
  AnalyticsMetric,
  BenchmarkEntity,
  BoardPackageVersion,
  BoardSection,
  BoardTemplate,
  DateRangeKey,
  DepartmentPerformance,
  ExecutiveBookmark,
  ExportFormat,
  ExportJob,
  HeatmapCell,
  ImprovementOpportunity,
  KpiDefinition,
  PredictionItem,
  SavedDashboardView,
  ScheduledReport,
  TrendPoint,
} from '../types/analytics'

export interface AnalyticsContextValue {
  metrics: AnalyticsMetric[]
  heatmap: HeatmapCell[]
  regulatoryTrend: TrendPoint[]
  departments: DepartmentPerformance[]
  dateRange: DateRangeKey
  setDateRange: (range: DateRangeKey) => void
  businessUnit: string
  setBusinessUnit: (unit: string) => void
  savedViews: SavedDashboardView[]
  activeViewId: string | null
  applyView: (id: string) => void
  saveCurrentView: (name: string) => void
  toggleFavoriteView: (id: string) => void
  toggleSharedView: (id: string) => void

  kpis: KpiDefinition[]
  createKpi: (input: Omit<KpiDefinition, 'id' | 'trend' | 'currentValue'> & { currentValue?: number }) => KpiDefinition
  toggleKpiAlert: (id: string) => void
  kpiCatalogMetrics: string[]

  predictions: PredictionItem[]

  boardSections: BoardSection[]
  boardSectionOrder: string[]
  moveBoardSection: (id: string, direction: 'up' | 'down') => void
  boardTemplates: BoardTemplate[]
  saveBoardTemplate: (name: string) => void
  applyBoardTemplate: (id: string) => void
  boardVersions: BoardPackageVersion[]
  generateBoardPackage: () => void

  benchmarks: BenchmarkEntity[]
  improvements: ImprovementOpportunity[]
  benchmarkKind: BenchmarkEntity['kind'] | 'all'
  setBenchmarkKind: (kind: BenchmarkEntity['kind'] | 'all') => void

  exportQueue: ExportJob[]
  queueExport: (title: string, format: ExportFormat) => void
  bookmarks: ExecutiveBookmark[]
  addBookmark: (label: string, href: string) => void
  scheduledReports: ScheduledReport[]
  toggleScheduledReport: (id: string) => void
  businessUnits: readonly string[]
}

export const AnalyticsContext = createContext<AnalyticsContextValue | null>(null)
