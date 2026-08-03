import type {
  AuditEngagement,
  AuditFinding,
  AutomationRule,
  AutomationRun,
  DataJob,
  DataQualityMetric,
  DataSource,
  DuplicateGroup,
  EvidenceRequest,
  FeatureFlag,
  GlobalJob,
  IpRestriction,
  RecordHistoryItem,
  ReleaseNote,
  RetentionPolicy,
  SecretRecord,
  SecurityAlert,
  SystemAnnouncement,
  SystemServiceHealth,
  TrustedDevice,
} from '../../types/operations'

export const DATA_SOURCES: DataSource[] = [
  { id: 'ds-csv', name: 'Policy CSV feed', kind: 'csv', owner: 'Alex Chen', lastSyncAt: '2026-08-02T20:00:00.000Z', status: 'connected', records: 1284 },
  { id: 'ds-xlsx', name: 'Control register Excel', kind: 'excel', owner: 'Jordan Blake', lastSyncAt: '2026-08-02T18:30:00.000Z', status: 'connected', records: 420 },
  { id: 'ds-api', name: 'HRIS API import', kind: 'api', owner: 'Sam Rivera', lastSyncAt: '2026-08-02T22:00:00.000Z', status: 'degraded', records: 2103 },
  { id: 'ds-sched', name: 'Nightly evidence pull', kind: 'schedule', owner: 'Casey Nguyen', lastSyncAt: '2026-08-02T06:00:00.000Z', status: 'connected', records: 890 },
]

export const DATA_JOBS: DataJob[] = [
  { id: 'dj-1', title: 'Import controls.xlsx', kind: 'import', status: 'succeeded', source: 'Control register Excel', createdAt: '2026-08-02T18:30:00.000Z', detail: '420 rows validated', attempt: 1, maxAttempts: 3 },
  { id: 'dj-2', title: 'API import · HRIS users', kind: 'import', status: 'failed', source: 'HRIS API import', createdAt: '2026-08-02T22:05:00.000Z', detail: 'Schema mismatch on department code', attempt: 2, maxAttempts: 3 },
  { id: 'dj-3', title: 'Export audit pack', kind: 'export', status: 'queued', createdAt: '2026-08-02T23:10:00.000Z', detail: 'PDF + evidence zip', attempt: 0, maxAttempts: 3 },
  { id: 'dj-4', title: 'Archive closed cases 2024', kind: 'archive', status: 'running', createdAt: '2026-08-02T21:00:00.000Z', detail: 'Cold storage tier', attempt: 1, maxAttempts: 2 },
  { id: 'dj-5', title: 'Restore vendor questionnaire set', kind: 'restore', status: 'retrying', createdAt: '2026-08-02T16:00:00.000Z', detail: 'Transient object store timeout', attempt: 2, maxAttempts: 4 },
  { id: 'dj-6', title: 'Validation report · policies', kind: 'validation', status: 'succeeded', createdAt: '2026-08-02T19:00:00.000Z', detail: '3 warnings · 0 blockers', attempt: 1, maxAttempts: 1 },
]

export const DATA_QUALITY: DataQualityMetric[] = [
  { id: 'dq-1', label: 'Completeness', value: '96%', status: 'healthy', detail: 'Required fields populated' },
  { id: 'dq-2', label: 'Validity', value: '91%', status: 'warning', detail: 'HRIS department codes failing enum check' },
  { id: 'dq-3', label: 'Uniqueness', value: '98%', status: 'healthy', detail: 'Duplicate detector online' },
  { id: 'dq-4', label: 'Freshness', value: '87%', status: 'warning', detail: '2 sources > 24h stale' },
]

export const RETENTION_POLICIES: RetentionPolicy[] = [
  { id: 'rp-1', name: 'Audit evidence', retentionDays: 2555, archiveAfterDays: 730, appliesTo: 'Evidence vault' },
  { id: 'rp-2', name: 'Login history', retentionDays: 365, archiveAfterDays: 180, appliesTo: 'Security logs' },
  { id: 'rp-3', name: 'Closed cases', retentionDays: 1825, archiveAfterDays: 365, appliesTo: 'Work cases' },
]

