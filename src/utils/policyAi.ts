/** Local heuristic AI helpers for the Policy Assistant. */

export function rewritePolicy(content: string): string {
  return `${content.trim()}\n\n[AI rewrite] Clarified obligations, owners, and evidence expectations for operational use.`
}

export function simplifyPolicy(content: string): string {
  const sentences = content
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean)
    .slice(0, 4)
  return `Simplified summary:\n- ${sentences.join('\n- ')}`
}

export function findConflicts(content: string): string[] {
  const conflicts: string[] = []
  if (/annual/i.test(content) && /quarterly/i.test(content)) {
    conflicts.push('Review cadence mentions both annual and quarterly expectations.')
  }
  if (/must/i.test(content) && /may/i.test(content)) {
    conflicts.push('Obligation language mixes mandatory (“must”) and discretionary (“may”) terms.')
  }
  if (conflicts.length === 0) conflicts.push('No hard conflicts detected in local heuristics.')
  return conflicts
}

export function mapToRegulationHints(content: string): string[] {
  const hints: string[] = []
  if (/beneficial|aml|kyc/i.test(content)) hints.push('AML Beneficial Ownership Rule')
  if (/incident|cyber|notification/i.test(content)) hints.push('Cybersecurity Incident Reporting Notice')
  if (/transfer|subprocessor|scc/i.test(content)) hints.push('Cross-border Transfer Clause Update')
  if (/dsar|access request/i.test(content)) hints.push('DSAR Timeline Guidance')
  if (hints.length === 0) hints.push('No direct regulation mapping inferred — attach linked regulations manually.')
  return hints
}

export function generatePolicySummary(content: string): string {
  return `Executive summary: ${content.slice(0, 180).trim()}…`
}

export function draftRevision(content: string): string {
  return `${content.trim()}\n\n## Proposed revision\n- Clarify owner accountability\n- Add evidence retention expectations\n- Align review cadence with residual risk`
}
