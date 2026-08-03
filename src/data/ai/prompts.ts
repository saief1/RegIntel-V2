import type { PromptCategoryId, PromptTemplate } from '../../types/ai'

export const PROMPT_CATEGORIES: { id: PromptCategoryId; label: string; description: string }[] = [
  { id: 'investigation', label: 'Investigation', description: 'Structure reviews and gather facts.' },
  { id: 'research', label: 'Research', description: 'Locate and summarize regulatory material.' },
  { id: 'risk', label: 'Risk Assessment', description: 'Score exposure and residual risk.' },
  { id: 'compliance', label: 'Compliance', description: 'Map obligations to controls.' },
  { id: 'policies', label: 'Policies', description: 'Draft and compare policy language.' },
  { id: 'reporting', label: 'Reporting', description: 'Prepare board and regulator-facing summaries.' },
  { id: 'drafting', label: 'Drafting', description: 'Produce responses, memos, and clauses.' },
]

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'prompt-01',
    title: 'Summarize cross-border transfer changes',
    description: 'Produce a concise summary of material changes affecting transfer clauses.',
    category: 'research',
    prompt: 'Summarize this year\'s material cross-border data transfer obligations and cite supporting regulations.',
    isFavorite: true,
  },
  {
    id: 'prompt-02',
    title: 'Investigation checklist for an open case',
    description: 'Generate a structured checklist for a compliance investigation.',
    category: 'investigation',
    prompt: 'Create an investigation checklist for an open cross-border transfer review, including evidence gaps and owners.',
    isFavorite: true,
  },
  {
    id: 'prompt-03',
    title: 'Assess residual transfer risk',
    description: 'Evaluate residual risk if renewals proceed on prior annex language.',
    category: 'risk',
    prompt: 'Assess residual risk if Q3 renewals proceed on the prior transfer annex. Include confidence and mitigations.',
    isFavorite: false,
  },
  {
    id: 'prompt-04',
    title: 'Map AML beneficial ownership gaps',
    description: 'Compare KYC capture to beneficial ownership reporting requirements.',
    category: 'compliance',
    prompt: 'Map current KYC fields against the UK beneficial ownership amendment and list remediation owners.',
    isFavorite: false,
  },
  {
    id: 'prompt-05',
    title: 'Draft policy update memo',
    description: 'Draft an internal memo describing a policy change and next steps.',
    category: 'policies',
    prompt: 'Draft an internal policy memo describing updated incident reporting timelines and required runbook changes.',
    isFavorite: false,
  },
  {
    id: 'prompt-06',
    title: 'Board-ready disclosure summary',
    description: 'Prepare a short board pack summary of disclosure readiness.',
    category: 'reporting',
    prompt: 'Prepare a board-ready summary of disclosure checklist readiness, risks, and open actions.',
    isFavorite: true,
  },
  {
    id: 'prompt-07',
    title: 'Draft counsel follow-up',
    description: 'Draft a concise follow-up note to counsel on residual risk.',
    category: 'drafting',
    prompt: 'Draft a concise follow-up to counsel requesting confirmation on residual transfer risk and TOM schedules.',
    isFavorite: false,
  },
  {
    id: 'prompt-08',
    title: 'Find related cases and evidence',
    description: 'Locate related open cases and missing evidence for a topic.',
    category: 'investigation',
    prompt: 'Find related cases and missing evidence for AML beneficial ownership reviews currently in progress.',
    isFavorite: false,
  },
]
