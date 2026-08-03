import type {
  ActivityTimelineItem,
  CustomIntegrationDraft,
  DigitalTwinDepartment,
  LineageEdge,
  LineageNode,
  MarketplaceConnector,
  TwinForecastPoint,
  TwinSimulation,
  WorkflowDefinition,
  WorkflowVersion,
} from '../../types/ecosystem'

function sync(id: string, at: string, result: 'success' | 'warning' | 'error', message: string) {
  return { id, at, result, message }
}

export const MARKETPLACE_CONNECTORS: MarketplaceConnector[] = [
  { id: 'mp-m365', name: 'Microsoft 365', category: 'productivity', vendor: 'Microsoft', description: 'Mail, calendar, and identity graph for compliance workflows.', state: 'enabled', connectionStatus: 'connected', permissions: ['Mail.Read', 'User.Read'], configSummary: 'Tenant contoso.onmicrosoft.com', syncHistory: [sync('s1', '2026-08-03T01:00:00.000Z', 'success', 'Delta sync 120 events')] },
  { id: 'mp-google', name: 'Google Workspace', category: 'productivity', vendor: 'Google', description: 'Drive and directory sync for evidence collection.', state: 'available', connectionStatus: 'unknown', permissions: ['drive.readonly', 'admin.directory'], configSummary: 'Not configured', syncHistory: [] },
  { id: 'mp-sharepoint', name: 'SharePoint', category: 'cloud_storage', vendor: 'Microsoft', description: 'Policy library and attestation document sync.', state: 'enabled', connectionStatus: 'connected', permissions: ['Sites.Read.All'], configSummary: 'Site /sites/compliance', syncHistory: [sync('s2', '2026-08-03T00:30:00.000Z', 'success', '18 attestations')] },
  { id: 'mp-onedrive', name: 'OneDrive', category: 'cloud_storage', vendor: 'Microsoft', description: 'Personal and shared drive evidence pulls.', state: 'installed', connectionStatus: 'disconnected', permissions: ['Files.Read.All'], configSummary: 'Awaiting consent', syncHistory: [] },
  { id: 'mp-slack', name: 'Slack', category: 'communication', vendor: 'Slack', description: 'Channel notifications and approval reminders.', state: 'enabled', connectionStatus: 'connected', permissions: ['chat:write', 'channels:read'], configSummary: 'Workspace regintel', syncHistory: [sync('s3', '2026-08-02T22:00:00.000Z', 'success', 'Posted 4 reminders')] },
  { id: 'mp-teams', name: 'Microsoft Teams', category: 'communication', vendor: 'Microsoft', description: 'Adaptive card approvals and channel alerts.', state: 'enabled', connectionStatus: 'connected', permissions: ['ChannelMessage.Send'], configSummary: 'Team Compliance Ops', syncHistory: [sync('s4', '2026-08-02T21:00:00.000Z', 'success', 'Approval card delivered')] },
  { id: 'mp-jira', name: 'Jira', category: 'ticketing', vendor: 'Atlassian', description: 'Issue sync for remediation tasks.', state: 'enabled', connectionStatus: 'degraded', permissions: ['read:jira-work', 'write:jira-work'], configSummary: 'Project COMP', syncHistory: [sync('s5', '2026-08-02T20:00:00.000Z', 'warning', 'Rate limit approaching')] },
  { id: 'mp-confluence', name: 'Confluence', category: 'productivity', vendor: 'Atlassian', description: 'Policy draft publishing to spaces.', state: 'installed', connectionStatus: 'disconnected', permissions: ['read:confluence', 'write:confluence'], configSummary: 'Space COMP', syncHistory: [] },
  { id: 'mp-snow', name: 'ServiceNow', category: 'ticketing', vendor: 'ServiceNow', description: 'Incident and change ticket orchestration.', state: 'enabled', connectionStatus: 'connected', permissions: ['incident.read', 'change.write'], configSummary: 'Instance regintel.service-now.com', syncHistory: [sync('s6', '2026-08-02T19:00:00.000Z', 'success', 'Mapped 3 tickets')] },
  { id: 'mp-salesforce', name: 'Salesforce', category: 'crm', vendor: 'Salesforce', description: 'Client account risk attributes for KYC overlays.', state: 'available', connectionStatus: 'unknown', permissions: ['api'], configSummary: 'Not configured', syncHistory: [] },
  { id: 'mp-okta', name: 'Okta', category: 'identity', vendor: 'Okta', description: 'SSO and group provisioning signals.', state: 'available', connectionStatus: 'unknown', permissions: ['okta.users.read'], configSummary: 'Not configured', syncHistory: [] },
  { id: 'mp-aad', name: 'Azure AD', category: 'identity', vendor: 'Microsoft', description: 'Directory sync and conditional access signals.', state: 'installed', connectionStatus: 'disconnected', permissions: ['Directory.Read.All'], configSummary: 'App registration pending', syncHistory: [] },
  { id: 'mp-aws', name: 'AWS', category: 'security', vendor: 'Amazon', description: 'CloudTrail and Config posture for control evidence.', state: 'available', connectionStatus: 'unknown', permissions: ['config:Describe*', 's3:GetObject'], configSummary: 'Not configured', syncHistory: [] },
  { id: 'mp-azure', name: 'Azure', category: 'security', vendor: 'Microsoft', description: 'Azure Policy and Defender signals.', state: 'available', connectionStatus: 'unknown', permissions: ['Reader'], configSummary: 'Not configured', syncHistory: [] },
  { id: 'mp-gcp', name: 'Google Cloud', category: 'security', vendor: 'Google', description: 'GCP audit logs for control testing.', state: 'available', connectionStatus: 'unknown', permissions: ['logging.viewer'], configSummary: 'Not configured', syncHistory: [] },
  { id: 'mp-box', name: 'Box', category: 'cloud_storage', vendor: 'Box', description: 'Vendor questionnaire vault.', state: 'enabled', connectionStatus: 'degraded', permissions: ['root_readonly'], configSummary: 'Auth refresh failing', syncHistory: [sync('s7', '2026-08-02T15:00:00.000Z', 'error', 'Token refresh failed')] },
  { id: 'mp-dropbox', name: 'Dropbox', category: 'cloud_storage', vendor: 'Dropbox', description: 'Legacy evidence folder sync.', state: 'available', connectionStatus: 'unknown', permissions: ['files.metadata.read'], configSummary: 'Not configured', syncHistory: [] },
  { id: 'mp-github', name: 'GitHub', category: 'security', vendor: 'GitHub', description: 'Policy-as-code and control repo scanning.', state: 'installed', connectionStatus: 'connected', permissions: ['repo', 'read:org'], configSummary: 'Org regintel-controls', syncHistory: [sync('s8', '2026-08-02T18:00:00.000Z', 'success', 'Scanned 2 repos')] },
  { id: 'mp-workday', name: 'Workday', category: 'hr', vendor: 'Workday', description: 'HRIS roles for training and SoD checks.', state: 'available', connectionStatus: 'unknown', permissions: ['Worker_Data'], configSummary: 'Not configured', syncHistory: [] },
  { id: 'mp-sap', name: 'SAP', category: 'erp', vendor: 'SAP', description: 'ERP control samples for financial compliance.', state: 'available', connectionStatus: 'unknown', permissions: ['rfc_read'], configSummary: 'Not configured', syncHistory: [] },
  { id: 'mp-oneTrust', name: 'OneTrust', category: 'compliance', vendor: 'OneTrust', description: 'Privacy assessments and DPIA sync.', state: 'available', connectionStatus: 'unknown', permissions: ['assessments.read'], configSummary: 'Not configured', syncHistory: [] },
]

