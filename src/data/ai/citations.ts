import type { AiCitation } from '../../types/ai'

export const AI_CITATIONS: AiCitation[] = [
  {
    id: 'cite-01',
    kind: 'regulation',
    title: 'Data Privacy Regulation Update — Cross-Border Transfer Provisions',
    subtitle: 'European Union · Active',
    href: '/knowledge/library/d-01',
    snippet: 'Updated contractual clause requirements for cross-border transfers.',
  },
  {
    id: 'cite-02',
    kind: 'regulation',
    title: 'Anti-Money Laundering Amendment — Beneficial Ownership Reporting',
    subtitle: 'United Kingdom · Active',
    href: '/knowledge/library/d-05',
    snippet: 'Beneficial ownership capture expectations for in-scope entities.',
  },
  {
    id: 'cite-03',
    kind: 'document',
    title: 'Guidance on Data Subject Access Request Timelines',
    subtitle: 'Guidance',
    href: '/knowledge/library/d-07',
    snippet: 'Processor response windows and attestation expectations.',
  },
  {
    id: 'cite-04',
    kind: 'case',
    title: 'CASE-2026-014 · Cross-border transfer clause review',
    subtitle: 'In review · High risk',
    href: '/work/cases/case-01',
    snippet: 'Open review for Q3 renewal clause language.',
  },
  {
    id: 'cite-05',
    kind: 'evidence',
    title: 'Vendor_Master_Agreement_Annex_B.pdf',
    subtitle: 'Verified evidence',
    href: '/work/cases/case-01',
    snippet: 'Current transfer clause annex used in EU renewals.',
  },
  {
    id: 'cite-06',
    kind: 'case',
    title: 'CASE-2026-018 · AML beneficial ownership gap analysis',
    subtitle: 'Open · Critical',
    href: '/work/cases/case-02',
    snippet: 'KYC field mapping against beneficial ownership amendment.',
  },
]

export function getCitation(id: string): AiCitation | undefined {
  return AI_CITATIONS.find((item) => item.id === id)
}
