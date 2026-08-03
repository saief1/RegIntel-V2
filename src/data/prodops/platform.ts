import type {
  AlertRule,
  BackupRecord,
  BackgroundJob,
  DeploymentRecord,
  FeatureFlagRef,
  IncidentRecord,
  LogEntry,
  MaintenanceWindow,
  ObservabilityMetrics,
  OpsDashboardCard,
  PlatformHealthScore,
  PlatformTimelineItem,
  RecoveryPolicy,
  ServiceNode,
  TraceRecord,
} from '../../types/prodops'

export const HEALTH_SCORE: PlatformHealthScore = {
  score: 94,
  label: 'Healthy',
  uptimePct: 99.96,
  slaPct: 99.9,
}

export const DASHBOARD_CARDS: OpsDashboardCard[] = [
  { id: 'c-health', label: 'Platform Health', value: '94', hint: 'Health score', tone: 'success' },
  { id: 'c-inc', label: 'Active Incidents', value: '2', hint: '1 high · 1 medium', tone: 'warning' },
  { id: 'c-maint', label: 'Scheduled Maintenance', value: '1', hint: 'Tonight 02:00 UTC', tone: 'neutral' },
  { id: 'c-jobs', label: 'Background Jobs', value: '18', hint: '3 retrying', tone: 'warning' },
  { id: 'c-queue', label: 'Queue Depth', value: '127', hint: 'Within budget', tone: 'neutral' },
  { id: 'c-api', label: 'API Health', value: '99.9%', hint: 'p95 148ms', tone: 'success' },
  { id: 'c-db', label: 'Database Health', value: 'Operational', hint: 'Replica lag 42ms', tone: 'success' },
  { id: 'c-store', label: 'Storage', value: '68%', hint: 'Evidence bucket', tone: 'neutral' },
  { id: 'c-up', label: 'Uptime', value: '99.96%', hint: '30-day', tone: 'success' },
  { id: 'c-sla', label: 'SLA', value: '99.9%', hint: 'Enterprise tier', tone: 'success' },
]

export const SERVICE_GRAPH: ServiceNode[] = [
  { id: 'svc-edge', name: 'Edge / CDN', status: 'operational', dependsOn: [] },
  { id: 'svc-api', name: 'API Gateway', status: 'operational', dependsOn: ['svc-edge'] },
  { id: 'svc-app', name: 'App Services', status: 'operational', dependsOn: ['svc-api'] },
  { id: 'svc-db', name: 'Postgres Primary', status: 'operational', dependsOn: ['svc-app'] },
  { id: 'svc-redis', name: 'Redis Cache', status: 'degraded', dependsOn: ['svc-app'] },
  { id: 'svc-queue', name: 'Job Workers', status: 'operational', dependsOn: ['svc-redis', 'svc-db'] },
  { id: 'svc-ai', name: 'AI Runtime', status: 'operational', dependsOn: ['svc-api', 'svc-queue'] },
  { id: 'svc-storage', name: 'Object Storage', status: 'operational', dependsOn: ['svc-app'] },
]

export const BACKGROUND_JOBS: BackgroundJob[] = [
  { id: 'bj-1', name: 'Evidence index rebuild', queue: 'search', status: 'running', depth: 12, lastRunAt: '2026-08-03T14:10:00.000Z', attempts: 1 },
  { id: 'bj-2', name: 'Webhook delivery batch', queue: 'webhooks', status: 'retrying', depth: 34, lastRunAt: '2026-08-03T14:05:00.000Z', attempts: 3 },
  { id: 'bj-3', name: 'Nightly analytics rollup', queue: 'analytics', status: 'queued', depth: 1, lastRunAt: '2026-08-03T06:00:00.000Z', attempts: 0 },
  { id: 'bj-4', name: 'Backup verify', queue: 'backups', status: 'failed', depth: 0, lastRunAt: '2026-08-03T02:15:00.000Z', attempts: 2 },
  { id: 'bj-5', name: 'SCIM sync', queue: 'identity', status: 'succeeded', depth: 0, lastRunAt: '2026-08-03T13:00:00.000Z', attempts: 1 },
]

