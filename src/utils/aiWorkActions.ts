import type { AiActionType, GeneratedChecklistSeed, Priority, WorkItemKind } from '../types/work'
import { estimateSmartDue } from './smartDueDates'

export const AI_ACTION_OPTIONS: { type: AiActionType; label: string; kind: WorkItemKind }[] = [
  { type: 'create_task', label: 'Create Task', kind: 'task' },
  { type: 'create_project', label: 'Create Project', kind: 'project' },
  { type: 'update_policy', label: 'Update Policy', kind: 'policy_update' },
  { type: 'generate_checklist', label: 'Generate Checklist', kind: 'task' },
  { type: 'create_control', label: 'Create Control', kind: 'task' },
  { type: 'assign_owner', label: 'Assign Owner', kind: 'task' },
  { type: 'schedule_review', label: 'Schedule Review', kind: 'risk_review' },
  { type: 'add_to_board', label: 'Add to Board Report', kind: 'board_item' },
]

export const AI_FOLLOW_UP_ACTIONS = [
  'Create Action Plan',
  'Generate Executive Summary',
  'Compare Existing Policy',
  'Assign Tasks',
  'Draft Communication',
  'Review Controls',
] as const

/** Seed implementation tasks after an AI analysis. */
export function generateImplementationTasks(prompt: string): GeneratedChecklistSeed {
  const normalized = prompt.toLowerCase()

  if (normalized.includes('cyber') || normalized.includes('incident') || normalized.includes('security')) {
    return {
      title: 'Cybersecurity Notice — Implementation',
      linkedRegulation: 'Cybersecurity Incident Reporting Notice',
      estimate: estimateSmartDue('high', 'policy_update', {
        recommendedDays: 14,
        estimatedHours: 16,
        businessImpact: 'High',
      }),
      items: [
        'Review cybersecurity policy',
        'Update incident reporting SOP',
        'Notify technology team',
        'Review vendor controls',
        'Board approval',
        'Staff training',
        'Evidence collection',
      ],
    }
  }

  if (normalized.includes('aml') || normalized.includes('beneficial') || normalized.includes('kyc')) {
    return {
      title: 'AML / Beneficial Ownership — Implementation',
      linkedRegulation: 'AML Beneficial Ownership Rule',
      estimate: estimateSmartDue('urgent', 'risk_review', {
        recommendedDays: 7,
        estimatedHours: 20,
        businessImpact: 'Critical',
      }),
      items: [
        'Inventory KYC fields in CRM',
        'Map fields to regulation',
        'Update onboarding policy',
        'Assign remediation owners',
        'Notify product & ops',
        'Board briefing draft',
        'Collect mapping evidence',
      ],
    }
  }

  if (normalized.includes('transfer') || normalized.includes('privacy') || normalized.includes('cross-border')) {
    return {
      title: 'Cross-border Transfer — Implementation',
      linkedRegulation: 'Cross-border Transfer Clause Update',
      estimate: estimateSmartDue('high', 'policy_update'),
      items: [
        'Review contractual clauses',
        'Identify impacted controls',
        'Update transfer annex language',
        'Notify procurement',
        'Counsel confirmation',
        'Attach TOM schedule',
        'Evidence uploaded',
      ],
    }
  }

  return {
    title: 'Implementation Tasks',
    linkedRegulation: 'Regulatory change',
    estimate: estimateSmartDue('medium', 'task'),
    items: [
      'Review requirements',
      'Identify impacted controls',
      'Update policies',
      'Notify stakeholders',
      'Board approval',
      'Training',
      'Evidence uploaded',
    ],
  }
}

export function defaultTitleForAction(type: AiActionType, sourceTitle?: string): string {
  const base = sourceTitle?.trim() || 'AI recommendation'
  switch (type) {
    case 'create_project':
      return `Project: ${base}`
    case 'update_policy':
      return `Policy update: ${base}`
    case 'create_control':
      return `Control: ${base}`
    case 'schedule_review':
      return `Review: ${base}`
    case 'add_to_board':
      return `Board item: ${base}`
    case 'assign_owner':
      return `Assign owner: ${base}`
    case 'generate_checklist':
      return `Checklist: ${base}`
    default:
      return base
  }
}

export function priorityFromImpact(impact?: string): Priority {
  const value = (impact ?? '').toLowerCase()
  if (value.includes('critical')) return 'urgent'
  if (value.includes('high')) return 'high'
  if (value.includes('low')) return 'low'
  return 'medium'
}
