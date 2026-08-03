import type {
  AdoptionSummary,
  BillingContact,
  BillingNotification,
  CommercialRecommendation,
  Contract,
  CostBreakdownItem,
  CustomerOrgProfile,
  CustomerTimelineEvent,
  DeploymentStatus,
  DepartmentUsage,
  EnvironmentLicense,
  FeatureAdoptionStat,
  FeatureEntitlement,
  HealthScore,
  Invoice,
  LicenseAlert,
  LicenseSummary,
  MarketingResource,
  ModuleLicense,
  Partner,
  PartnerCertification,
  PartnerRevenueMetric,
  PartnerTraining,
  PaymentMethod,
  PlanFeatureFlag,
  PlanOption,
  ProductUpdate,
  QbrSummary,
  Referral,
  RegisteredDeal,
  RenewalReadiness,
  SeatAssignment,
  Subscription,
  SuccessManager,
  SupportTicket,
  TaxInfo,
  TopUser,
  TrainingItem,
  TrialLicense,
  UpgradeRecommendation,
  UsageMeter,
  UsageSeriesPoint,
} from '../../types/commercial'

export const SUBSCRIPTION: Subscription = {
  plan: 'professional',
  planLabel: 'Professional',
  status: 'trial',
  trialEndsAt: '2026-08-17T23:59:59.000Z',
  renewsAt: '2026-09-03T00:00:00.000Z',
  seatsIncluded: 25,
  seatsUsed: 18,
  billingCycle: 'annual',
  currency: 'USD',
  amountCents: 4800000,
}

export const USAGE_METERS: UsageMeter[] = [
  { id: 'seats', label: 'Seats', used: 18, limit: 25, unit: 'users', warnAtPct: 80 },
  { id: 'ai', label: 'AI requests', used: 14200, limit: 20000, unit: 'requests', warnAtPct: 80 },
  { id: 'api', label: 'API calls', used: 860000, limit: 1000000, unit: 'calls', warnAtPct: 85 },
  { id: 'storage', label: 'Storage', used: 420, limit: 500, unit: 'GB', warnAtPct: 85 },
  { id: 'compliance', label: 'Compliance volume', used: 1180, limit: 1500, unit: 'cases', warnAtPct: 80 },
]

export const PLAN_OPTIONS: PlanOption[] = [
  {
    id: 'starter',
    name: 'Starter',
    priceLabel: '$1,200 / mo',
    seats: '10 seats',
    highlights: ['Core knowledge & work', 'Basic AI assist', 'Email support'],
  },
  {
    id: 'professional',
    name: 'Professional',
    priceLabel: '$4,000 / mo',
    seats: '25 seats',
    highlights: ['Full AI workspace', 'Automations', 'Priority support'],
    recommended: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    priceLabel: 'Custom',
    seats: '100+ seats',
    highlights: ['SSO & SCIM', 'Advanced audit', 'Dedicated CSM'],
  },
  {
    id: 'enterprise_plus',
    name: 'Enterprise+',
    priceLabel: 'Custom',
    seats: 'Unlimited',
    highlights: ['Private cloud option', 'Custom SLAs', 'Partner marketplace'],
  },
]

export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'pm-1', brand: 'Visa', last4: '4242', expMonth: 11, expYear: 2028, isDefault: true },
  { id: 'pm-2', brand: 'Mastercard', last4: '5555', expMonth: 3, expYear: 2027, isDefault: false },
]

export const BILLING_CONTACTS: BillingContact[] = [
  { id: 'bc-1', name: 'Alex Chen', email: 'alex.chen@northwind.example', role: 'Billing admin', primary: true },
  { id: 'bc-2', name: 'Priya Shah', email: 'priya.shah@northwind.example', role: 'Finance', primary: false },
]

export const TAX_INFO: TaxInfo = {
  companyLegalName: 'Northwind Capital Markets Inc.',
  taxId: 'XX-1234567',
  address: '100 King St W, Toronto, ON M5X 1A1',
  country: 'Canada',
  vatExempt: false,
}

