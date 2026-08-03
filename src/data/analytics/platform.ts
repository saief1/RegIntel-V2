import type {
  AnalyticsMetric,
  BenchmarkEntity,
  BoardPackageVersion,
  BoardSection,
  BoardTemplate,
  DepartmentPerformance,
  ExecutiveBookmark,
  ExportJob,
  HeatmapCell,
  ImprovementOpportunity,
  KpiDefinition,
  PredictionItem,
  SavedDashboardView,
  ScheduledReport,
  TrendPoint,
} from '../../types/analytics'

export const ANALYTICS_METRICS: AnalyticsMetric[] = [
  { id: 'm-score', label: 'Compliance Score', value: '81', delta: '+2 pts', tone: 'positive', detail: 'Composite of coverage, findings, and SLA.' },
  { id: 'm-coverage', label: 'Policy Coverage', value: '87%', delta: '+3%', tone: 'positive', detail: 'Mapped obligations across published policies.' },
  { id: 'm-approvals', label: 'Outstanding Approvals', value: '5', delta: '−1', tone: 'warning', detail: 'Counsel and CRO queues longest.' },
  { id: 'm-audit', label: 'Audit Readiness', value: '74%', delta: '+4%', tone: 'neutral', detail: 'PBC completeness vs open RFIs.' },
  { id: 'm-evidence', label: 'Evidence Completeness', value: '79%', delta: '+6%', tone: 'positive', detail: 'Freshness window for key controls.' },
  { id: 'm-agents', label: 'Agent Productivity', value: '126', delta: 'runs / 24h', tone: 'neutral', detail: 'Workforce + monitoring completions.' },
  { id: 'm-capacity', label: 'Workload Capacity', value: '68%', delta: 'utilized', tone: 'warning', detail: 'Team load vs forecast demand.' },
  { id: 'm-trend', label: 'Regulatory Trend', value: '↑', delta: '3 material', tone: 'warning', detail: 'FINTRAC / CIRO / OSFI this period.' },
]

export const RISK_HEATMAP: HeatmapCell[] = [
  { department: 'Wealth', riskArea: 'AML', score: 72 },
  { department: 'Wealth', riskArea: 'Custody', score: 84 },
  { department: 'Wealth', riskArea: 'Conduct', score: 61 },
  { department: 'Brokerage', riskArea: 'AML', score: 66 },
  { department: 'Brokerage', riskArea: 'Custody', score: 78 },
  { department: 'Brokerage', riskArea: 'Conduct', score: 70 },
  { department: 'Operations', riskArea: 'AML', score: 55 },
  { department: 'Operations', riskArea: 'Custody', score: 63 },
  { department: 'Operations', riskArea: 'Conduct', score: 48 },
  { department: 'Technology', riskArea: 'AML', score: 44 },
  { department: 'Technology', riskArea: 'Custody', score: 52 },
  { department: 'Technology', riskArea: 'Conduct', score: 58 },
]

export const REGULATORY_TREND: TrendPoint[] = [
  { label: 'Mar', value: 4 },
  { label: 'Apr', value: 6 },
  { label: 'May', value: 5 },
  { label: 'Jun', value: 8 },
  { label: 'Jul', value: 7 },
  { label: 'Aug', value: 9 },
]

export const DEPARTMENT_PERFORMANCE: DepartmentPerformance[] = [
  { id: 'dp-wealth', name: 'Wealth Management', businessUnit: 'Wealth', score: 84, coverage: 90, openApprovals: 1, evidenceCompleteness: 86 },
  { id: 'dp-broker', name: 'Brokerage', businessUnit: 'Markets', score: 78, coverage: 85, openApprovals: 2, evidenceCompleteness: 80 },
  { id: 'dp-ops', name: 'Operations', businessUnit: 'Operations', score: 71, coverage: 76, openApprovals: 1, evidenceCompleteness: 74 },
  { id: 'dp-tech', name: 'Technology', businessUnit: 'Technology', score: 69, coverage: 72, openApprovals: 1, evidenceCompleteness: 70 },
]