export const BUILDER_STEPS = [
  'Trigger',
  'Authentication',
  'Request',
  'Mapping',
  'Transformation',
  'Validation',
  'Response',
  'Logging',
] as const

export const CUSTOM_INTEGRATIONS: CustomIntegrationDraft[] = [
  {
    id: 'ci-1',
    name: 'Nightly evidence webhook',
    protocol: 'webhook',
    authType: 'api_key',
    endpoint: 'https://hooks.regintel.example/evidence',
    mapping: 'payload.items[] → evidence.title/url',
    transformation: 'Normalize MIME types; drop duplicates by hash',
    validation: 'Require title + sha256',
    createdAt: '2026-07-20T10:00:00.000Z',
    status: 'published',
    steps: [...BUILDER_STEPS],
  },
]

export const WORKFLOW_DEFINITION: WorkflowDefinition = {
  id: 'wf-canvas-1',
  name: 'Critical finding response',
  version: 3,
  status: 'draft',
  updatedAt: '2026-08-03T00:10:00.000Z',
  validationErrors: [],
  nodes: [
    { id: 'n1', type: 'trigger', label: 'Trigger', x: 40, y: 160 },
    { id: 'n2', type: 'decision', label: 'Decision', x: 160, y: 160 },
    { id: 'n3', type: 'ai', label: 'AI', x: 280, y: 80 },
    { id: 'n4', type: 'approval', label: 'Approval', x: 280, y: 240 },
    { id: 'n5', type: 'parallel', label: 'Parallel', x: 400, y: 160 },
    { id: 'n6', type: 'human_task', label: 'Human Task', x: 520, y: 80 },
    { id: 'n7', type: 'agent', label: 'Agent', x: 520, y: 240 },
    { id: 'n8', type: 'notification', label: 'Notification', x: 640, y: 80 },
    { id: 'n9', type: 'api', label: 'API', x: 640, y: 240 },
    { id: 'n10', type: 'merge', label: 'Merge', x: 760, y: 160 },
    { id: 'n11', type: 'report', label: 'Report', x: 880, y: 120 },
    { id: 'n12', type: 'delay', label: 'Delay', x: 880, y: 220 },
    { id: 'n13', type: 'complete', label: 'Complete', x: 1000, y: 160 },
  ],
  edges: [
    { id: 'e1', from: 'n1', to: 'n2' },
    { id: 'e2', from: 'n2', to: 'n3', label: 'high' },
    { id: 'e3', from: 'n2', to: 'n4', label: 'low' },
    { id: 'e4', from: 'n3', to: 'n5' },
    { id: 'e5', from: 'n4', to: 'n5' },
    { id: 'e6', from: 'n5', to: 'n6' },
    { id: 'e7', from: 'n5', to: 'n7' },
    { id: 'e8', from: 'n6', to: 'n8' },
    { id: 'e9', from: 'n7', to: 'n9' },
    { id: 'e10', from: 'n8', to: 'n10' },
    { id: 'e11', from: 'n9', to: 'n10' },
    { id: 'e12', from: 'n10', to: 'n11' },
    { id: 'e13', from: 'n10', to: 'n12' },
    { id: 'e14', from: 'n11', to: 'n13' },
    { id: 'e15', from: 'n12', to: 'n13' },
  ],
}

