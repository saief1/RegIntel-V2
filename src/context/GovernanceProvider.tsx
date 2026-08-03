import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { APPROVAL_REQUESTS } from '../data/governance/approvals'
import {
  AUDIT_EVENTS,
  CALENDAR_ITEMS,
  COMMENTS,
  GOVERNANCE_EVIDENCE,
  IMPACT_ANALYSES,
  MAPPINGS,
  REPORTS,
} from '../data/governance/audit'
import {
  BUSINESS_UNITS,
  CONTROLS,
  DEPARTMENTS,
  ENTERPRISE_ROLES,
  LOCATIONS,
  RISKS,
  ROLE_ASSIGNMENTS,
  TEAMS,
} from '../data/governance/org'
import { POLICIES, POLICY_VERSIONS } from '../data/governance/policies'
import { AUTOMATION_RULES, WORKFLOWS, WORKFLOW_TEMPLATES } from '../data/governance/workflows'
import { createId } from '../utils/id'
import { can as userCan, getRoleForUser } from '../utils/rbac'
import type {
  ApprovalDecision,
  ApprovalRequest,
  AuditEvent,
  AutomationRule,
  CollaborationComment,
  GeneratedReport,
  GovernanceEvidence,
  PolicyRecord,
  PolicyVersion,
  ReportKind,
  ExportFormat,
  WorkflowDefinition,
  WorkflowNode,
} from '../types/governance'
import { GovernanceContext, type GovernanceContextValue } from './GovernanceContext'

const CURRENT_USER_ID = 'u-01'

