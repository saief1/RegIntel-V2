import type { AiWorkSuggestion } from '../../types/work'

export const WORK_SUGGESTIONS: AiWorkSuggestion[] = [
  {
    id: 'sug-01',
    caseId: 'case-01',
    kind: 'action',
    title: 'Request counsel confirmation',
    detail: 'Residual transfer risk is still open. Confirm whether an additional TOM schedule is required.',
  },
  {
    id: 'sug-02',
    caseId: 'case-01',
    kind: 'regulation',
    title: 'Review related guidance',
    detail: 'Guidance on Data Subject Access Request Timelines may affect processor attestations tied to this renewal set.',
    documentId: 'd-07',
  },
  {
    id: 'sug-03',
    caseId: 'case-01',
    kind: 'missing_evidence',
    title: 'Missing evidence',
    detail: 'No verified evidence yet for cloud subprocessor TOMs referenced in counsel notes.',
  },
  {
    id: 'sug-04',
    caseId: 'case-01',
    kind: 'risk',
    title: 'Risk observation',
    detail: 'High residual risk if Q3 renewals proceed on the prior annex language.',
  },
  {
    id: 'sug-05',
    caseId: 'case-01',
    kind: 'next_step',
    title: 'Next step',
    detail: 'Complete counsel review task and notify procurement of impacted renewals.',
  },
  {
    id: 'sug-06',
    caseId: 'case-02',
    kind: 'action',
    title: 'Finish KYC field mapping',
    detail: 'CRM export is attached but not yet mapped to the beneficial ownership amendment.',
  },
  {
    id: 'sug-07',
    caseId: 'case-02',
    kind: 'missing_evidence',
    title: 'Missing evidence',
    detail: 'No remediation owners matrix has been uploaded yet.',
  },
  {
    id: 'sug-08',
    caseId: 'case-02',
    kind: 'risk',
    title: 'Risk observation',
    detail: 'Critical risk while onboarding continues without verified beneficial ownership capture.',
  },
]