export const INVOICES: Invoice[] = [
  { id: 'inv-1', number: 'INV-2026-0042', issuedAt: '2026-07-03', dueAt: '2026-07-17', amountCents: 400000, status: 'paid', downloadLabel: 'INV-2026-0042.pdf' },
  { id: 'inv-2', number: 'INV-2026-0031', issuedAt: '2026-06-03', dueAt: '2026-06-17', amountCents: 400000, status: 'paid', downloadLabel: 'INV-2026-0031.pdf' },
  { id: 'inv-3', number: 'INV-2026-0020', issuedAt: '2026-05-03', dueAt: '2026-05-17', amountCents: 380000, status: 'paid', downloadLabel: 'INV-2026-0020.pdf' },
  { id: 'inv-4', number: 'INV-2026-0048', issuedAt: '2026-08-01', dueAt: '2026-08-15', amountCents: 400000, status: 'open', downloadLabel: 'INV-2026-0048.pdf' },
]

export const COST_BREAKDOWN: CostBreakdownItem[] = [
  { id: 'cb-1', category: 'Platform seats', amountCents: 280000, pct: 70 },
  { id: 'cb-2', category: 'AI usage overage buffer', amountCents: 60000, pct: 15 },
  { id: 'cb-3', category: 'API & storage', amountCents: 40000, pct: 10 },
  { id: 'cb-4', category: 'Support add-on', amountCents: 20000, pct: 5 },
]

export const CUSTOMER_ORG: CustomerOrgProfile = {
  name: 'Northwind Capital Markets',
  industry: 'Wealth Management',
  region: 'Canada',
  employees: '250–500',
  primaryContact: 'Jordan Lee (CCO)',
  website: 'https://northwind.example',
}

export const CONTRACTS: Contract[] = [
  { id: 'ct-1', name: 'Master Subscription Agreement', startsAt: '2025-09-01', endsAt: '2026-08-31', valueLabel: '$48,000 / yr', status: 'active' },
  { id: 'ct-2', name: 'Professional Services SOW', startsAt: '2026-01-15', endsAt: '2026-07-15', valueLabel: '$24,000', status: 'expiring' },
]

export const SUCCESS_MANAGER: SuccessManager = {
  name: 'Morgan Blake',
  email: 'morgan.blake@regintel.example',
  title: 'Customer Success Manager',
  nextCheckIn: '2026-08-12',
}

export const SUPPORT_TICKETS: SupportTicket[] = [
  { id: 'tkt-1', subject: 'SSO mapping for new AD groups', status: 'open', priority: 'high', updatedAt: '2026-08-02T14:00:00.000Z' },
  { id: 'tkt-2', subject: 'Export board package timeout', status: 'pending', priority: 'medium', updatedAt: '2026-08-01T09:30:00.000Z' },
  { id: 'tkt-3', subject: 'Training seat for auditors', status: 'resolved', priority: 'low', updatedAt: '2026-07-28T16:00:00.000Z' },
]

export const PRODUCT_UPDATES: ProductUpdate[] = [
  { id: 'pu-1', title: 'Customer Experience pack', summary: 'Onboarding, learning center, and tours.', publishedAt: '2026-08-03' },
  { id: 'pu-2', title: 'Industry solution packs', summary: 'Wealth flagship with banking and insurance.', publishedAt: '2026-08-03' },
  { id: 'pu-3', title: 'Commercial platform preview', summary: 'Billing, usage, and licensing controls.', publishedAt: '2026-08-03' },
]

export const TRAINING_ITEMS: TrainingItem[] = [
  { id: 'tr-1', title: 'Admin Console essentials', durationLabel: '45 min', completed: true },
  { id: 'tr-2', title: 'AI Workspace for compliance', durationLabel: '60 min', completed: false },
  { id: 'tr-3', title: 'Audit readiness workshop', durationLabel: '90 min', completed: false },
]

export const LICENSE_SUMMARY: LicenseSummary = {
  activeSeats: 18,
  availableSeats: 7,
  modules: ['Knowledge', 'Work', 'AI Workspace', 'Analytics'],
  environments: ['Production', 'UAT'],
}

export const DEPLOYMENTS: DeploymentStatus[] = [
  { environment: 'Production', version: 'v1.8.0-beta', region: 'ca-central-1', healthy: true, lastDeployAt: '2026-08-03T10:00:00.000Z' },
  { environment: 'UAT', version: 'v1.9.0-beta', region: 'ca-central-1', healthy: true, lastDeployAt: '2026-08-03T12:30:00.000Z' },
]

export const HEALTH_SCORE: HealthScore = {
  score: 84,
  label: 'Healthy',
  trend: '+4 vs last quarter',
}