export const DUPLICATES: DuplicateGroup[] = [
  { id: 'dup-1', entity: 'Vendor', count: 3, confidence: 92, sample: 'Box Inc / Box, Inc. / Box Cloud' },
  { id: 'dup-2', entity: 'Control', count: 2, confidence: 81, sample: 'C-12 Access Attestation / Access attestation C12' },
]

export const RECORD_HISTORY: RecordHistoryItem[] = [
  { id: 'rh-1', entity: 'Policy · AML', action: 'Imported revision metadata', actor: 'System', at: '2026-08-02T18:31:00.000Z' },
  { id: 'rh-2', entity: 'User · Casey Nguyen', action: 'HRIS sync update', actor: 'HRIS API import', at: '2026-08-02T22:00:00.000Z' },
  { id: 'rh-3', entity: 'Evidence pack RFI-22', action: 'Archived', actor: 'Alex Chen', at: '2026-08-01T11:00:00.000Z' },
]

export const SECURITY_ALERTS: SecurityAlert[] = [
  { id: 'sa-1', title: 'Impossible travel login', severity: 'high', at: '2026-08-02T21:40:00.000Z', acknowledged: false, detail: 'Toronto → London within 40 minutes', riskScore: 82 },
  { id: 'sa-2', title: 'MFA challenge failures', severity: 'medium', at: '2026-08-02T19:10:00.000Z', acknowledged: false, detail: '5 failures for one privileged user', riskScore: 64 },
  { id: 'sa-3', title: 'API key near expiry', severity: 'low', at: '2026-08-02T12:00:00.000Z', acknowledged: true, detail: 'Production service key expires in 12 days', riskScore: 28 },
]

export const TRUSTED_DEVICES: TrustedDevice[] = [
  { id: 'td-1', name: 'MacBook Pro · Chrome', user: 'Alex Chen', lastSeenAt: '2026-08-02T23:00:00.000Z', trusted: true },
  { id: 'td-2', name: 'iPhone 15 · Safari', user: 'Alex Chen', lastSeenAt: '2026-08-02T20:10:00.000Z', trusted: true },
  { id: 'td-3', name: 'Windows · Edge', user: 'Morgan Lee', lastSeenAt: '2026-08-01T09:00:00.000Z', trusted: false },
]

export const IP_RESTRICTIONS: IpRestriction[] = [
  { id: 'ip-1', cidr: '10.20.0.0/16', label: 'Corporate VPN', enabled: true },
  { id: 'ip-2', cidr: '203.0.113.0/24', label: 'Office egress', enabled: true },
  { id: 'ip-3', cidr: '198.51.100.40/32', label: 'External auditor temp', enabled: false },
]

export const SECRETS: SecretRecord[] = [
  { id: 'sec-1', name: 'SSO signing cert', lastRotatedAt: '2026-03-01T00:00:00.000Z', status: 'expiring' },
  { id: 'sec-2', name: 'Webhook signing key', lastRotatedAt: '2026-07-15T00:00:00.000Z', status: 'active' },
  { id: 'sec-3', name: 'SCIM bearer token', lastRotatedAt: '2026-08-01T00:00:00.000Z', status: 'rotated' },
]

export const AUDIT_ENGAGEMENTS: AuditEngagement[] = [
  { id: 'aud-1', title: '2026 Internal AML Program', stage: 'fieldwork', owner: 'Jordan Blake', startDate: '2026-07-01', findingsOpen: 3 },
  { id: 'aud-2', title: 'SOC 2 Type II readiness', stage: 'planning', owner: 'Alex Chen', startDate: '2026-08-15', findingsOpen: 0 },
  { id: 'aud-3', title: 'Vendor risk thematic review', stage: 'reporting', owner: 'Sam Rivera', startDate: '2026-05-01', endDate: '2026-07-30', findingsOpen: 2 },
  { id: 'aud-4', title: '2025 ITGC follow-up', stage: 'remediation', owner: 'Casey Nguyen', startDate: '2026-01-10', findingsOpen: 1 },
  { id: 'aud-5', title: 'Branch conduct sampling', stage: 'closed', owner: 'Morgan Lee', startDate: '2025-10-01', endDate: '2026-02-01', findingsOpen: 0 },
]

