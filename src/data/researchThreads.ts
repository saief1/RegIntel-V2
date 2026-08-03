import type { ResearchThread } from '../types/knowledge'

/** Seed conversation history shown in the AI Research panel on first load. */
export const DEFAULT_RESEARCH_THREADS: ResearchThread[] = [
  {
    id: 'rt-01',
    title: 'Cross-border transfer obligations summary',
    updatedAt: '2026-07-28T15:42:00.000Z',
    messages: [
      {
        id: 'rt-01-m1',
        role: 'user',
        content: 'Summarize the cross-border data transfer obligations that changed this year.',
        createdAt: '2026-07-28T15:40:00.000Z',
      },
      {
        id: 'rt-01-m2',
        role: 'assistant',
        content:
          'The main update is the revised standard contractual clause requirements for processors handling cross-border transfers, effective this January. It also tightens documentation expectations for transfer impact assessments. A related guidance note clarifies response timelines for data subject access requests, which teams often review alongside this change.',
        citations: [
          {
            id: 'rt-01-c1',
            documentId: 'd-01',
            documentTitle: 'Data Privacy Regulation Update — Cross-Border Transfer Provisions',
            sectionHeading: 'Key Obligations',
            snippet: 'Core obligations include maintaining accurate records, implementing appropriate internal controls...',
          },
          {
            id: 'rt-01-c2',
            documentId: 'd-02',
            documentTitle: 'Guidance on Data Subject Access Request Timelines',
            sectionHeading: 'Overview',
            snippet: 'Clarifies acceptable response windows and extension criteria for data subject access requests.',
          },
        ],
        createdAt: '2026-07-28T15:42:00.000Z',
      },
    ],
  },
  {
    id: 'rt-02',
    title: 'AML beneficial ownership scope',
    updatedAt: '2026-07-15T09:05:00.000Z',
    messages: [
      {
        id: 'rt-02-m1',
        role: 'user',
        content: 'Which entity types were added to the beneficial ownership reporting scope?',
        createdAt: '2026-07-15T09:03:00.000Z',
      },
      {
        id: 'rt-02-m2',
        role: 'assistant',
        content:
          'The amendment expands beneficial ownership reporting to additional entity types beyond the categories previously in scope. It works alongside the enhanced due diligence guidance, which sets a risk-based approach for higher-risk customer relationships.',
        citations: [
          {
            id: 'rt-02-c1',
            documentId: 'd-05',
            documentTitle: 'Anti-Money Laundering Amendment — Beneficial Ownership Reporting',
            sectionHeading: 'Scope & Applicability',
            snippet: 'Applicability is determined by the entity\u2019s activities within United Kingdom...',
          },
        ],
        createdAt: '2026-07-15T09:05:00.000Z',
      },
    ],
  },
]