export const MAINTENANCE_WINDOWS: MaintenanceWindow[] = [
  { id: 'mw-1', title: 'Postgres minor upgrade', startsAt: '2026-08-04T02:00:00.000Z', endsAt: '2026-08-04T03:00:00.000Z', status: 'scheduled' },
  { id: 'mw-2', title: 'CDN certificate rotation', startsAt: '2026-07-20T01:00:00.000Z', endsAt: '2026-07-20T01:20:00.000Z', status: 'completed' },
]

export const PLATFORM_TIMELINE: PlatformTimelineItem[] = [
  { id: 'pt-1', at: '2026-08-03T13:55:00.000Z', title: 'Incident INC-204 opened', detail: 'Elevated API 5xx on reporting', kind: 'incident' },
  { id: 'pt-2', at: '2026-08-03T12:40:00.000Z', title: 'Production deploy v1.5.0-beta', detail: 'Health verification passed', kind: 'deploy' },
  { id: 'pt-3', at: '2026-08-03T02:00:00.000Z', title: 'Incremental backup completed', detail: '42 GB · verified', kind: 'backup' },
  { id: 'pt-4', at: '2026-08-02T22:10:00.000Z', title: 'Alert: queue depth > 100', detail: 'Auto-scaled workers', kind: 'alert' },
  { id: 'pt-5', at: '2026-08-02T18:00:00.000Z', title: 'Maintenance window scheduled', detail: 'Postgres upgrade Aug 4', kind: 'maintenance' },
]