export const AUDIT_FINDINGS: AuditFinding[] = [
  { id: 'af-1', auditId: 'aud-1', title: 'Beneficial ownership refresh lag', severity: 'high', status: 'open', recommendation: 'Automate refresh reminders', correctiveAction: 'Launch Training Assistant campaign' },
  { id: 'af-2', auditId: 'aud-1', title: 'Incomplete SAR narrative checklist', severity: 'medium', status: 'in_progress', recommendation: 'Update AML Policy §4 checklist' },
  { id: 'af-3', auditId: 'aud-3', title: 'Stale vendor attestations', severity: 'critical', status: 'open', recommendation: 'Reconnect Box and reissue questionnaires' },
  { id: 'af-4', auditId: 'aud-4', title: 'Access review sampling gap', severity: 'medium', status: 'in_progress', recommendation: 'Increase C-12 sampling frequency' },
]

export const EVIDENCE_REQUESTS: EvidenceRequest[] = [
  { id: 'er-1', auditId: 'aud-1', title: 'SAR workflow screenshots', dueAt: '2026-08-08T17:00:00.000Z', status: 'requested' },
  { id: 'er-2', auditId: 'aud-1', title: 'Training completion extract', dueAt: '2026-08-05T17:00:00.000Z', status: 'overdue' },
  { id: 'er-3', auditId: 'aud-3', title: 'Vendor SOC reports', dueAt: '2026-08-12T17:00:00.000Z', status: 'received' },
]

export const AUTOMATION_RULES: AutomationRule[] = [
  {
    id: 'ar-1',
    name: 'Critical finding → task + notify',
    description: 'When a critical audit finding opens, create a task and notify Teams.',
    enabled: true,
    trigger: 'Finding created (critical)',
    conditions: ['severity = critical', 'status = open'],
    actions: ['Create Task', 'Notify Teams', 'Assign Owner'],
    approvalsRequired: false,
    successRate: 97,
    lastRunAt: '2026-08-02T15:00:00.000Z',
    template: true,
  },
  {
    id: 'ar-2',
    name: 'Policy publish → board metrics refresh',
    description: 'On policy publish, generate report and launch Board Report Generator agent.',
    enabled: true,
    trigger: 'Policy published',
    conditions: ['status changed to published'],
    actions: ['Generate Report', 'Launch Agent', 'Send Email'],
    approvalsRequired: true,
    successRate: 94,
    lastRunAt: '2026-08-01T12:00:00.000Z',
    template: true,
  },
  {
    id: 'ar-3',
    name: 'SLA breach escalation',
    description: 'Escalate overdue regulatory responses to compliance lead.',
    enabled: false,
    trigger: 'Regulatory response SLA breached',
    conditions: ['hours_open > sla'],
    actions: ['Assign Owner', 'Send Email', 'Start Workflow'],
    approvalsRequired: false,
    successRate: 91,
    template: true,
  },
]

export const AUTOMATION_RUNS: AutomationRun[] = [
  { id: 'run-1', ruleId: 'ar-1', ruleName: 'Critical finding → task + notify', status: 'succeeded', at: '2026-08-02T15:00:00.000Z', detail: 'Task created · Teams notified', attempt: 1 },
  { id: 'run-2', ruleId: 'ar-2', ruleName: 'Policy publish → board metrics refresh', status: 'retrying', at: '2026-08-02T12:05:00.000Z', detail: 'Waiting on approval checkpoint', attempt: 1 },
  { id: 'run-3', ruleId: 'ar-1', ruleName: 'Critical finding → task + notify', status: 'failed', at: '2026-08-01T09:00:00.000Z', detail: 'Teams webhook 502', attempt: 3 },
]