export const SAVED_VIEWS: SavedDashboardView[] = [
  {
    id: 'view-exec',
    name: 'Executive default',
    dateRange: '30d',
    businessUnit: 'all',
    favorite: true,
    shared: true,
    permission: 'admin',
    createdAt: '2026-07-01T10:00:00.000Z',
  },
  {
    id: 'view-wealth',
    name: 'Wealth focus',
    dateRange: '90d',
    businessUnit: 'Wealth',
    favorite: true,
    shared: false,
    permission: 'edit',
    createdAt: '2026-07-18T10:00:00.000Z',
  },
  {
    id: 'view-board',
    name: 'Board prep',
    dateRange: 'ytd',
    businessUnit: 'all',
    favorite: false,
    shared: true,
    permission: 'view',
    createdAt: '2026-08-01T10:00:00.000Z',
  },
]

export const KPI_CATALOG_METRICS = [
  'Open high-risk findings',
  'Avg policy review days',
  'Regulatory response SLA %',
  'Control coverage %',
  'Agent success rate %',
  'Evidence freshness %',
  'Approval wait hours',
]

export const KPI_DEFINITIONS: KpiDefinition[] = [
  {
    id: 'kpi-findings',
    name: 'Open High-Risk Findings',
    description: 'Count of open findings rated high or critical.',
    formula: 'COUNT(findings WHERE severity IN (high, critical) AND status != closed)',
    metrics: ['Open high-risk findings'],
    thresholdWarn: 5,
    thresholdCritical: 10,
    currentValue: 4,
    goal: 3,
    unit: 'findings',
    alertEnabled: true,
    schedule: 'Weekly Monday 08:00',
    trend: [
      { label: 'W1', value: 7 },
      { label: 'W2', value: 6 },
      { label: 'W3', value: 5 },
      { label: 'W4', value: 4 },
    ],
  },
  {
    id: 'kpi-review',
    name: 'Average Policy Review Time',
    description: 'Mean days from draft to published approval.',
    formula: 'AVG(publishedAt - draftedAt) IN days',
    metrics: ['Avg policy review days'],
    thresholdWarn: 21,
    thresholdCritical: 35,
    currentValue: 18,
    goal: 14,
    unit: 'days',
    alertEnabled: true,
    schedule: 'Monthly 1st',
    trend: [
      { label: 'Apr', value: 24 },
      { label: 'May', value: 22 },
      { label: 'Jun', value: 20 },
      { label: 'Jul', value: 18 },
    ],
  },
  {
    id: 'kpi-sla',
    name: 'Regulatory Response SLA',
    description: 'Percent of regulatory items closed within SLA.',
    formula: 'closed_in_sla / total_due * 100',
    metrics: ['Regulatory response SLA %'],
    thresholdWarn: 85,
    thresholdCritical: 75,
    currentValue: 88,
    goal: 95,
    unit: '%',
    alertEnabled: true,
    schedule: 'Weekly Friday 16:00',
    trend: [
      { label: 'W1', value: 82 },
      { label: 'W2', value: 85 },
      { label: 'W3', value: 87 },
      { label: 'W4', value: 88 },
    ],
  },
  {
    id: 'kpi-control',
    name: 'Control Coverage',
    description: 'Share of key controls with current evidence.',
    formula: 'controls_with_evidence / key_controls * 100',
    metrics: ['Control coverage %', 'Evidence freshness %'],
    thresholdWarn: 80,
    thresholdCritical: 70,
    currentValue: 83,
    goal: 90,
    unit: '%',
    alertEnabled: false,
    schedule: 'Bi-weekly',
    trend: [
      { label: 'W1', value: 78 },
      { label: 'W2', value: 80 },
      { label: 'W3', value: 81 },
      { label: 'W4', value: 83 },
    ],
  },
  {
    id: 'kpi-agent',
    name: 'Agent Success Rate',
    description: 'Successful autonomous runs over total runs.',
    formula: 'successful_runs / total_runs * 100',
    metrics: ['Agent success rate %'],
    thresholdWarn: 90,
    thresholdCritical: 80,
    currentValue: 93,
    goal: 95,
    unit: '%',
    alertEnabled: true,
    schedule: 'Daily 07:00',
    trend: [
      { label: 'D1', value: 90 },
      { label: 'D2', value: 91 },
      { label: 'D3', value: 94 },
      { label: 'D4', value: 93 },
    ],
  },
]