export function GovernanceProvider({ children }: { children: ReactNode }) {
  const [policies, setPolicies] = useState<PolicyRecord[]>(POLICIES)
  const [versions, setVersions] = useState<PolicyVersion[]>(POLICY_VERSIONS)
  const [approvals, setApprovals] = useState<ApprovalRequest[]>(APPROVAL_REQUESTS)
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>(WORKFLOWS)
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(AUDIT_EVENTS)
  const [evidence, setEvidence] = useState<GovernanceEvidence[]>(GOVERNANCE_EVIDENCE)
  const [comments, setComments] = useState<CollaborationComment[]>(COMMENTS)
  const [automations, setAutomations] = useState<AutomationRule[]>(AUTOMATION_RULES)
  const [reports, setReports] = useState<GeneratedReport[]>(REPORTS)

  const pushAudit = useCallback(
    (event: Omit<AuditEvent, 'id' | 'createdAt' | 'actorId'> & { actorId?: string }) => {
      setAuditEvents((current) => [
        {
          id: createId('aud'),
          actorId: event.actorId ?? CURRENT_USER_ID,
          createdAt: new Date().toISOString(),
          ...event,
        },
        ...current,
      ])
    },
    [],
  )

  const getPolicy = useCallback((id: string) => policies.find((item) => item.id === id), [policies])
  const getVersions = useCallback(
    (policyId: string) =>
      versions
        .filter((item) => item.policyId === policyId)
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [versions],
  )

  const updatePolicyContent = useCallback(
    (policyId: string, content: string, summary = 'AI / editor revision') => {
      const policy = policies.find((item) => item.id === policyId)
      if (!policy) return
      const versionNumber = `${Number(policy.currentVersionId.includes('draft') ? 0.9 : 2) + 0.1}`.slice(0, 3)
      const version: PolicyVersion = {
        id: createId('pv'),
        policyId,
        version: versionNumber,
        label: `v${versionNumber}`,
        content,
        summary,
        createdAt: new Date().toISOString(),
        createdById: CURRENT_USER_ID,
        isCurrent: true,
      }
      setVersions((current) => [
        version,
        ...current.map((item) => (item.policyId === policyId ? { ...item, isCurrent: false } : item)),
      ])
      setPolicies((current) =>
        current.map((item) =>
          item.id === policyId
            ? {
                ...item,
                content,
                currentVersionId: version.id,
                status: 'in_review',
                approvalStatus: 'pending',
                updatedAt: new Date().toISOString(),
              }
            : item,
        ),
      )
      pushAudit({
        action: 'edited',
        objectType: 'policy',
        objectId: policyId,
        objectTitle: policy.title,
        detail: summary,
      })
    },
    [policies, pushAudit],
  )

  const restoreVersion = useCallback(
    (policyId: string, versionId: string) => {
      const version = versions.find((item) => item.id === versionId && item.policyId === policyId)
      const policy = policies.find((item) => item.id === policyId)
      if (!version || !policy) return
      updatePolicyContent(policyId, version.content, `Restored ${version.label}`)
      pushAudit({
        action: 'restored',
        objectType: 'policy',
        objectId: policyId,
        objectTitle: policy.title,
        detail: `Restored ${version.label}`,
      })
    },
    [policies, pushAudit, updatePolicyContent, versions],
  )

  const publishPolicy = useCallback(
    (policyId: string) => {
      const policy = policies.find((item) => item.id === policyId)
      if (!policy) return
      setPolicies((current) =>
        current.map((item) =>
          item.id === policyId
            ? {
                ...item,
                status: 'published',
                approvalStatus: 'approved',
                updatedAt: new Date().toISOString(),
              }
            : item,
        ),
      )
      pushAudit({
        action: 'published',
        objectType: 'policy',
        objectId: policyId,
        objectTitle: policy.title,
        detail: 'Policy published',
      })
    },
    [policies, pushAudit],
  )

  const getApprovalForPolicy = useCallback(
    (policyId: string) => approvals.find((item) => item.objectType === 'policy' && item.objectId === policyId),
    [approvals],
  )

  const decideApprovalStep = useCallback(
    (approvalId: string, stepId: string, decision: ApprovalDecision, comments: string) => {
      setApprovals((current) =>
        current.map((request) => {
          if (request.id !== approvalId) return request
          const steps = request.steps.map((step) =>
            step.id === stepId
              ? {
                  ...step,
                  decision,
                  comments,
                  decidedAt: new Date().toISOString(),
                }
              : step,
          )
          const pending = steps.some((step) => step.decision === 'pending')
          const rejected = steps.some((step) => step.decision === 'rejected')
          return {
            ...request,
            steps,
            status: rejected ? 'rejected' : pending ? 'pending' : 'approved',
            updatedAt: new Date().toISOString(),
          }
        }),
      )
      const request = approvals.find((item) => item.id === approvalId)
      if (request) {
        pushAudit({
          action: decision === 'rejected' ? 'rejected' : 'approved',
          objectType: 'approval',
          objectId: approvalId,
          objectTitle: request.title,
          detail: comments || `Step ${stepId} marked ${decision}`,
        })
        if (decision === 'approved' && request.objectType === 'policy') {
          const allApproved = request.steps.every((step) =>
            step.id === stepId ? decision === 'approved' : step.decision === 'approved',
          )
          if (allApproved) publishPolicy(request.objectId)
        }
      }
    },
    [approvals, publishPolicy, pushAudit],
  )

  const createWorkflowFromTemplate = useCallback(
    (templateId: string, name?: string) => {
      const template = WORKFLOW_TEMPLATES.find((item) => item.id === templateId)
      if (!template) throw new Error('Template not found')
      const workflow: WorkflowDefinition = {
        id: createId('wf'),
        name: name ?? `${template.name} (active)`,
        description: template.description,
        templateId,
        isTemplate: false,
        updatedAt: new Date().toISOString(),
        nodes: template.nodes.map((node) => ({ ...node, id: createId('node') })),
      }
      setWorkflows((current) => [workflow, ...current])
      pushAudit({
        action: 'created',
        objectType: 'workflow',
        objectId: workflow.id,
        objectTitle: workflow.name,
        detail: `Created from template ${template.name}`,
      })
      return workflow
    },
    [pushAudit],
  )

  const updateWorkflowNodes = useCallback((workflowId: string, nodes: WorkflowNode[]) => {
    setWorkflows((current) =>
      current.map((item) =>
        item.id === workflowId
          ? {
              ...item,
              nodes: nodes.map((node, index) => ({ ...node, order: index })),
              updatedAt: new Date().toISOString(),
            }
          : item,
      ),
    )
  }, [])

  const exportAuditTrail = useCallback(() => {
    const payload = JSON.stringify(auditEvents, null, 2)
    void navigator.clipboard.writeText(payload)
    pushAudit({
      action: 'exported',
      objectType: 'audit',
      objectId: 'audit-trail',
      objectTitle: 'Audit trail',
      detail: `Exported ${auditEvents.length} events`,
    })
    return payload
  }, [auditEvents, pushAudit])

  const addEvidence: GovernanceContextValue['addEvidence'] = useCallback(
    (input) => {
      const item: GovernanceEvidence = {
        id: createId('gev'),
        createdAt: new Date().toISOString(),
        uploadedById: CURRENT_USER_ID,
        aiMetadata: input.aiMetadata ?? `AI extracted metadata for ${input.kind.toUpperCase()} · Confidence 0.82`,
        ...input,
      }
      setEvidence((current) => [item, ...current])
      pushAudit({
        action: 'created',
        objectType: 'evidence',
        objectId: item.id,
        objectTitle: item.title,
        detail: item.aiMetadata,
      })
    },
    [pushAudit],
  )

  const addComment: GovernanceContextValue['addComment'] = useCallback(
    (input) => {
      const comment: CollaborationComment = {
        id: createId('cmt'),
        createdAt: new Date().toISOString(),
        reactions: {},
        resolved: input.resolved ?? false,
        ...input,
      }
      setComments((current) => [...current, comment])
      pushAudit({
        action: 'commented',
        objectType: input.objectType,
        objectId: input.objectId,
        objectTitle: input.objectId,
        detail: input.body,
      })
    },
    [pushAudit],
  )

  const toggleCommentResolved = useCallback((id: string) => {
    setComments((current) =>
      current.map((item) => (item.id === id ? { ...item, resolved: !item.resolved } : item)),
    )
  }, [])

  const reactToComment = useCallback((id: string, emoji: string) => {
    setComments((current) =>
      current.map((item) => {
        if (item.id !== id) return item
        const users = new Set(item.reactions[emoji] ?? [])
        if (users.has(CURRENT_USER_ID)) users.delete(CURRENT_USER_ID)
        else users.add(CURRENT_USER_ID)
        return { ...item, reactions: { ...item.reactions, [emoji]: [...users] } }
      }),
    )
  }, [])

  const toggleAutomation = useCallback((id: string) => {
    setAutomations((current) =>
      current.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item)),
    )
  }, [])

  const runAutomation = useCallback(
    (id: string) => {
      const rule = automations.find((item) => item.id === id)
      if (!rule) return
      setAutomations((current) =>
        current.map((item) =>
          item.id === id ? { ...item, lastRunAt: new Date().toISOString() } : item,
        ),
      )
      pushAudit({
        action: 'automated',
        objectType: 'automation',
        objectId: id,
        objectTitle: rule.name,
        detail: `Ran actions: ${rule.actions.join(', ')}`,
      })
    },
    [automations, pushAudit],
  )

  const generateReport = useCallback(
    (kind: ReportKind, format: ExportFormat = 'markdown') => {
      const titles: Record<ReportKind, string> = {
        board: 'Board report',
        executive_summary: 'Executive summary',
        compliance_status: 'Compliance status report',
        audit_evidence: 'Audit evidence package',
        policy_review: 'Policy review report',
        implementation: 'Regulatory implementation report',
      }
      const report: GeneratedReport = {
        id: createId('rep'),
        kind,
        title: `${titles[kind]} — ${new Date().toISOString().slice(0, 10)}`,
        summary: `${titles[kind]} generated from live Action Center, policy coverage, and approval queue.`,
        createdAt: new Date().toISOString(),
        createdById: CURRENT_USER_ID,
        format,
      }
      setReports((current) => [report, ...current])
      pushAudit({
        action: 'exported',
        objectType: 'report',
        objectId: report.id,
        objectTitle: report.title,
        detail: `Generated ${format.toUpperCase()} report`,
      })
      return report
    },
    [pushAudit],
  )

  const reviewWarnings = useMemo(() => {
    const now = new Date('2026-08-02T12:00:00.000Z')
    return policies
      .map((policy) => {
        const daysUntil = Math.round(
          (+new Date(`${policy.nextReviewDate}T00:00:00.000Z`) - +now) / (24 * 60 * 60 * 1000),
        )
        return { policyId: policy.id, title: policy.title, nextReviewDate: policy.nextReviewDate, daysUntil }
      })
      .filter((item) => item.daysUntil <= 45)
      .sort((a, b) => a.daysUntil - b.daysUntil)
  }, [policies])

  const roleId = getRoleForUser(CURRENT_USER_ID)
  const roleLabel = ENTERPRISE_ROLES.find((role) => role.id === roleId)?.label ?? 'Read Only'

  const value = useMemo<GovernanceContextValue>(
    () => ({
      currentUserId: CURRENT_USER_ID,
      can: (permission) => userCan(CURRENT_USER_ID, permission),
      roleLabel,
      departments: DEPARTMENTS,
      businessUnits: BUSINESS_UNITS,
      locations: LOCATIONS,
      teams: TEAMS,
      roles: ENTERPRISE_ROLES,
      roleAssignments: ROLE_ASSIGNMENTS,
      controls: CONTROLS,
      risks: RISKS,
      policies,
      versions,
      getPolicy,
      getVersions,
      updatePolicyContent,
      restoreVersion,
      publishPolicy,
      approvals,
      getApprovalForPolicy,
      decideApprovalStep,
      workflows,
      templates: WORKFLOW_TEMPLATES,
      createWorkflowFromTemplate,
      updateWorkflowNodes,
      auditEvents,
      exportAuditTrail,
      evidence,
      addEvidence,
      comments,
      addComment,
      toggleCommentResolved,
      reactToComment,
      automations,
      toggleAutomation,
      runAutomation,
      calendarItems: CALENDAR_ITEMS,
      mappings: MAPPINGS,
      impactAnalyses: IMPACT_ANALYSES,
      getImpact: (regulationId) => IMPACT_ANALYSES.find((item) => item.regulationId === regulationId),
      reports,
      generateReport,
      reviewWarnings,
    }),
    [
      addComment,
      addEvidence,
      approvals,
      auditEvents,
      automations,
      comments,
      createWorkflowFromTemplate,
      decideApprovalStep,
      evidence,
      exportAuditTrail,
      generateReport,
      getApprovalForPolicy,
      getPolicy,
      getVersions,
      policies,
      publishPolicy,
      reactToComment,
      reports,
      restoreVersion,
      reviewWarnings,
      roleLabel,
      runAutomation,
      toggleAutomation,
      toggleCommentResolved,
      updatePolicyContent,
      updateWorkflowNodes,
      versions,
      workflows,
    ],
  )

  return <GovernanceContext.Provider value={value}>{children}</GovernanceContext.Provider>
}