export const INCIDENTS: IncidentRecord[] = [
  {
    id: 'inc-204',
    title: 'Elevated API errors on reporting endpoints',
    severity: 'high',
    status: 'investigating',
    owner: 'SRE On-call',
    impactedServices: ['API Gateway', 'App Services', 'Reports'],
    customerImpact: 'Board package generation intermittent for ~8% of tenants',
    rootCause: 'Under investigation — suspected connection pool exhaustion after analytics rollup',
    mitigation: 'Increased pool size; rate-limited heavy report jobs',
    postmortem: 'Draft pending resolution',
    aiSummary: 'High severity API regression correlated with analytics rollup spike. Mitigation reduced 5xx by 70%. Continue monitoring queue depth and pool wait.',
    openedAt: '2026-08-03T13:55:00.000Z',
    updatedAt: '2026-08-03T14:20:00.000Z',
    attachments: [
      { id: 'att-1', name: 'grafana-export.png', sizeLabel: '240 KB' },
      { id: 'att-2', name: 'pool-metrics.csv', sizeLabel: '18 KB' },
    ],
    timeline: [
      { id: 'tl-1', at: '2026-08-03T13:55:00.000Z', actor: 'Alertmanager', note: 'Pager triggered: API error rate > 2%' },
      { id: 'tl-2', at: '2026-08-03T14:02:00.000Z', actor: 'SRE On-call', note: 'Acknowledged; opened incident' },
      { id: 'tl-3', at: '2026-08-03T14:15:00.000Z', actor: 'SRE On-call', note: 'Scaled report workers; pool max +20%' },
    ],
  },
  {
    id: 'inc-201',
    title: 'Redis cache latency spike',
    severity: 'medium',
    status: 'monitoring',
    owner: 'Platform',
    impactedServices: ['Redis Cache', 'Job Workers'],
    customerImpact: 'Slightly slower list pages; no data loss',
    rootCause: 'Hot key from knowledge graph fan-out',
    mitigation: 'Added cache sharding for graph adjacency',
    postmortem: 'Not required if closed within 24h',
    aiSummary: 'Medium severity cache contention. Latency normalized after shard. Watch p95 for 2h.',
    openedAt: '2026-08-03T09:10:00.000Z',
    updatedAt: '2026-08-03T11:00:00.000Z',
    attachments: [{ id: 'att-3', name: 'redis-slowlog.txt', sizeLabel: '6 KB' }],
    timeline: [
      { id: 'tl-4', at: '2026-08-03T09:10:00.000Z', actor: 'Watchdog', note: 'Redis p99 > 80ms' },
      { id: 'tl-5', at: '2026-08-03T10:40:00.000Z', actor: 'Platform', note: 'Sharding deployed to staging then production' },
    ],
  },
  {
    id: 'inc-188',
    title: 'Object storage brief unavailability',
    severity: 'critical',
    status: 'resolved',
    owner: 'Infra',
    impactedServices: ['Object Storage', 'Evidence'],
    customerImpact: 'Evidence upload failed for 12 minutes',
    rootCause: 'Provider region network partition',
    mitigation: 'Failed over to secondary region',
    postmortem: 'Completed — improve multi-region failover runbook',
    aiSummary: 'Critical storage outage resolved via failover. RTO met. Update DR drill cadence.',
    openedAt: '2026-07-28T16:00:00.000Z',
    updatedAt: '2026-07-28T17:30:00.000Z',
    attachments: [{ id: 'att-4', name: 'postmortem-inc-188.md', sizeLabel: '12 KB' }],
    timeline: [
      { id: 'tl-6', at: '2026-07-28T16:00:00.000Z', actor: 'Status', note: 'Storage health checks failing' },
      { id: 'tl-7', at: '2026-07-28T16:12:00.000Z', actor: 'Infra', note: 'Failover complete' },
      { id: 'tl-8', at: '2026-07-28T17:30:00.000Z', actor: 'Infra', note: 'Resolved and closed for monitoring' },
    ],
  },
  {
    id: 'inc-170',
    title: 'Scheduled job backlog after deploy',
    severity: 'low',
    status: 'closed',
    owner: 'App Eng',
    impactedServices: ['Job Workers'],
    customerImpact: 'None material',
    rootCause: 'Worker image pull delay',
    mitigation: 'Pre-pull images on nodes',
    postmortem: 'N/A',
    aiSummary: 'Low severity deploy hiccup. Closed after backlog drained.',
    openedAt: '2026-07-10T08:00:00.000Z',
    updatedAt: '2026-07-10T10:00:00.000Z',
    attachments: [],
    timeline: [{ id: 'tl-9', at: '2026-07-10T10:00:00.000Z', actor: 'App Eng', note: 'Closed' }],
  },
]

export const BACKUPS: BackupRecord[] = [
  { id: 'bk-1', name: 'prod-full-2026-08-03', kind: 'full', status: 'verified', sizeLabel: '210 GB', createdAt: '2026-08-03T01:00:00.000Z', location: 's3://ri-dr-east/full', verifiedAt: '2026-08-03T03:10:00.000Z' },
  { id: 'bk-2', name: 'prod-incr-2026-08-03', kind: 'incremental', status: 'succeeded', sizeLabel: '42 GB', createdAt: '2026-08-03T02:00:00.000Z', location: 's3://ri-dr-east/incr', verifiedAt: null },
  { id: 'bk-3', name: 'postgres-snap-14', kind: 'database', status: 'verified', sizeLabel: '96 GB', createdAt: '2026-08-02T23:00:00.000Z', location: 'rds:snapshot:ri-prod-14', verifiedAt: '2026-08-02T23:40:00.000Z' },
  { id: 'bk-4', name: 'evidence-files-week', kind: 'files', status: 'running', sizeLabel: '—', createdAt: '2026-08-03T14:00:00.000Z', location: 's3://ri-dr-east/files', verifiedAt: null },
  { id: 'bk-5', name: 'config-bundle', kind: 'configuration', status: 'failed', sizeLabel: '12 MB', createdAt: '2026-08-03T02:15:00.000Z', location: 's3://ri-dr-east/config', verifiedAt: null },
]