export const PREDICTIONS: PredictionItem[] = [
  {
    id: 'pred-workload',
    title: 'Upcoming regulatory workload',
    category: 'workload',
    confidence: 88,
    horizon: 'Next 30 days',
    forecast: '42 agent-hours and 11 human review hours expected.',
    reasoning: 'Three material notices plus quarterly control sampling window overlap.',
    mitigation: 'Pre-approve queue capacity and temporarily resume Control Reviewer.',
  },
  {
    id: 'pred-audit',
    title: 'Predicted audit findings',
    category: 'audit',
    confidence: 76,
    horizon: 'Next audit cycle',
    forecast: '2–3 medium findings likely in evidence freshness for access controls.',
    reasoning: 'C-12 attestations historically lag in Technology before sampling.',
    mitigation: 'Run Evidence Collector weekly through month-end.',
  },
  {
    id: 'pred-dept',
    title: 'Departments at highest risk',
    category: 'department_risk',
    confidence: 84,
    horizon: 'Next 45 days',
    forecast: 'Operations and Technology elevate above threshold if custody theme continues.',
    reasoning: 'Heatmap cells for custody + incomplete vendor attestations.',
    mitigation: 'Assign temporary compliance surge support to Operations.',
  },
  {
    id: 'pred-resources',
    title: 'Resource forecasting',
    category: 'resources',
    confidence: 81,
    horizon: 'Next 2 weeks',
    forecast: 'Counsel capacity shortfall of ~6 hours on Tuesday–Wednesday.',
    reasoning: 'Approval bottleneck pattern + two policy drafts in flight.',
    mitigation: 'Rebalance reviewers or stagger AI draft generation.',
  },
  {
    id: 'pred-deadlines',
    title: 'Deadline forecasting',
    category: 'deadlines',
    confidence: 90,
    horizon: 'Next 14 days',
    forecast: '11 deadlines; 3 board-related; 2 at slip risk.',
    reasoning: 'Historical slip rate on items waiting >18h in approval.',
    mitigation: 'Clear pending approval queue before Thursday pack freeze.',
  },
  {
    id: 'pred-policy',
    title: 'Policy review predictions',
    category: 'policy_review',
    confidence: 79,
    horizon: 'Next quarter',
    forecast: 'AML and Cyber policies likely to require interim updates.',
    reasoning: 'Regulatory trend velocity and open mapping gaps.',
    mitigation: 'Schedule Policy Writer dry-runs with counsel checkpoints.',
  },
  {
    id: 'pred-agents',
    title: 'Agent workload prediction',
    category: 'agent_workload',
    confidence: 86,
    horizon: 'Next 7 days',
    forecast: 'Evidence Collector and Regulatory Monitor will peak mid-week.',
    reasoning: 'Sync cadence + publication volume correlation.',
    mitigation: 'Raise Monitor schedule frequency only after Box reconnect.',
  },
]

