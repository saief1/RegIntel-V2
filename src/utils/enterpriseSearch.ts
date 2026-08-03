import { MARKETPLACE_CONNECTORS } from '../data/ecosystem/platform'
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
    | 'Integrations'
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
  { id: 'ops-market', title: 'Integration Marketplace', subtitle: 'Enterprise connectors', href: '/integrations/marketplace', terms: 'marketplace connector slack jira servicenow okta' },
  { id: 'ops-builder', title: 'Integration Builder', subtitle: 'Custom REST GraphQL webhooks', href: '/integrations/builder', terms: 'builder rest graphql webhook sync' },
  { id: 'ops-canvas', title: 'Workflow Studio 2.0', subtitle: 'Visual workflow canvas', href: '/automation/canvas', terms: 'canvas workflow nodes publish rollback' },
  { id: 'ops-lineage', title: 'Data Lineage', subtitle: 'Dependency and impact graph', href: '/data/lineage', terms: 'lineage dependency impact regulation policy' },
  { id: 'ops-twin', title: 'Executive Digital Twin', subtitle: 'Organization simulation', href: '/reports/digital-twin', terms: 'digital twin simulation forecast capacity' },
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

  for (const connector of MARKETPLACE_CONNECTORS) {
    if (
      `${connector.name} ${connector.vendor} ${connector.category} ${connector.description}`
        .toLowerCase()
        .includes(q)
    ) {
      hits.push({
        id: `int-${connector.id}`,
        group: 'Integrations',
        title: connector.name,
        subtitle: `${connector.vendor} · ${connector.category.replace(/_/g, ' ')} · ${connector.state}`,
        href: '/integrations/marketplace',
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
