/**
 * Industry Solution Packs domain (Sprint 17).
 * Local/mock only — marketplace and industry packs.
 */

export type SolutionId =
  | 'wealth'
  | 'banking'
  | 'insurance'
  | 'asset_management'
  | 'credit_union'
  | 'fintech'
  | 'payments'
  | 'capital_markets'
  | 'pension'
  | 'grc'

export type SolutionInstallState = 'available' | 'preview' | 'installed' | 'updating'

export interface SolutionPackCard {
  id: SolutionId
  name: string
  tagline: string
  description: string
  version: string
  releaseNotes: string
  modules: string[]
  dashboards: string[]
  aiAgents: string[]
  templates: string[]
  playbooks: string[]
  regulatoryLibraries: string[]
  state: SolutionInstallState
  flagship?: boolean
  href?: string
}

export interface SolutionMetric {
  id: string
  label: string
  value: string
  hint: string
}

export interface SolutionDashboardPanel {
  id: string
  title: string
  summary: string
  items: string[]
}

export interface SolutionAiTemplate {
  id: string
  title: string
  prompt: string
  category: string
}

export interface SolutionPreset {
  id: string
  kind: 'workflow' | 'policy' | 'report' | 'dashboard' | 'library'
  title: string
  detail: string
}

export interface WealthPackData {
  targets: string[]
  regulators: string[]
  metrics: SolutionMetric[]
  dashboards: SolutionDashboardPanel[]
  aiTemplates: SolutionAiTemplate[]
  presets: SolutionPreset[]
}

export interface BankingPackData {
  modules: string[]
  metrics: SolutionMetric[]
  dashboards: SolutionDashboardPanel[]
  heatmap: Array<{ area: string; score: number; residual: 'low' | 'medium' | 'high' }>
}

export interface InsurancePackData {
  modules: string[]
  metrics: SolutionMetric[]
  agentSupervision: Array<{ agent: string; reviewsDue: number; complaints: number; status: string }>
  calendar: Array<{ date: string; title: string }>
  aiReviews: SolutionAiTemplate[]
}

export interface GrcPackData {
  modules: string[]
  metrics: SolutionMetric[]
  riskMatrix: Array<{ likelihood: number; impact: number; label: string }>
  controlCoverage: Array<{ domain: string; pct: number }>
  auditUniverse: string[]
  controlTesting: Array<{ control: string; lastTested: string; result: string }>
}