export const BOARD_SECTIONS: BoardSection[] = [
  {
    id: 'sec-exec',
    title: 'Executive summary',
    body: 'Compliance health improved to 81% with residual risk concentrated in custody and third-party themes.',
    bullets: ['Material regulatory activity elevated this month', 'Autonomous agents supervised 126 jobs in 24h'],
  },
  {
    id: 'sec-risk',
    title: 'Risk summary',
    body: 'Organization risk score is 68. Vendor and custody exposures drive the residual.',
    bullets: ['4 critical issues open', 'Box authentication blocking vendor questionnaires'],
  },
  {
    id: 'sec-regs',
    title: 'Regulatory updates',
    body: 'Seven changes monitored; three assessed as material to Wealth and Brokerage.',
    bullets: ['CIRO custody notice in approval queue', 'FINTRAC guidance informing AML §4 draft'],
  },
  {
    id: 'sec-ai',
    title: 'AI insights',
    body: 'Predictive models indicate counsel capacity pressure mid-week and elevated Operations risk.',
    bullets: ['Agent success rate 93%', 'Two human approval checkpoints pending'],
  },
  {
    id: 'sec-metrics',
    title: 'Key metrics',
    body: 'Coverage, evidence completeness, and SLA performance are within executive thresholds.',
    bullets: ['Policy coverage 87%', 'Regulatory response SLA 88%'],
  },
  {
    id: 'sec-policy',
    title: 'Policy changes',
    body: 'AML Policy draft update in counsel review; Cyber Policy awaiting residual edits.',
    bullets: ['1 policy published YTD in period', '2 drafts in approval'],
  },
  {
    id: 'sec-approvals',
    title: 'Approval activity',
    body: 'Average approval wait is 18 hours. CRO and counsel remain the longest queues.',
    bullets: ['5 outstanding approvals', 'Bulk approve available in autonomous queue'],
  },
  {
    id: 'sec-agents',
    title: 'Agent activity',
    body: 'Workforce agents continued monitoring, evidence collection, and board preview generation.',
    bullets: ['Vendor Risk Agent unhealthy pending reconnect', 'Board Report Generator ready for monthly pack'],
  },
  {
    id: 'sec-issues',
    title: 'Open issues',
    body: 'Critical items require reconnect of Box and approval of CIRO triage.',
    bullets: ['CIRO custody notice', 'Box auth failure', 'Counsel backlog'],
  },
  {
    id: 'sec-recs',
    title: 'Recommendations',
    body: 'Leadership should prioritize identity reconnect, approval clearance, and Operations surge support.',
    bullets: ['Reconnect Box', 'Approve CIRO triage', 'Fund temporary Operations compliance support'],
  },
]

export const BOARD_TEMPLATES: BoardTemplate[] = [
  {
    id: 'tpl-standard',
    name: 'Standard board pack',
    sectionOrder: BOARD_SECTIONS.map((s) => s.id),
    schedule: 'Monthly · first Monday',
    createdAt: '2026-06-01T09:00:00.000Z',
  },
  {
    id: 'tpl-risk',
    name: 'Risk-first template',
    sectionOrder: ['sec-risk', 'sec-issues', 'sec-recs', 'sec-exec', 'sec-metrics', 'sec-ai', 'sec-regs', 'sec-policy', 'sec-approvals', 'sec-agents'],
    schedule: 'Quarterly',
    createdAt: '2026-07-10T09:00:00.000Z',
  },
]

export const BOARD_VERSIONS: BoardPackageVersion[] = [
  { id: 'bv-01', title: 'August board preview', createdAt: '2026-08-02T12:00:00.000Z', format: 'pdf', status: 'ready' },
  { id: 'bv-02', title: 'July board package', createdAt: '2026-07-05T12:00:00.000Z', format: 'pdf', status: 'ready' },
]