export const RECOVERY_POLICY: RecoveryPolicy = {
  rpoMinutes: 60,
  rtoMinutes: 120,
  schedule: 'Full weekly · Incremental hourly · DB every 6h',
  retentionDays: 35,
  storageLocation: 's3://ri-dr-east (replicated to west)',
}

export const DEPLOYMENTS: DeploymentRecord[] = [
  {
    id: 'dep-1',
    environment: 'production',
    version: '1.5.0-beta',
    previousVersion: '1.3.0-beta',
    status: 'healthy',
    deployedAt: '2026-08-03T12:40:00.000Z',
    deployedBy: 'Release Bot',
    releaseNotes: 'Developer Portal, API Explorer, webhooks, SDK resources.',
    checklist: [
      { id: 'cl-1', label: 'Change approval recorded', done: true },
      { id: 'cl-2', label: 'Migrations dry-run', done: true },
      { id: 'cl-3', label: 'Canary 5%', done: true },
      { id: 'cl-4', label: 'Health verification', done: true },
    ],
    healthVerified: true,
  },
  {
    id: 'dep-2',
    environment: 'staging',
    version: '1.6.0-beta-rc1',
    previousVersion: '1.5.0-beta',
    status: 'deploying',
    deployedAt: '2026-08-03T14:00:00.000Z',
    deployedBy: 'Jordan Lee',
    releaseNotes: 'Production Operations surfaces (ops center, incidents, backups).',
    checklist: [
      { id: 'cl-5', label: 'Change approval recorded', done: true },
      { id: 'cl-6', label: 'Migrations dry-run', done: true },
      { id: 'cl-7', label: 'Canary 5%', done: false },
      { id: 'cl-8', label: 'Health verification', done: false },
    ],
    healthVerified: false,
  },
  {
    id: 'dep-3',
    environment: 'qa',
    version: '1.6.0-beta-rc1',
    previousVersion: '1.5.0-beta',
    status: 'healthy',
    deployedAt: '2026-08-03T10:00:00.000Z',
    deployedBy: 'CI',
    releaseNotes: 'QA soak for Sprint 16.',
    checklist: [
      { id: 'cl-9', label: 'Smoke suite', done: true },
      { id: 'cl-10', label: 'Accessibility checks', done: true },
    ],
    healthVerified: true,
  },
  {
    id: 'dep-4',
    environment: 'development',
    version: '1.6.0-dev',
    previousVersion: '1.5.0-beta',
    status: 'approved',
    deployedAt: '2026-08-03T08:00:00.000Z',
    deployedBy: 'Local',
    releaseNotes: 'Dev tip of main.',
    checklist: [{ id: 'cl-11', label: 'Unit build', done: true }],
    healthVerified: true,
  },
]

export const DEPLOY_FLAGS: FeatureFlagRef[] = [
  { id: 'df-1', key: 'ops.center', enabled: true, environment: 'production' },
  { id: 'df-2', key: 'ops.live_refresh', enabled: true, environment: 'production' },
  { id: 'df-3', key: 'ops.status_page', enabled: true, environment: 'staging' },
  { id: 'df-4', key: 'ops.dr_simulation', enabled: false, environment: 'production' },
]

