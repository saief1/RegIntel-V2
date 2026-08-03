import type { CollaborationComment, GovernanceEvidence, PolicyRecord } from '../types/governance'
import type { WorkTask } from '../types/work'
import type { KnowledgeDocument } from '../types/knowledge'

export interface EnterpriseSearchHit {
  id: string
  group:
    | 'Policies'
    | 'Regulations'
    | 'Tasks'
    | 'Evidence'
    | 'Reports'
    | 'Comments'
    | 'People'
    | 'Operations'
  title: string
  subtitle?: string
  href: string
}

const OPERATION_DESTINATIONS = [
  { id: 'ops-data', title: 'Data Management Center', subtitle: 'Imports, quality, retention', href: '/settings/data', terms: 'data import export retention archive' },
  { id: 'ops-security', title: 'Enterprise Security Center', subtitle: 'Sessions, MFA, alerts', href: '/settings/security', terms: 'security mfa session device ip secret' },
  { id: 'ops-audit', title: 'Audit & Compliance Center', subtitle: 'Findings and evidence requests', href: '/audit', terms: 'audit finding evidence auditor' },
  { id: 'ops-auto', title: 'Automation Studio', subtitle: 'No-code triggers and actions', href: '/automation', terms: 'automation trigger workflow retry' },
  { id: 'ops-system', title: 'System Health Center', subtitle: 'Queues, uptime, feature flags', href: '/system', terms: 'system health queue uptime performance cache' },
] as const

interface SearchInput {
  query: string
  policies: PolicyRecord[]
  regulations: KnowledgeDocument[]
  tasks: WorkTask[]
  evidence: GovernanceEvidence[]
  comments: CollaborationComment[]
  people: Array<{ id: string; name: string; role: string }>
  reports: Array<{ id: string; title: string; summary: string }>
}

export function enterpriseSearch(input: SearchInput): EnterpriseSearchHit[] {
  const q = input.query.trim().toLowerCase()
  if (!q) return []

  const hits: EnterpriseSearchHit[] = []

  for (const policy of input.policies) {
    if (`${policy.title} ${policy.content}`.toLowerCase().includes(q)) {
      hits.push({
        id: `policy-${policy.id}`,
        group: 'Policies',
        title: policy.title,
        subtitle: policy.status,
        href: `/knowledge/policies/${policy.id}`,
      })
    }
  }

  for (const regulation of input.regulations) {
    if (`${regulation.title} ${regulation.summary ?? ''}`.toLowerCase().includes(q)) {
      hits.push({
        id: `reg-${regulation.id}`,
        group: 'Regulations',
        title: regulation.title,
        subtitle: regulation.jurisdiction,
        href: `/knowledge/library/${regulation.id}`,
      })
    }
  }

  for (const task of input.tasks) {
    if (`${task.title} ${task.description} ${task.linkedRegulation ?? ''}`.toLowerCase().includes(q)) {
      hits.push({
        id: `task-${task.id}`,
        group: 'Tasks',
        title: task.title,
        subtitle: task.status,
        href: `/work/tasks/${task.id}`,
      })
    }
  }

  for (const item of input.evidence) {
    if (`${item.title} ${item.aiMetadata} ${item.note ?? ''}`.toLowerCase().includes(q)) {
      hits.push({
        id: `ev-${item.id}`,
        group: 'Evidence',
        title: item.title,
        subtitle: item.kind,
        href: item.objectType === 'policy' ? `/knowledge/policies/${item.objectId}` : `/work/tasks/${item.objectId}`,
      })
    }
  }

  for (const report of input.reports) {
    if (`${report.title} ${report.summary}`.toLowerCase().includes(q)) {
      hits.push({
        id: `rep-${report.id}`,
        group: 'Reports',
        title: report.title,
        subtitle: report.summary,
        href: '/reports',
      })
    }
  }

  for (const comment of input.comments) {
    if (comment.body.toLowerCase().includes(q)) {
      hits.push({
        id: `cmt-${comment.id}`,
        group: 'Comments',
        title: comment.body.slice(0, 80),
        subtitle: comment.objectType,
        href:
          comment.objectType === 'policy'
            ? `/knowledge/policies/${comment.objectId}`
            : `/work/tasks/${comment.objectId}`,
      })
    }
  }

  for (const person of input.people) {
    if (`${person.name} ${person.role}`.toLowerCase().includes(q)) {
      hits.push({
        id: `people-${person.id}`,
        group: 'People',
        title: person.name,
        subtitle: person.role,
        href: '/settings?tab=org',
      })
    }
  }

  for (const destination of OPERATION_DESTINATIONS) {
    if (`${destination.title} ${destination.subtitle} ${destination.terms}`.toLowerCase().includes(q)) {
      hits.push({
        id: destination.id,
        group: 'Operations',
        title: destination.title,
        subtitle: destination.subtitle,
        href: destination.href,
      })
    }
  }

  // Natural-language style shortcut
  if (q.includes('policy') && (q.includes('fintrac') || q.includes('guidance') || q.includes('aml'))) {
    for (const policy of input.policies.filter((item) => /aml/i.test(item.title))) {
      if (!hits.some((hit) => hit.id === `policy-${policy.id}`)) {
        hits.unshift({
          id: `policy-${policy.id}`,
          group: 'Policies',
          title: policy.title,
          subtitle: 'AI answer: policies affected by FINTRAC / AML guidance',
          href: `/knowledge/policies/${policy.id}`,
        })
      }
    }
  }

  return hits.slice(0, 40)
}