export const WORKFLOW_VERSIONS: WorkflowVersion[] = [
  { id: 'wv-3', workflowId: 'wf-canvas-1', version: 3, label: 'Current draft', createdAt: '2026-08-03T00:10:00.000Z', snapshotName: 'v3-draft' },
  { id: 'wv-2', workflowId: 'wf-canvas-1', version: 2, label: 'Published stable', createdAt: '2026-07-28T10:00:00.000Z', snapshotName: 'v2-published' },
  { id: 'wv-1', workflowId: 'wf-canvas-1', version: 1, label: 'Initial release', createdAt: '2026-07-10T10:00:00.000Z', snapshotName: 'v1-initial' },
]

export const LINEAGE_NODES: LineageNode[] = [
  { id: 'ln-reg', label: 'CIRO 26-08', kind: 'regulation', x: 60, y: 60, origin: 'Regulatory feed', lastChangedBy: 'Regulatory Monitor', lastChangedAt: '2026-08-02T22:50:00.000Z', changeSummary: 'Imported notice', href: '/regulatory-changes/rc-01' },
  { id: 'ln-pol', label: 'AML Policy', kind: 'policy', x: 200, y: 140, origin: 'Policy Workspace', lastChangedBy: 'Policy Writer', lastChangedAt: '2026-08-02T20:10:00.000Z', changeSummary: 'Draft §4 update', href: '/knowledge/policies/pol-aml' },
  { id: 'ln-ctrl', label: 'Control C-44', kind: 'control', x: 340, y: 60, origin: 'Control library', lastChangedBy: 'Compliance Analyst', lastChangedAt: '2026-08-01T14:00:00.000Z', changeSummary: 'Coverage remapped' },
  { id: 'ln-risk', label: 'Risk VR-09', kind: 'risk', x: 340, y: 220, origin: 'Risk register', lastChangedBy: 'Vendor Risk Agent', lastChangedAt: '2026-08-02T15:00:00.000Z', changeSummary: 'Elevated residual' },
  { id: 'ln-find', label: 'Finding F-12', kind: 'finding', x: 480, y: 140, origin: 'Audit Center', lastChangedBy: 'Jordan Blake', lastChangedAt: '2026-08-02T11:00:00.000Z', changeSummary: 'Opened high finding', href: '/audit' },
  { id: 'ln-task', label: 'Counsel review', kind: 'task', x: 620, y: 60, origin: 'Action Center', lastChangedBy: 'Automation Studio', lastChangedAt: '2026-08-02T15:05:00.000Z', changeSummary: 'Task auto-created', href: '/work/tasks/task-02' },
  { id: 'ln-ev', label: 'Evidence pack', kind: 'evidence', x: 620, y: 220, origin: 'SharePoint', lastChangedBy: 'Evidence Collector', lastChangedAt: '2026-08-02T22:55:00.000Z', changeSummary: '18 artifacts linked' },
  { id: 'ln-rep', label: 'Board preview', kind: 'report', x: 760, y: 140, origin: 'Board Studio', lastChangedBy: 'Board Report Generator', lastChangedAt: '2026-08-02T12:00:00.000Z', changeSummary: 'Monthly pack drafted', href: '/reports/board' },
]

