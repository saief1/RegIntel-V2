import { AI_CITATIONS } from '../data/ai/citations'
import type { AiCitation, AiWorkspaceSettings, ChatMessage } from '../types/ai'
import { createId } from './id'

/**
 * Local heuristic “model” for the Copilot Workspace.
 * Returns structured answers with citations — ready to be replaced by a
 * real provider adapter later without changing UI contracts.
 */
export function answerCopilotPrompt(
  prompt: string,
  settings: AiWorkspaceSettings,
): { content: string; citations: AiCitation[]; followUps: string[]; confidence: number } {
  const normalized = prompt.toLowerCase()
  const lengthNote =
    settings.responseLength === 'concise'
      ? 'Keeping this concise.'
      : settings.responseLength === 'detailed'
        ? 'Expanding with additional operational detail.'
        : 'Balanced level of detail.'

  if (normalized.includes('transfer') || normalized.includes('privacy') || normalized.includes('cross-border')) {
    return {
      content: [
        `${lengthNote}`,
        '',
        '## Cross-border transfer outlook',
        '',
        '- Revised contractual clauses apply to subprocessors and renewal packs.',
        '- Retain annex versions used at signature.',
        '- Residual risk may require an additional TOM schedule.',
        '',
        '| Item | Status |',
        '| --- | --- |',
        '| Clause review | In progress |',
        '| Counsel confirmation | Open |',
        '',
        '```text',
        'Suggested owners: Counsel → Procurement',
        '```',
      ].join('\n'),
      citations: pickCitations(['cite-01', 'cite-03', 'cite-04', 'cite-05']),
      followUps: [
        'What evidence is still missing?',
        'Draft a counsel follow-up.',
        'List affected Q3 renewals.',
      ],
      confidence: 0.88,
    }
  }

  if (normalized.includes('aml') || normalized.includes('beneficial') || normalized.includes('kyc')) {
    return {
      content: [
        `${lengthNote}`,
        '',
        '## Beneficial ownership exposure',
        '',
        '1. Regulation expands capture expectations for in-scope entities.',
        '2. CRM export exists, but mapping is incomplete.',
        '3. Critical risk remains until onboarding fields are verified.',
        '',
        'Next step: finish field mapping, then assign remediation owners.',
      ].join('\n'),
      citations: pickCitations(['cite-02', 'cite-06']),
      followUps: ['List unmapped KYC fields.', 'Suggest remediation owners.'],
      confidence: 0.85,
    }
  }

  if (normalized.includes('incident') || normalized.includes('cyber') || normalized.includes('reporting')) {
    return {
      content: [
        `${lengthNote}`,
        '',
        'Incident reporting timers need runbook updates. The open blocker is legal confirmation of when the notification clock starts.',
      ].join('\n'),
      citations: pickCitations(['cite-01']),
      followUps: ['Draft an escalation note.', 'What evidence supports the current timer?'],
      confidence: 0.8,
    }
  }

  if (normalized.includes('evidence') || normalized.includes('missing')) {
    return {
      content: [
        `${lengthNote}`,
        '',
        'Missing evidence hotspots:',
        '',
        '- Cloud subprocessor TOMs on CASE-2026-014',
        '- Remediation owners matrix on CASE-2026-018',
        '',
        'Attach verified artifacts before recording a final decision.',
      ].join('\n'),
      citations: pickCitations(['cite-04', 'cite-05', 'cite-06']),
      followUps: ['Open CASE-2026-014', 'Suggest an evidence checklist'],
      confidence: 0.83,
    }
  }

  return {
    content: [
      `${lengthNote}`,
      '',
      'I can help with regulatory research, case investigations, evidence gaps, and drafting.',
      '',
      'Try asking about **cross-border transfers**, **AML beneficial ownership**, or **missing evidence**.',
    ].join('\n'),
    citations: pickCitations(['cite-01', 'cite-02']),
    followUps: [
      'Summarize cross-border transfer changes.',
      'Where are we exposed on beneficial ownership?',
      'What evidence is missing on open cases?',
    ],
    confidence: 0.72,
  }
}

export function buildAssistantMessage(
  prompt: string,
  settings: AiWorkspaceSettings,
): ChatMessage {
  const result = answerCopilotPrompt(prompt, settings)
  return {
    id: createId('msg'),
    role: 'assistant',
    content: result.content,
    createdAt: new Date().toISOString(),
    citations: settings.autoReferences ? result.citations : [],
    confidence: result.confidence,
  }
}

function pickCitations(ids: string[]): AiCitation[] {
  return ids.map((id) => AI_CITATIONS.find((item) => item.id === id)).filter((item): item is AiCitation => Boolean(item))
}