export const SYSTEM_SERVICES: SystemServiceHealth[] = [
  { id: 'svc-app', name: 'Web application', category: 'platform', status: 'operational', latencyMs: 120, uptime: '99.98%' },
  { id: 'svc-api', name: 'Public API', category: 'api', status: 'operational', latencyMs: 180, uptime: '99.95%' },
  { id: 'svc-jobs', name: 'Background workers', category: 'queue', status: 'degraded', latencyMs: 340, uptime: '99.90%' },
  { id: 'svc-ai', name: 'AI agent runtime', category: 'ai', status: 'operational', latencyMs: 890, uptime: '99.92%' },
  { id: 'svc-m365', name: 'Microsoft 365 connector', category: 'integration', status: 'operational', latencyMs: 410, uptime: '99.80%' },
  { id: 'svc-box', name: 'Box connector', category: 'integration', status: 'outage', latencyMs: 0, uptime: '98.10%' },
  { id: 'svc-db', name: 'Primary datastore', category: 'storage', status: 'operational', latencyMs: 18, uptime: '99.99%' },
  { id: 'svc-cache', name: 'Redis cache', category: 'cache', status: 'operational', latencyMs: 3, uptime: '99.99%' },
]

export const GLOBAL_JOBS: GlobalJob[] = [
  { id: 'gj-1', name: 'Evidence Collector sync', queue: 'agents', status: 'running', depth: 6, updatedAt: '2026-08-02T23:00:00.000Z', detail: 'SharePoint attestations', attempt: 1, maxAttempts: 3 },
  { id: 'gj-2', name: 'HRIS API import', queue: 'data', status: 'failed', depth: 2, updatedAt: '2026-08-02T22:05:00.000Z', detail: 'Schema validation failed', attempt: 2, maxAttempts: 3 },
  { id: 'gj-3', name: 'Board package PDF', queue: 'exports', status: 'queued', depth: 4, updatedAt: '2026-08-02T23:10:00.000Z', detail: 'Awaiting worker', attempt: 0, maxAttempts: 3 },
  { id: 'gj-4', name: 'Automation retry · Teams notify', queue: 'automation', status: 'retrying', depth: 1, updatedAt: '2026-08-02T12:10:00.000Z', detail: 'Backoff 5m', attempt: 2, maxAttempts: 5 },
  { id: 'gj-5', name: 'Nightly retention sweep', queue: 'scheduled', status: 'succeeded', updatedAt: '2026-08-02T06:15:00.000Z', detail: 'Archived 42 objects', attempt: 1, maxAttempts: 1 },
]

export const FEATURE_FLAGS: FeatureFlag[] = [
  { id: 'ff-1', key: 'board.studio.v2', description: 'Board Reporting Studio enhancements', enabled: true },
  { id: 'ff-2', key: 'agents.autonomous.queue', description: 'Autonomous work queue', enabled: true },
  { id: 'ff-3', key: 'security.ip.enforcement', description: 'Enforce IP allowlist at login', enabled: false },
  { id: 'ff-4', key: 'maintenance.banner', description: 'Show maintenance mode banner', enabled: false },
]

export const RELEASE_NOTES: ReleaseNote[] = [
  {
    id: 'rn-12',
    version: '1.2.0-beta',
    title: 'Enterprise Platform & Production Readiness',
    publishedAt: '2026-08-03T00:00:00.000Z',
    highlights: [
      'Data Management Center',
      'Enterprise Security Center',
      'Audit & Compliance Center',
      'Automation Studio',
      'System Health Center',
    ],
  },
  {
    id: 'rn-11',
    version: '1.1.0-beta',
    title: 'Enterprise Intelligence & Analytics',
    publishedAt: '2026-08-03T00:00:00.000Z',
    highlights: ['Analytics Center', 'KPI Builder', 'Board Studio', 'Benchmarking'],
  },
]

export const SYSTEM_ANNOUNCEMENTS: SystemAnnouncement[] = [
  {
    id: 'ann-1',
    title: 'Box connector outage',
    body: 'Vendor document sync is degraded. Security and Data teams are retrying failed jobs.',
    tone: 'warning',
    dismissible: true,
  },
]

export const AUTOMATION_STEPS = ['Trigger', 'Conditions', 'Actions', 'Approvals', 'Notifications', 'Complete'] as const

export const AUTOMATION_ACTION_CATALOG = [
  'Create Task',
  'Send Email',
  'Notify Teams',
  'Generate Report',
  'Assign Owner',
  'Update Policy',
  'Start Workflow',
  'Launch Agent',
] as const

export const AUDIT_UNIVERSE = [
  'AML program',
  'Custody operations',
  'Vendor risk',
  'IT general controls',
  'Conduct & conflicts',
  'Privacy & data retention',
] as const