export const LINEAGE_EDGES: LineageEdge[] = [
  { id: 'le1', from: 'ln-reg', to: 'ln-pol', label: 'informs' },
  { id: 'le2', from: 'ln-pol', to: 'ln-ctrl', label: 'requires' },
  { id: 'le3', from: 'ln-pol', to: 'ln-risk', label: 'exposes' },
  { id: 'le4', from: 'ln-ctrl', to: 'ln-find', label: 'gap →' },
  { id: 'le5', from: 'ln-risk', to: 'ln-find', label: 'drives' },
  { id: 'le6', from: 'ln-find', to: 'ln-task', label: 'remediation' },
  { id: 'le7', from: 'ln-find', to: 'ln-ev', label: 'needs' },
  { id: 'le8', from: 'ln-task', to: 'ln-rep', label: 'reported in' },
  { id: 'le9', from: 'ln-ev', to: 'ln-rep', label: 'supports' },
]

export const TWIN_DEPARTMENTS: DigitalTwinDepartment[] = [
  { id: 'td-wealth', name: 'Wealth Management', reviewers: 4, maturity: 86, openRisks: 2, workloadHours: 38, bottleneck: 'Counsel review' },
  { id: 'td-broker', name: 'Brokerage', reviewers: 3, maturity: 80, openRisks: 3, workloadHours: 42, bottleneck: 'Approval wait' },
  { id: 'td-ops', name: 'Operations', reviewers: 2, maturity: 72, openRisks: 4, workloadHours: 51, bottleneck: 'Evidence freshness' },
  { id: 'td-tech', name: 'Technology', reviewers: 2, maturity: 70, openRisks: 3, workloadHours: 47, bottleneck: 'Access reviews' },
]

export const TWIN_SIMULATIONS: TwinSimulation[] = [
  {
    id: 'sim-reviewers',
    label: 'If we add 2 reviewers',
    description: 'Increase human review capacity across Wealth and Operations.',
    impact: {
      cycleTimeDeltaPct: -18,
      riskDelta: -4,
      capacityDeltaPct: 22,
      coverageDeltaPct: 3,
      summary: 'Approval wait drops below 12h; Operations risk score improves.',
    },
  },
  {
    id: 'sim-volume',
    label: 'If regulation volume increases 20%',
    description: 'Stress test monitoring and triage capacity.',
    impact: {
      cycleTimeDeltaPct: 27,
      riskDelta: 6,
      capacityDeltaPct: -15,
      coverageDeltaPct: -2,
      summary: 'Queue depth exceeds SLA without pausing low-priority agent jobs.',
    },
  },
  {
    id: 'sim-ai',
    label: 'If AI handles first review',
    description: 'Route first-pass reviews through Compliance Analyst agent.',
    impact: {
      cycleTimeDeltaPct: -24,
      riskDelta: -2,
      capacityDeltaPct: 30,
      coverageDeltaPct: 5,
      summary: 'Human reviewers focus on exceptions; agent confidence gate at 85%.',
    },
  },
]

export const TWIN_FORECAST: TwinForecastPoint[] = [
  { label: 'W1', baseline: 40, simulated: 40 },
  { label: 'W2', baseline: 44, simulated: 38 },
  { label: 'W3', baseline: 48, simulated: 36 },
  { label: 'W4', baseline: 52, simulated: 34 },
]

export const ECOSYSTEM_ACTIVITY: ActivityTimelineItem[] = [
  { id: 'ea-1', at: '2026-08-03T01:00:00.000Z', source: 'integration', title: 'Microsoft 365 sync', detail: 'Delta sync completed', href: '/integrations/marketplace' },
  { id: 'ea-2', at: '2026-08-03T00:30:00.000Z', source: 'integration', title: 'SharePoint sync', detail: '18 attestations collected', href: '/integrations' },
  { id: 'ea-3', at: '2026-08-03T00:10:00.000Z', source: 'workflow', title: 'Workflow canvas saved', detail: 'Critical finding response v3', href: '/automation/canvas' },
  { id: 'ea-4', at: '2026-08-02T22:55:00.000Z', source: 'lineage', title: 'Evidence linked', detail: 'Evidence pack → Board preview', href: '/data/lineage' },
  { id: 'ea-5', at: '2026-08-02T15:00:00.000Z', source: 'marketplace', title: 'Box connector degraded', detail: 'Token refresh failed', href: '/integrations/marketplace' },
]

export const MARKETPLACE_CATEGORIES: Array<{ id: MarketplaceConnector['category']; label: string }> = [
  { id: 'identity', label: 'Identity' },
  { id: 'productivity', label: 'Productivity' },
  { id: 'ticketing', label: 'Ticketing' },
  { id: 'cloud_storage', label: 'Cloud Storage' },
  { id: 'communication', label: 'Communication' },
  { id: 'crm', label: 'CRM' },
  { id: 'hr', label: 'HR' },
  { id: 'erp', label: 'ERP' },
  { id: 'security', label: 'Security' },
  { id: 'compliance', label: 'Compliance' },
]
