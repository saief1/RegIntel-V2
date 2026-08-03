import type { Investigation, InvestigationPriority, InvestigationStatus, RiskScoreBand } from '../types/investigations'

export interface InvestigationFilters {
  query: string
  status: InvestigationStatus | 'all'
  ownerId: string | 'all'
  priority: InvestigationPriority | 'all'
  risk: RiskScoreBand | 'all'
  regulationId: string | 'all'
  jurisdiction: string | 'all'
  dateFrom: string
  dateTo: string
}

export const DEFAULT_INVESTIGATION_FILTERS: InvestigationFilters = {
  query: '',
  status: 'all',
  ownerId: 'all',
  priority: 'all',
  risk: 'all',
  regulationId: 'all',
  jurisdiction: 'all',
  dateFrom: '',
  dateTo: '',
}

export function filterInvestigations(
  items: Investigation[],
  filters: InvestigationFilters,
): Investigation[] {
  const normalized = filters.query.trim().toLowerCase()
  return items.filter((item) => {
    if (normalized) {
      const haystack = `${item.title} ${item.caseId} ${item.summary} ${item.relatedRegulationTitle} ${item.tags.join(' ')}`.toLowerCase()
      if (!haystack.includes(normalized)) return false
    }
    if (filters.status !== 'all' && item.status !== filters.status) return false
    if (filters.ownerId !== 'all' && item.ownerId !== filters.ownerId) return false
    if (filters.priority !== 'all' && item.priority !== filters.priority) return false
    if (filters.risk !== 'all' && item.riskBand !== filters.risk) return false
    if (filters.regulationId !== 'all' && item.relatedRegulationId !== filters.regulationId) return false
    if (filters.jurisdiction !== 'all' && item.jurisdiction !== filters.jurisdiction) return false
    if (filters.dateFrom && item.createdAt < filters.dateFrom) return false
    if (filters.dateTo && item.createdAt > `${filters.dateTo}T23:59:59.999Z`) return false
    return true
  })
}