export const OPEN_RECOMMENDATIONS: CommercialRecommendation[] = [
  { id: 'cr-1', title: 'Assign remaining seats', detail: '7 seats unused — invite reviewers before trial ends.', href: '/settings/licensing' },
  { id: 'cr-2', title: 'Review AI usage headroom', detail: 'AI requests at 71% of monthly limit.', href: '/settings/usage' },
  { id: 'cr-3', title: 'Schedule renewal QBR', detail: 'Renewal window opens in 28 days.', href: '/customer' },
]

export const CUSTOMER_TIMELINE: CustomerTimelineEvent[] = [
  { id: 'tl-1', at: '2026-08-03', title: 'Trial extended', detail: 'Professional trial active through Aug 17.' },
  { id: 'tl-2', at: '2026-07-20', title: 'Wealth pack installed', detail: 'Industry solution activated for KYC campaigns.' },
  { id: 'tl-3', at: '2026-06-01', title: 'Go-live', detail: 'Production workspace opened for compliance team.' },
  { id: 'tl-4', at: '2025-09-01', title: 'Contract signed', detail: 'MSA and annual Professional subscription.' },
]

export const QBR_SUMMARY: QbrSummary = {
  quarter: 'Q3 2026',
  summary: 'Adoption strong after Wealth pack; AI usage climbing. Seat utilization and renewal packaging are the focus.',
  nextFocus: 'Close open seats, expand Enterprise entitlements for SSO/SCIM, confirm QBR date.',
}

export const RENEWAL_READINESS: RenewalReadiness = {
  score: 78,
  status: 'On track',
  riskNotes: ['Trial conversion pending', '2 high-priority support tickets open'],
}

export const ADOPTION_SUMMARY: AdoptionSummary = {
  score: 72,
  activeUsers30d: 16,
  featureAdoptionPct: 61,
  notes: 'Strong knowledge usage; automation and partner integrations lagging.',
}

export const PARTNERS: Partner[] = [
  { id: 'p-1', name: 'Harbor Consulting', type: 'consulting', region: 'North America', tier: 'Gold', certified: true, description: 'Regulatory transformation and operating model design.' },
  { id: 'p-2', name: 'Apex Implementers', type: 'implementation', region: 'Canada', tier: 'Silver', certified: true, description: 'RegIntel deployment, data migration, and training.' },
  { id: 'p-3', name: 'LedgerTech Systems', type: 'technology', region: 'Global', tier: 'Platinum', certified: true, description: 'Core banking and CRM connectors.' },
  { id: 'p-4', name: 'Compliance Marketplace Co.', type: 'marketplace', region: 'APAC', tier: 'Partner', certified: false, description: 'Lists RegIntel add-ons and solution packs.' },
]

export const PARTNER_CERTIFICATIONS: PartnerCertification[] = [
  { id: 'pc-1', name: 'RegIntel Implementation Specialist', level: 'Level 2', earnedAt: '2025-11-01', expiresAt: '2026-11-01' },
  { id: 'pc-2', name: 'AI Compliance Architect', level: 'Level 1', earnedAt: '2026-03-15', expiresAt: '2027-03-15' },
]

export const REFERRALS: Referral[] = [
  { id: 'rf-1', company: 'Summit Wealth', status: 'qualified', valueLabel: '$36k ARR', submittedAt: '2026-07-10' },
  { id: 'rf-2', company: 'Prairie Trust', status: 'submitted', valueLabel: '$24k ARR', submittedAt: '2026-07-28' },
  { id: 'rf-3', company: 'Metro Advisors', status: 'won', valueLabel: '$48k ARR', submittedAt: '2026-05-02' },
]

export const REGISTERED_DEALS: RegisteredDeal[] = [
  { id: 'rd-1', account: 'Summit Wealth', stage: 'Proposal', amountLabel: '$36,000', owner: 'Harbor Consulting', registeredAt: '2026-07-12' },
  { id: 'rd-2', account: 'Prairie Trust', stage: 'Discovery', amountLabel: '$24,000', owner: 'Apex Implementers', registeredAt: '2026-07-29' },
]

export const PARTNER_REVENUE: PartnerRevenueMetric[] = [
  { id: 'prv-1', label: 'YTD influenced ARR', value: '$312k', hint: 'Closed + pipeline' },
  { id: 'prv-2', label: 'Referral payouts', value: '$28k', hint: 'Paid this year' },
  { id: 'prv-3', label: 'Active deals', value: '2', hint: 'Registered' },
  { id: 'prv-4', label: 'Win rate', value: '41%', hint: 'Trailing 12 months' },
]

