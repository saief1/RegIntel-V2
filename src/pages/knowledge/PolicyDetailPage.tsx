import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Sparkles } from 'lucide-react'
import g from '../../components/governance/governance.module.css'
import { Badge } from '../../components/ui/Badge/Badge'
import { Button } from '../../components/ui/Button/Button'
import { EmptyState } from '../../components/ui/EmptyState/EmptyState'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { Select } from '../../components/ui/Select/Select'
import { Textarea } from '../../components/ui/Textarea/Textarea'
import { useGovernance } from '../../hooks/useGovernance'
import { useWork } from '../../hooks/useWork'
import { formatDate, formatRelativeTime } from '../../utils/date'
import { diffPolicyText, summarizeDiff } from '../../utils/policyDiff'
import {
  draftRevision,
  findConflicts,
  generatePolicySummary,
  mapToRegulationHints,
  rewritePolicy,
  simplifyPolicy,
} from '../../utils/policyAi'
import styles from './PolicyDetailPage.module.css'

export function PolicyDetailPage() {
  const { policyId } = useParams<{ policyId: string }>()
  const navigate = useNavigate()
  const {
    getPolicy,
    getVersions,
    getApprovalForPolicy,
    restoreVersion,
    updatePolicyContent,
    decideApprovalStep,
    comments,
    addComment,
    toggleCommentResolved,
    reactToComment,
    evidence,
    addEvidence,
    mappings,
    controls,
    risks,
    departments,
    can,
    currentUserId,
  } = useGovernance()
  const { getUser } = useWork()

  const policy = policyId ? getPolicy(policyId) : undefined
  const versions = policy ? getVersions(policy.id) : []
  const approval = policy ? getApprovalForPolicy(policy.id) : undefined
  const [leftVersionId, setLeftVersionId] = useState<string>('')
  const [rightVersionId, setRightVersionId] = useState<string>('')
  const [assistantOutput, setAssistantOutput] = useState('')
  const [commentBody, setCommentBody] = useState('')
  const [signOffNote, setSignOffNote] = useState('')

  const left = versions.find((item) => item.id === (leftVersionId || versions[1]?.id))
  const right = versions.find((item) => item.id === (rightVersionId || versions[0]?.id))
  const diff = left && right ? diffPolicyText(left.content, right.content) : []

  const policyComments = comments.filter((item) => item.objectType === 'policy' && item.objectId === policy?.id)
  const policyEvidence = evidence.filter((item) => item.objectType === 'policy' && item.objectId === policy?.id)
  const mapping = mappings.find((item) => item.policyIds.includes(policy?.id ?? ''))

  if (!policy) {
    return (
      <PageContainer>
        <EmptyState
          title="Policy not found"
          description="This policy may have been archived."
          action={
            <Button variant="secondary" onClick={() => navigate('/knowledge/policies')}>
              Back to policies
            </Button>
          }
        />
      </PageContainer>
    )
  }

  const currentPolicy = policy
  const pendingStep = approval?.steps.find((step) => step.decision === 'pending')

  function runAssistant(action: string) {
    switch (action) {
      case 'rewrite':
        setAssistantOutput(rewritePolicy(currentPolicy.content))
        break
      case 'simplify':
        setAssistantOutput(simplifyPolicy(currentPolicy.content))
        break
      case 'compare':
        setAssistantOutput(left && right ? summarizeDiff(left.content, right.content) : 'Select two versions to compare.')
        break
      case 'conflicts':
        setAssistantOutput(findConflicts(currentPolicy.content).join('\n'))
        break
      case 'map':
        setAssistantOutput(mapToRegulationHints(currentPolicy.content).join('\n'))
        break
      case 'summary':
        setAssistantOutput(generatePolicySummary(currentPolicy.content))
        break
      case 'draft':
        setAssistantOutput(draftRevision(currentPolicy.content))
        break
      default:
        break
    }
  }

  function submitComment(event: FormEvent) {
    event.preventDefault()
    if (!commentBody.trim()) return
    const mentionIds: string[] = []
    for (const match of commentBody.matchAll(/@([\w\s]+)/g)) {
      const name = match[1].trim().toLowerCase()
      if (name.includes('alex') || name.includes('sarah')) mentionIds.push('u-01')
    }
    addComment({
      objectType: 'policy',
      objectId: currentPolicy.id,
      authorId: currentUserId,
      body: commentBody.trim(),
      mentionIds,
      attachmentIds: [],
    })
    setCommentBody('')
  }

  return (
    <div className={styles.page}>
      <PageContainer className={styles.container}>
        <Link to="/knowledge/policies" className={styles.back}>
          <ChevronLeft size={14} /> Policy Workspace
        </Link>

        <header className={styles.header}>
          <div>
            <div className={g.meta}>
              <Badge variant={policy.status === 'published' ? 'success' : 'warning'}>{policy.status}</Badge>
              <Badge variant="accent">{policy.approvalStatus}</Badge>
              <span>{departments.find((d) => d.id === policy.departmentId)?.name}</span>
            </div>
            <h1>{policy.title}</h1>
            <p className={g.muted}>
              Owner {getUser(policy.ownerId)?.name} · Effective {formatDate(policy.effectiveDate)} · Next review{' '}
              {formatDate(policy.nextReviewDate)} ({policy.reviewCadence})
            </p>
          </div>
          {can('approve') && pendingStep && pendingStep.approverId === currentUserId && (
            <div className={styles.signoff}>
              <Textarea
                rows={2}
                value={signOffNote}
                onChange={(event) => setSignOffNote(event.target.value)}
                placeholder="Approval comments / digital sign-off note"
              />
              <div className={g.toolbar}>
                <Button
                  variant="primary"
                  onClick={() =>
                    decideApprovalStep(approval!.id, pendingStep.id, 'approved', signOffNote || 'Electronically approved')
                  }
                >
                  Approve & sign
                </Button>
                <Button
                  variant="danger"
                  onClick={() => decideApprovalStep(approval!.id, pendingStep.id, 'rejected', signOffNote || 'Rejected')}
                >
                  Reject
                </Button>
              </div>
            </div>
          )}
        </header>

        <div className={styles.layout}>
          <section className={g.panel}>
            <h2>Policy body</h2>
            <p className={styles.body}>{policy.content}</p>
          </section>

          <aside className={styles.side}>
            <section className={g.panel}>
              <h2>Version control</h2>
              <ul className={g.list}>
                {versions.map((version) => (
                  <li key={version.id} className={g.listItem}>
                    <span>
                      <strong>{version.label}</strong>
                      {version.isCurrent ? ' · Current' : ''}
                      <br />
                      <span className={g.muted}>{version.summary}</span>
                    </span>
                    <Button size="sm" variant="ghost" onClick={() => restoreVersion(policy.id, version.id)} disabled={!can('edit')}>
                      Restore
                    </Button>
                  </li>
                ))}
              </ul>
              <div className={styles.compareControls}>
                <Select value={left?.id ?? ''} onChange={(e) => setLeftVersionId(e.target.value)} aria-label="Baseline version">
                  {versions.map((version) => (
                    <option key={version.id} value={version.id}>
                      {version.label}
                    </option>
                  ))}
                </Select>
                <Select value={right?.id ?? ''} onChange={(e) => setRightVersionId(e.target.value)} aria-label="Compare version">
                  {versions.map((version) => (
                    <option key={version.id} value={version.id}>
                      {version.label}
                    </option>
                  ))}
                </Select>
              </div>
              <p className={g.muted}>{left && right ? summarizeDiff(left.content, right.content) : null}</p>
              <div className={g.diff} aria-label="Side-by-side diff">
                {diff.map((line, index) => (
                  <span
                    key={`${line.type}-${index}`}
                    className={line.type === 'add' ? g.diffAdd : line.type === 'remove' ? g.diffRemove : undefined}
                  >
                    {line.text}
                  </span>
                ))}
              </div>
            </section>

            <section className={g.panel}>
              <h2>Approval workflow</h2>
              <ol className={styles.steps}>
                {(approval?.steps ?? []).map((step) => (
                  <li key={step.id}>
                    <strong>{step.label}</strong>
                    <span>
                      {getUser(step.approverId)?.name} · {step.decision}
                    </span>
                    {step.comments && <p>{step.comments}</p>}
                    {step.decidedAt && <time dateTime={step.decidedAt}>{formatRelativeTime(step.decidedAt)}</time>}
                  </li>
                ))}
              </ol>
            </section>
          </aside>
        </div>

        <section className={g.panel}>
          <header className={g.row}>
            <h2>
              <Sparkles size={16} aria-hidden="true" /> AI Policy Assistant
            </h2>
          </header>
          <div className={g.toolbar}>
            {[
              ['rewrite', 'Rewrite'],
              ['simplify', 'Simplify'],
              ['compare', 'Compare'],
              ['conflicts', 'Find conflicts'],
              ['map', 'Map to regulation'],
              ['summary', 'Generate summary'],
              ['draft', 'Draft revision'],
            ].map(([id, label]) => (
              <Button key={id} size="sm" variant="secondary" onClick={() => runAssistant(id)}>
                {label}
              </Button>
            ))}
            {assistantOutput && can('edit') && (
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  updatePolicyContent(policy.id, assistantOutput, 'Applied AI assistant revision')
                  setAssistantOutput('')
                }}
              >
                Apply to policy
              </Button>
            )}
          </div>
          {assistantOutput && <pre className={styles.assistant}>{assistantOutput}</pre>}
        </section>

        <section className={g.panel}>
          <h2>Regulation ↔ Policy mapping</h2>
          {mapping ? (
            <>
              <p>
                Coverage <strong>{mapping.coveragePercent}%</strong> · {mapping.regulationTitle}
              </p>
              <div className={g.coverage}>
                <span style={{ width: `${mapping.coveragePercent}%` }} />
              </div>
              <div className={g.graph}>
                <div className={g.graphCol}>
                  <h4>Policies</h4>
                  <ul className={g.list}>
                    {mapping.policyIds.map((id) => (
                      <li key={id} className={g.listItem}>
                        {getPolicy(id)?.title ?? id}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={g.graphCol}>
                  <h4>Controls</h4>
                  <ul className={g.list}>
                    {mapping.controlIds.map((id) => (
                      <li key={id} className={g.listItem}>
                        {controls.find((c) => c.id === id)?.name ?? id}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={g.graphCol}>
                  <h4>Tasks</h4>
                  <ul className={g.list}>
                    {mapping.taskIds.map((id) => (
                      <li key={id}>
                        <button type="button" onClick={() => navigate(`/work/tasks/${id}`)}>
                          {id}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={g.graphCol}>
                  <h4>Risks / Gaps</h4>
                  <ul className={g.list}>
                    {mapping.riskIds.map((id) => (
                      <li key={id} className={g.listItem}>
                        {risks.find((r) => r.id === id)?.name ?? id}
                      </li>
                    ))}
                    {mapping.gaps.map((gap) => (
                      <li key={gap} className={g.listItem}>
                        {gap}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          ) : (
            <p className={g.muted}>No mapping graph for this policy yet.</p>
          )}
        </section>

        <div className={styles.split}>
          <section className={g.panel}>
            <header className={g.row}>
              <h2>Evidence</h2>
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  addEvidence({
                    title: `Note — ${policy.title}`,
                    kind: 'note',
                    objectType: 'policy',
                    objectId: policy.id,
                    note: 'Manual evidence note captured in Policy Workspace.',
                  })
                }
              >
                Add note
              </Button>
            </header>
            <ul className={g.list}>
              {policyEvidence.map((item) => (
                <li key={item.id} className={g.listItem}>
                  <span>
                    <strong>{item.title}</strong>
                    <br />
                    <span className={g.muted}>
                      {item.kind} · {item.aiMetadata}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className={g.panel}>
            <h2>Collaboration</h2>
            <ul className={styles.comments}>
              {policyComments.map((item) => (
                <li key={item.id}>
                  <strong>{getUser(item.authorId)?.name}</strong>
                  <p>{item.body}</p>
                  <div className={g.toolbar}>
                    <Button size="sm" variant="ghost" onClick={() => reactToComment(item.id, '👍')}>
                      👍 {(item.reactions['👍'] ?? []).length || ''}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => toggleCommentResolved(item.id)}>
                      {item.resolved ? 'Reopen' : 'Resolve'}
                    </Button>
                    <time dateTime={item.createdAt}>{formatRelativeTime(item.createdAt)}</time>
                  </div>
                </li>
              ))}
            </ul>
            <form className={styles.commentForm} onSubmit={submitComment}>
              <Textarea
                value={commentBody}
                onChange={(event) => setCommentBody(event.target.value)}
                rows={3}
                placeholder="@Alex Chen Please review section 4."
              />
              <Button type="submit" size="sm" disabled={!commentBody.trim()}>
                Comment
              </Button>
            </form>
          </section>
        </div>
      </PageContainer>
    </div>
  )
}
