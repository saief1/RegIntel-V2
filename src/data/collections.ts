import type { Collection } from '../types/knowledge'

/** Default collections shown on first load. Fully mutable by the user afterward (see `KnowledgeProvider`). */
export const DEFAULT_COLLECTIONS: Collection[] = [
  {
    id: 'c-01',
    name: 'Q3 Regulatory Review',
    description: 'Items being tracked for this quarter\u2019s regulatory review cycle.',
    documentIds: ['d-01', 'd-18', 'd-07', 'd-05'],
    isFavorite: true,
    isPinned: true,
    createdAt: '2026-04-01T09:00:00.000Z',
    updatedAt: '2026-07-20T14:30:00.000Z',
  },
  {
    id: 'c-02',
    name: 'Data Privacy Watchlist',
    description: 'Cross-jurisdiction privacy developments relevant to data governance.',
    documentIds: ['d-01', 'd-02', 'd-09', 'd-20'],
    isFavorite: true,
    isPinned: false,
    createdAt: '2026-02-14T11:15:00.000Z',
    updatedAt: '2026-06-02T10:00:00.000Z',
  },
  {
    id: 'c-03',
    name: 'AML Program Updates',
    description: 'Beneficial ownership and due-diligence changes affecting the AML program.',
    documentIds: ['d-05', 'd-06', 'd-24'],
    isFavorite: false,
    isPinned: true,
    createdAt: '2026-03-05T16:45:00.000Z',
    updatedAt: '2026-07-30T08:20:00.000Z',
  },
  {
    id: 'c-04',
    name: 'ESG Reporting Prep',
    description: 'Proposed and active disclosure frameworks for next year\u2019s ESG reporting.',
    documentIds: ['d-10', 'd-11'],
    isFavorite: false,
    isPinned: false,
    createdAt: '2026-05-19T13:00:00.000Z',
    updatedAt: '2026-05-19T13:00:00.000Z',
  },
]