export const MARKETING_RESOURCES: MarketingResource[] = [
  { id: 'mr-1', title: 'Partner one-pager (PDF)', kind: 'Collateral', href: '/partners' },
  { id: 'mr-2', title: 'Demo script — Wealth', kind: 'Enablement', href: '/solutions/wealth' },
  { id: 'mr-3', title: 'Co-branded webinar kit', kind: 'Campaign', href: '/partners' },
]

export const PARTNER_TRAINING: PartnerTraining[] = [
  { id: 'pt-1', title: 'Partner portal orientation', status: 'completed', hours: 2 },
  { id: 'pt-2', title: 'Deal registration workshop', status: 'in_progress', hours: 3 },
  { id: 'pt-3', title: 'Solution pack deep dive', status: 'available', hours: 4 },
]

export const USAGE_SERIES: UsageSeriesPoint[] = [
  { month: 'Mar', aiRequests: 8200, apiCalls: 520000, activeUsers: 12 },
  { month: 'Apr', aiRequests: 9100, apiCalls: 610000, activeUsers: 13 },
  { month: 'May', aiRequests: 10400, apiCalls: 690000, activeUsers: 14 },
  { month: 'Jun', aiRequests: 11800, apiCalls: 740000, activeUsers: 15 },
  { month: 'Jul', aiRequests: 13100, apiCalls: 810000, activeUsers: 16 },
  { month: 'Aug', aiRequests: 14200, apiCalls: 860000, activeUsers: 16 },
]

export const USAGE_SNAPSHOT = {
  aiRequests: 14200,
  copilotSessions: 860,
  apiCalls: 860000,
  storageGb: 420,
  workflowExecutions: 2140,
  automationRuns: 980,
  reportsGenerated: 126,
  activeUsers: 16,
  peakConcurrent: 11,
}

export const TOP_USERS: TopUser[] = [
  { id: 'tu-1', name: 'Jordan Lee', role: 'CCO', actions: 420 },
  { id: 'tu-2', name: 'Sam Ortiz', role: 'Compliance Analyst', actions: 380 },
  { id: 'tu-3', name: 'Riley Ng', role: 'Policy Lead', actions: 310 },
  { id: 'tu-4', name: 'Casey Brooks', role: 'Auditor', actions: 220 },
]

export const FEATURE_ADOPTION: FeatureAdoptionStat[] = [
  { id: 'fa-1', feature: 'Knowledge Library', pct: 88 },
  { id: 'fa-2', feature: 'AI Workspace', pct: 64 },
  { id: 'fa-3', feature: 'Automations', pct: 41 },
  { id: 'fa-4', feature: 'Board Studio', pct: 37 },
  { id: 'fa-5', feature: 'Developer API', pct: 22 },
]

export const DEPARTMENT_USAGE: DepartmentUsage[] = [
  { id: 'du-1', department: 'Compliance', seats: 10, aiRequests: 8200, apiCalls: 120000 },
  { id: 'du-2', department: 'Legal', seats: 4, aiRequests: 3100, apiCalls: 40000 },
  { id: 'du-3', department: 'Risk', seats: 3, aiRequests: 2100, apiCalls: 90000 },
  { id: 'du-4', department: 'IT / Platform', seats: 1, aiRequests: 800, apiCalls: 610000 },
]

export const SEAT_ASSIGNMENTS: SeatAssignment[] = [
  { id: 'seat-1', userName: 'Jordan Lee', email: 'jordan.lee@northwind.example', status: 'assigned', assignedAt: '2025-09-02', licenseType: 'Full' },
  { id: 'seat-2', userName: 'Sam Ortiz', email: 'sam.ortiz@northwind.example', status: 'assigned', assignedAt: '2025-09-05', licenseType: 'Full' },
  { id: 'seat-3', userName: 'Riley Ng', email: 'riley.ng@northwind.example', status: 'assigned', assignedAt: '2025-10-01', licenseType: 'Full' },
  { id: 'seat-4', userName: 'Casey Brooks', email: 'casey.brooks@northwind.example', status: 'assigned', assignedAt: '2026-01-12', licenseType: 'Auditor' },
  { id: 'seat-5', userName: null, email: 'invite.pending@northwind.example', status: 'invited', assignedAt: null, licenseType: 'Full' },
  { id: 'seat-6', userName: null, email: null, status: 'available', assignedAt: null, licenseType: 'Full' },
  { id: 'seat-7', userName: null, email: null, status: 'available', assignedAt: null, licenseType: 'Full' },
]

