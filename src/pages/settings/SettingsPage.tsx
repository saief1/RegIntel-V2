import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Settings } from 'lucide-react'
import g from '../../components/governance/governance.module.css'
import { Badge } from '../../components/ui/Badge/Badge'
import { Button } from '../../components/ui/Button/Button'
import { PageContainer } from '../../components/ui/PageContainer/PageContainer'
import { PageHeader } from '../../components/ui/PageHeader/PageHeader'
import { Select } from '../../components/ui/Select/Select'
import { useGovernance } from '../../hooks/useGovernance'
import { useWork } from '../../hooks/useWork'
import { formatRelativeTime } from '../../utils/date'
import connected from '../connected/connected.module.css'
import styles from './SettingsPage.module.css'

type Tab = 'org' | 'rbac' | 'audit' | 'automation'

export function SettingsPage() {
  const [params, setParams] = useSearchParams()
  const tab = (params.get('tab') as Tab | null) ?? 'org'
  const {
    departments,
    businessUnits,
    locations,
    teams,
    roles,
    roleAssignments,
    auditEvents,
    exportAuditTrail,
    automations,
    toggleAutomation,
    runAutomation,
    roleLabel,
    can,
  } = useGovernance()
  const { getUser, users } = useWork()
  const [actorFilter, setActorFilter] = useState('')
  const [actionFilter, setActionFilter] = useState('all')

  const filteredAudit = useMemo(() => {
    return auditEvents.filter((event) => {
      if (actorFilter && event.actorId !== actorFilter) return false
      if (actionFilter !== 'all' && event.action !== actionFilter) return false
      return true
    })
  }, [actionFilter, actorFilter, auditEvents])

  function setTab(next: Tab) {
    const nextParams = new URLSearchParams(params)
    nextParams.set('tab', next)
    setParams(nextParams, { replace: true })
  }

  return (
    <PageContainer className={styles.page}>
      <PageHeader
        title="Settings"
        description={`Enterprise governance controls · Signed in as ${roleLabel}`}
        icon={<Settings size={20} />}
      />

      <nav className={connected.hubLinks} aria-label="Connected enterprise areas">
        <Link className={connected.hubLink} to="/settings/integrations">
          Integrations
        </Link>
        <Link className={connected.hubLink} to="/settings/api">
          API Platform
        </Link>
        <Link className={connected.hubLink} to="/settings/admin">
          Admin Console
        </Link>
        <Link className={connected.hubLink} to="/settings/collaboration">
          Collaboration
        </Link>
        <Link className={connected.hubLink} to="/agents">
          AI Agents
        </Link>
        <Link className={connected.hubLink} to="/settings/data">
          Data Management
        </Link>
        <Link className={connected.hubLink} to="/settings/security">
          Security Center
        </Link>
        <Link className={connected.hubLink} to="/audit">
          Audit Center
        </Link>
        <Link className={connected.hubLink} to="/automation">
          Automation Studio
        </Link>
        <Link className={connected.hubLink} to="/system">
          System Health
        </Link>
        <Link className={connected.hubLink} to="/settings/billing">
          Billing
        </Link>
        <Link className={connected.hubLink} to="/settings/usage">
          Usage
        </Link>
        <Link className={connected.hubLink} to="/settings/licensing">
          Licensing
        </Link>
        <Link className={connected.hubLink} to="/customer">
          Customer Portal
        </Link>
        <Link className={connected.hubLink} to="/partners">
          Partners
        </Link>
      </nav>

      <div className={g.tabs} role="tablist" aria-label="Settings sections">
        {(
          [
            ['org', 'Organization'],
            ['rbac', 'RBAC'],
            ['audit', 'Audit Trail'],
            ['automation', 'Automation Rules'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={tab === id ? g.tabActive : g.tab}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'org' && (
        <div className={styles.split}>
          <section className={g.panel}>
            <h2>Departments</h2>
            <ul className={g.list}>
              {departments.map((item) => (
                <li key={item.id} className={g.listItem}>
                  <span>
                    {item.name}
                    <br />
                    <span className={g.muted}>Manager {getUser(item.managerId)?.name}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
          <section className={g.panel}>
            <h2>Business units</h2>
            <ul className={g.list}>
              {businessUnits.map((item) => (
                <li key={item.id} className={g.listItem}>
                  {item.name}
                </li>
              ))}
            </ul>
          </section>
          <section className={g.panel}>
            <h2>Locations</h2>
            <ul className={g.list}>
              {locations.map((item) => (
                <li key={item.id} className={g.listItem}>
                  <span>
                    {item.name}
                    <br />
                    <span className={g.muted}>{item.region}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
          <section className={g.panel}>
            <h2>Teams</h2>
            <ul className={g.list}>
              {teams.map((item) => (
                <li key={item.id} className={g.listItem}>
                  <span>
                    <strong>{item.name}</strong>
                    <br />
                    <span className={g.muted}>
                      Lead {getUser(item.leadId)?.name} · {item.memberIds.length} members
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}

      {tab === 'rbac' && (
        <div className={styles.split}>
          <section className={g.panel}>
            <h2>Roles</h2>
            <ul className={g.list}>
              {roles.map((role) => (
                <li key={role.id} className={g.listItem}>
                  <span>
                    <strong>{role.label}</strong>
                    <br />
                    <span className={g.muted}>{role.description}</span>
                    <br />
                    <span className={g.muted}>{role.permissions.join(' · ')}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
          <section className={g.panel}>
            <h2>Assignments</h2>
            <ul className={g.list}>
              {roleAssignments.map((assignment) => (
                <li key={`${assignment.userId}-${assignment.roleId}`} className={g.listItem}>
                  <span>
                    <strong>{getUser(assignment.userId)?.name}</strong>
                    <br />
                    <span className={g.muted}>
                      {roles.find((role) => role.id === assignment.roleId)?.label}
                    </span>
                  </span>
                  <Badge variant="accent">{assignment.roleId.replace(/_/g, ' ')}</Badge>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}

      {tab === 'audit' && (
        <section className={g.panel}>
          <header className={g.row}>
            <h2>Immutable audit trail</h2>
            <Button size="sm" variant="secondary" disabled={!can('export')} onClick={() => exportAuditTrail()}>
              Export
            </Button>
          </header>
          <div className={g.toolbar}>
            <Select aria-label="Filter by user" value={actorFilter} onChange={(e) => setActorFilter(e.target.value)}>
              <option value="">All users</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </Select>
            <Select aria-label="Filter by action" value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
              <option value="all">All actions</option>
              {[
                'created',
                'edited',
                'ai_suggested',
                'approved',
                'rejected',
                'published',
                'archived',
                'exported',
                'automated',
                'commented',
              ].map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </Select>
          </div>
          <ul className={g.list}>
            {filteredAudit.map((event) => (
              <li key={event.id} className={g.listItem}>
                <span>
                  <strong>{event.action}</strong> · {event.objectTitle}
                  <br />
                  <span className={g.muted}>
                    {getUser(event.actorId)?.name} · {event.objectType} · {event.detail}
                  </span>
                </span>
                <time dateTime={event.createdAt}>{formatRelativeTime(event.createdAt)}</time>
              </li>
            ))}
          </ul>
        </section>
      )}

      {tab === 'automation' && (
        <section className={g.panel}>
          <h2>Automation rules</h2>
          <div className={g.grid}>
            {automations.map((rule) => (
              <article key={rule.id} className={g.card} style={{ cursor: 'default' }}>
                <div className={g.meta}>
                  <Badge variant={rule.enabled ? 'success' : 'neutral'}>{rule.enabled ? 'Enabled' : 'Disabled'}</Badge>
                </div>
                <h3>{rule.name}</h3>
                <p className={g.muted}>IF {rule.trigger}</p>
                <p className={g.muted}>THEN {rule.actions.join(' → ')}</p>
                {rule.lastRunAt && <p className={g.muted}>Last run {formatRelativeTime(rule.lastRunAt)}</p>}
                <div className={g.toolbar}>
                  <Button size="sm" variant="secondary" onClick={() => toggleAutomation(rule.id)} disabled={!can('manage')}>
                    {rule.enabled ? 'Disable' : 'Enable'}
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => runAutomation(rule.id)}
                    disabled={!can('manage') || !rule.enabled}
                  >
                    Run now
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </PageContainer>
  )
}
