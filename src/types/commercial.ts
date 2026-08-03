/**
 * Commercial Platform domain (Sprint 19).
 * Local/mock only — billing, customer portal, partners, usage, licensing.
 */

export type PlanTier = 'starter' | 'professional' | 'enterprise' | 'enterprise_plus'

export type SubscriptionStatus = 'trial' | 'active' | 'past_due' | 'canceled'

export interface Subscription {
  plan: PlanTier
  planLabel: string
  status: SubscriptionStatus
  trialEndsAt: string | null
  renewsAt: string
  seatsIncluded: number
  seatsUsed: number
  billingCycle: 'monthly' | 'annual'
  currency: string
  amountCents: number
}

export interface UsageMeter {
  id: string
  label: string
  used: number
  limit: number
  unit: string
  warnAtPct: number
}

export interface PlanOption {
  id: PlanTier
  name: string
  priceLabel: string
  seats: string
  highlights: string[]
  recommended?: boolean
}

export interface PaymentMethod {
  id: string
  brand: string
  last4: string
  expMonth: number
  expYear: number
  isDefault: boolean
}

export interface BillingContact {
  id: string
  name: string
  email: string
  role: string
  primary: boolean
}

export interface TaxInfo {
  companyLegalName: string
  taxId: string
  address: string
  country: string
  vatExempt: boolean
}

export interface Invoice {
  id: string
  number: string
  issuedAt: string
  dueAt: string
  amountCents: number
  status: 'paid' | 'open' | 'void'
  downloadLabel: string
}

export interface CostBreakdownItem {
  id: string
  category: string
  amountCents: number
  pct: number
}

export interface CustomerOrgProfile {
  name: string
  industry: string
  region: string
  employees: string
  primaryContact: string
  website: string
}

export interface Contract {
  id: string
  name: string
  startsAt: string
  endsAt: string
  valueLabel: string
  status: 'active' | 'expiring' | 'expired'
}

export interface SuccessManager {
  name: string
  email: string
  title: string
  nextCheckIn: string
}

export interface SupportTicket {
  id: string
  subject: string
  status: 'open' | 'pending' | 'resolved'
  priority: 'low' | 'medium' | 'high'
  updatedAt: string
}

export interface ProductUpdate {
  id: string
  title: string
  summary: string
  publishedAt: string
}

export interface TrainingItem {
  id: string
  title: string
  durationLabel: string
  completed: boolean
}

export interface LicenseSummary {
  activeSeats: number
  availableSeats: number
  modules: string[]
  environments: string[]
}

export interface DeploymentStatus {
  environment: string
  version: string
  region: string
  healthy: boolean
  lastDeployAt: string
}

export interface HealthScore {
  score: number
  label: string
  trend: string
}

export interface CommercialRecommendation {
  id: string
  title: string
  detail: string
  href: string
}

export interface CustomerTimelineEvent {
  id: string
  at: string
  title: string
  detail: string
}

export interface QbrSummary {
  quarter: string
  summary: string
  nextFocus: string
}

export interface RenewalReadiness {
  score: number
  status: string
  riskNotes: string[]
}

export interface AdoptionSummary {
  score: number
  activeUsers30d: number
  featureAdoptionPct: number
  notes: string
}

export type PartnerType = 'consulting' | 'implementation' | 'technology' | 'marketplace'

export interface Partner {
  id: string
  name: string
  type: PartnerType
  region: string
  tier: string
  certified: boolean
  description: string
}

export interface PartnerCertification {
  id: string
  name: string
  level: string
  earnedAt: string
  expiresAt: string
}

export interface Referral {
  id: string
  company: string
  status: 'submitted' | 'qualified' | 'won' | 'lost'
  valueLabel: string
  submittedAt: string
}

export interface RegisteredDeal {
  id: string
  account: string
  stage: string
  amountLabel: string
  owner: string
  registeredAt: string
}

export interface PartnerRevenueMetric {
  id: string
  label: string
  value: string
  hint: string
}

export interface MarketingResource {
  id: string
  title: string
  kind: string
  href: string
}

export interface PartnerTraining {
  id: string
  title: string
  status: 'available' | 'in_progress' | 'completed'
  hours: number
}

export interface UsageSeriesPoint {
  month: string
  aiRequests: number
  apiCalls: number
  activeUsers: number
}

export interface TopUser {
  id: string
  name: string
  role: string
  actions: number
}

export interface FeatureAdoptionStat {
  id: string
  feature: string
  pct: number
}

export interface DepartmentUsage {
  id: string
  department: string
  seats: number
  aiRequests: number
  apiCalls: number
}

export type SeatStatus = 'assigned' | 'available' | 'invited' | 'revoked'

export interface SeatAssignment {
  id: string
  userName: string | null
  email: string | null
  status: SeatStatus
  assignedAt: string | null
  licenseType: string
}

export interface FeatureEntitlement {
  id: string
  feature: string
  included: boolean
  planMin: PlanTier
}

export interface ModuleLicense {
  id: string
  name: string
  status: 'active' | 'trial' | 'expired'
  expiresAt: string | null
}

export interface EnvironmentLicense {
  id: string
  environment: string
  seats: number
  region: string
  status: 'active' | 'provisioning'
}

export interface TrialLicense {
  id: string
  name: string
  expiresAt: string
  daysLeft: number
}

export interface BillingNotification {
  id: string
  title: string
  body: string
  tone: 'info' | 'warning' | 'critical'
  href?: string
  dismissible: boolean
}

export interface LicenseAlert {
  id: string
  title: string
  body: string
  severity: 'info' | 'warning' | 'critical'
  href: string
}

export interface UpgradeRecommendation {
  id: string
  title: string
  detail: string
  targetPlan: PlanTier
  href: string
}

export interface PlanFeatureFlag {
  id: string
  key: string
  label: string
  enabled: boolean
  requiredPlan: PlanTier
}