export const FEATURE_ENTITLEMENTS: FeatureEntitlement[] = [
  { id: 'fe-1', feature: 'AI Workspace', included: true, planMin: 'professional' },
  { id: 'fe-2', feature: 'SSO / SCIM', included: false, planMin: 'enterprise' },
  { id: 'fe-3', feature: 'Advanced audit export', included: true, planMin: 'professional' },
  { id: 'fe-4', feature: 'Private cloud', included: false, planMin: 'enterprise_plus' },
  { id: 'fe-5', feature: 'Partner marketplace', included: false, planMin: 'enterprise_plus' },
  { id: 'fe-6', feature: 'Board Studio', included: true, planMin: 'professional' },
]

export const MODULE_LICENSES: ModuleLicense[] = [
  { id: 'ml-1', name: 'Core Platform', status: 'active', expiresAt: '2026-08-31' },
  { id: 'ml-2', name: 'AI Workspace', status: 'active', expiresAt: '2026-08-31' },
  { id: 'ml-3', name: 'Wealth Solution Pack', status: 'active', expiresAt: '2026-08-31' },
  { id: 'ml-4', name: 'Predictive Analytics', status: 'trial', expiresAt: '2026-08-17' },
]

export const ENVIRONMENT_LICENSES: EnvironmentLicense[] = [
  { id: 'el-1', environment: 'Production', seats: 25, region: 'ca-central-1', status: 'active' },
  { id: 'el-2', environment: 'UAT', seats: 10, region: 'ca-central-1', status: 'active' },
  { id: 'el-3', environment: 'Sandbox', seats: 5, region: 'us-east-1', status: 'provisioning' },
]

export const TRIAL_LICENSES: TrialLicense[] = [
  { id: 'trl-1', name: 'Predictive Analytics trial', expiresAt: '2026-08-17', daysLeft: 14 },
  { id: 'trl-2', name: 'Professional plan trial', expiresAt: '2026-08-17', daysLeft: 14 },
]

export const BILLING_NOTIFICATIONS: BillingNotification[] = [
  {
    id: 'bn-1',
    title: 'Trial ends in 14 days',
    body: 'Convert to paid Professional or upgrade to Enterprise before Aug 17.',
    tone: 'warning',
    href: '/settings/billing',
    dismissible: true,
  },
  {
    id: 'bn-2',
    title: 'Storage nearing limit',
    body: 'Storage is at 84% of plan capacity. Review usage or upgrade.',
    tone: 'warning',
    href: '/settings/usage',
    dismissible: true,
  },
]

export const LICENSE_ALERTS: LicenseAlert[] = [
  { id: 'la-1', title: 'Renewal reminder', body: 'MSA renews Aug 31 — confirm seat count.', severity: 'warning', href: '/settings/licensing' },
  { id: 'la-2', title: 'SSO requires Enterprise', body: 'Requested entitlement is plan-gated.', severity: 'info', href: '/settings/billing' },
]

export const UPGRADE_RECOMMENDATIONS: UpgradeRecommendation[] = [
  {
    id: 'ur-1',
    title: 'Upgrade to Enterprise for SSO/SCIM',
    detail: 'Your IT ticket needs directory sync entitlements.',
    targetPlan: 'enterprise',
    href: '/settings/billing',
  },
  {
    id: 'ur-2',
    title: 'Add AI capacity',
    detail: 'Projected to exceed AI request limit mid-month.',
    targetPlan: 'enterprise',
    href: '/settings/usage',
  },
]

export const PLAN_FEATURE_FLAGS: PlanFeatureFlag[] = [
  { id: 'ff-1', key: 'ai_workspace', label: 'AI Workspace', enabled: true, requiredPlan: 'professional' },
  { id: 'ff-2', key: 'sso_scim', label: 'SSO / SCIM', enabled: false, requiredPlan: 'enterprise' },
  { id: 'ff-3', key: 'private_cloud', label: 'Private cloud', enabled: false, requiredPlan: 'enterprise_plus' },
  { id: 'ff-4', key: 'partner_portal', label: 'Partner portal', enabled: true, requiredPlan: 'professional' },
  { id: 'ff-5', key: 'usage_analytics', label: 'Usage analytics', enabled: true, requiredPlan: 'professional' },
]