export const BENCHMARKS: BenchmarkEntity[] = [
  { id: 'b-wealth', name: 'Wealth Management', kind: 'department', complianceMaturity: 86, policyCoverage: 90, auditReadiness: 82, agentEfficiency: 88, workCompletion: 85, riskExposure: 62, reviewSpeed: 80 },
  { id: 'b-broker', name: 'Brokerage', kind: 'department', complianceMaturity: 80, policyCoverage: 85, auditReadiness: 78, agentEfficiency: 84, workCompletion: 81, riskExposure: 68, reviewSpeed: 76 },
  { id: 'b-ops', name: 'Operations', kind: 'department', complianceMaturity: 72, policyCoverage: 76, auditReadiness: 70, agentEfficiency: 79, workCompletion: 74, riskExposure: 74, reviewSpeed: 71 },
  { id: 'b-tech', name: 'Technology', kind: 'department', complianceMaturity: 70, policyCoverage: 72, auditReadiness: 68, agentEfficiency: 90, workCompletion: 77, riskExposure: 71, reviewSpeed: 69 },
  { id: 'b-ca', name: 'Canada', kind: 'region', complianceMaturity: 84, policyCoverage: 88, auditReadiness: 80, agentEfficiency: 87, workCompletion: 83, riskExposure: 60, reviewSpeed: 82 },
  { id: 'b-us', name: 'United States', kind: 'region', complianceMaturity: 78, policyCoverage: 82, auditReadiness: 76, agentEfficiency: 85, workCompletion: 80, riskExposure: 66, reviewSpeed: 75 },
  { id: 'b-bu-w', name: 'Wealth BU', kind: 'business_unit', complianceMaturity: 85, policyCoverage: 89, auditReadiness: 81, agentEfficiency: 86, workCompletion: 84, riskExposure: 63, reviewSpeed: 79 },
  { id: 'b-prod', name: 'Advisory Products', kind: 'product_line', complianceMaturity: 77, policyCoverage: 80, auditReadiness: 74, agentEfficiency: 83, workCompletion: 78, riskExposure: 69, reviewSpeed: 73 },
]

export const IMPROVEMENTS: ImprovementOpportunity[] = [
  { id: 'imp-1', entityName: 'Operations', metric: 'Audit readiness', gap: '−12 vs Wealth', recommendation: 'Increase evidence sampling cadence and assign surge reviewer.' },
  { id: 'imp-2', entityName: 'Technology', metric: 'Policy coverage', gap: '−18 vs Wealth', recommendation: 'Close mapping gaps on access and change-management controls.' },
  { id: 'imp-3', entityName: 'United States', metric: 'Review speed', gap: '−7 vs Canada', recommendation: 'Align approval SLAs and expand counsel coverage windows.' },
]

export const EXPORT_QUEUE: ExportJob[] = [
  { id: 'ex-01', title: 'Analytics dashboard · 30d', format: 'pdf', status: 'ready', createdAt: '2026-08-02T21:00:00.000Z', destination: 'Exports / Executive' },
  { id: 'ex-02', title: 'Benchmark CSV', format: 'csv', status: 'queued', createdAt: '2026-08-02T22:10:00.000Z', destination: 'Exports / Analytics' },
]

export const BOOKMARKS: ExecutiveBookmark[] = [
  { id: 'bm-1', label: 'Analytics Center', href: '/reports/analytics', createdAt: '2026-07-20T10:00:00.000Z' },
  { id: 'bm-2', label: 'Board Studio', href: '/reports/board', createdAt: '2026-07-22T10:00:00.000Z' },
  { id: 'bm-3', label: 'Command Center', href: '/reports/command', createdAt: '2026-08-01T10:00:00.000Z' },
]

export const SCHEDULED_REPORTS: ScheduledReport[] = [
  { id: 'sr-1', name: 'Weekly compliance scorecard', cadence: 'Weekly Monday 07:00', format: 'pdf', recipients: 'cco@regintel.example', nextRunAt: '2026-08-04T07:00:00.000Z', enabled: true },
  { id: 'sr-2', name: 'Monthly board package', cadence: 'Monthly 1st 08:00', format: 'pdf', recipients: 'board-sec@regintel.example', nextRunAt: '2026-09-01T08:00:00.000Z', enabled: true },
  { id: 'sr-3', name: 'Benchmark export', cadence: 'Monthly 15th', format: 'xlsx', recipients: 'analytics@regintel.example', nextRunAt: '2026-08-15T09:00:00.000Z', enabled: false },
]

export const BUSINESS_UNITS = ['all', 'Wealth', 'Markets', 'Operations', 'Technology'] as const