export const OBS_METRICS: ObservabilityMetrics = {
  cpu: [
    { label: '10:00', value: 42 },
    { label: '11:00', value: 48 },
    { label: '12:00', value: 55 },
    { label: '13:00', value: 61 },
    { label: '14:00', value: 58 },
  ],
  memory: [
    { label: '10:00', value: 62 },
    { label: '11:00', value: 64 },
    { label: '12:00', value: 67 },
    { label: '13:00', value: 70 },
    { label: '14:00', value: 68 },
  ],
  storagePct: 68,
  apiLatencyMs: [
    { label: '10:00', value: 120 },
    { label: '11:00', value: 132 },
    { label: '12:00', value: 148 },
    { label: '13:00', value: 210 },
    { label: '14:00', value: 148 },
  ],
  errorRatePct: [
    { label: '10:00', value: 0.2 },
    { label: '11:00', value: 0.3 },
    { label: '12:00', value: 0.4 },
    { label: '13:00', value: 2.1 },
    { label: '14:00', value: 0.6 },
  ],
  requests: [
    { label: '10:00', value: 4200 },
    { label: '11:00', value: 5100 },
    { label: '12:00', value: 5800 },
    { label: '13:00', value: 6400 },
    { label: '14:00', value: 6100 },
  ],
  queueDepth: [
    { label: '10:00', value: 40 },
    { label: '11:00', value: 55 },
    { label: '12:00', value: 80 },
    { label: '13:00', value: 140 },
    { label: '14:00', value: 127 },
  ],
  aiUsage: [
    { label: '10:00', value: 120 },
    { label: '11:00', value: 180 },
    { label: '12:00', value: 210 },
    { label: '13:00', value: 260 },
    { label: '14:00', value: 240 },
  ],
}

export const LOG_ENTRIES: LogEntry[] = [
  { id: 'log-1', at: '2026-08-03T14:21:00.000Z', level: 'error', service: 'api', message: 'POST /v1/reports/generate 503 pool_timeout' },
  { id: 'log-2', at: '2026-08-03T14:20:40.000Z', level: 'warn', service: 'workers', message: 'Webhook batch retry attempt=3' },
  { id: 'log-3', at: '2026-08-03T14:19:10.000Z', level: 'info', service: 'deploy', message: 'Staging canary started for 1.6.0-beta-rc1' },
  { id: 'log-4', at: '2026-08-03T14:18:00.000Z', level: 'debug', service: 'ai', message: 'Token usage window flushed' },
  { id: 'log-5', at: '2026-08-03T14:15:00.000Z', level: 'info', service: 'api', message: 'Pool max connections updated to 120' },
]

export const TRACES: TraceRecord[] = [
  {
    id: 'tr-1',
    path: 'POST /v1/reports/generate',
    totalMs: 1820,
    status: 503,
    slow: true,
    spans: [
      { id: 'sp-1', name: 'gateway', service: 'edge', durationMs: 40, startMs: 0 },
      { id: 'sp-2', name: 'auth', service: 'api', durationMs: 60, startMs: 40 },
      { id: 'sp-3', name: 'db.query', service: 'postgres', durationMs: 1400, startMs: 100 },
      { id: 'sp-4', name: 'queue.enqueue', service: 'workers', durationMs: 320, startMs: 1500 },
    ],
  },
  {
    id: 'tr-2',
    path: 'GET /v1/policies',
    totalMs: 96,
    status: 200,
    slow: false,
    spans: [
      { id: 'sp-5', name: 'gateway', service: 'edge', durationMs: 12, startMs: 0 },
      { id: 'sp-6', name: 'cache', service: 'redis', durationMs: 18, startMs: 12 },
      { id: 'sp-7', name: 'db.query', service: 'postgres', durationMs: 66, startMs: 30 },
    ],
  },
]

export const ALERT_RULES: AlertRule[] = [
  {
    id: 'ar-1',
    name: 'API error rate',
    metric: 'api.error_rate',
    threshold: '> 2% for 5m',
    severity: 'critical',
    notify: ['pagerduty', 'slack:#ops'],
    escalation: 'Page secondary after 10m',
    silencedUntil: null,
    enabled: true,
  },
  {
    id: 'ar-2',
    name: 'Queue depth',
    metric: 'queue.depth',
    threshold: '> 100',
    severity: 'warning',
    notify: ['slack:#ops'],
    escalation: 'Ticket after 30m',
    silencedUntil: null,
    enabled: true,
  },
  {
    id: 'ar-3',
    name: 'AI token burn',
    metric: 'ai.tokens',
    threshold: '> 50k / 15m',
    severity: 'info',
    notify: ['email:finops'],
    escalation: 'None',
    silencedUntil: '2026-08-03T18:00:00.000Z',
    enabled: true,
  },
]
