import { createContext } from 'react'
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
  PartnerType,
  PaymentMethod,
  PlanFeatureFlag,
  PlanOption,
  PlanTier,
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
} from '../types/commercial'

export interface CommercialContextValue {
  subscription: Subscription
  usageMeters: UsageMeter[]
  planOptions: PlanOption[]
  paymentMethods: PaymentMethod[]
  billingContacts: BillingContact[]
  taxInfo: TaxInfo
  invoices: Invoice[]
  costBreakdown: CostBreakdownItem[]
  changePlan: (plan: PlanTier) => void
  setDefaultPaymentMethod: (id: string) => void
  downloadInvoice: (id: string) => string | null
  lastDownloadedInvoice: string | null

  customerOrg: CustomerOrgProfile
  contracts: Contract[]
  successManager: SuccessManager
  supportTickets: SupportTicket[]
  productUpdates: ProductUpdate[]
  trainingItems: TrainingItem[]
  toggleTrainingComplete: (id: string) => void
  licenseSummary: LicenseSummary
  deployments: DeploymentStatus[]
  healthScore: HealthScore
  openRecommendations: CommercialRecommendation[]
  customerTimeline: CustomerTimelineEvent[]
  qbr: QbrSummary
  renewalReadiness: RenewalReadiness
  adoptionSummary: AdoptionSummary

  partners: Partner[]
  partnerFilter: PartnerType | 'all'
  setPartnerFilter: (filter: PartnerType | 'all') => void
  certifications: PartnerCertification[]
  referrals: Referral[]
  registeredDeals: RegisteredDeal[]
  partnerRevenue: PartnerRevenueMetric[]
  marketingResources: MarketingResource[]
  partnerTraining: PartnerTraining[]
  registerDeal: (account: string, amountLabel: string) => void

  usageSnapshot: {
    aiRequests: number
    copilotSessions: number
    apiCalls: number
    storageGb: number
    workflowExecutions: number
    automationRuns: number
    reportsGenerated: number
    activeUsers: number
    peakConcurrent: number
  }
  usageSeries: UsageSeriesPoint[]
  topUsers: TopUser[]
  featureAdoption: FeatureAdoptionStat[]
  departmentUsage: DepartmentUsage[]
  exportUsageCsv: () => string
  lastUsageExport: string | null

  seats: SeatAssignment[]
  featureEntitlements: FeatureEntitlement[]
  moduleLicenses: ModuleLicense[]
  environmentLicenses: EnvironmentLicense[]
  trialLicenses: TrialLicense[]
  assignSeat: (seatId: string, userName: string, email: string) => void
  revokeSeat: (seatId: string) => void
  transferSeat: (fromSeatId: string, toSeatId: string) => void
  bulkAssignSeats: (assignments: Array<{ seatId: string; userName: string; email: string }>) => void
  inviteUser: (email: string, licenseType: string) => void

  billingNotifications: BillingNotification[]
  dismissBillingNotification: (id: string) => void
  licenseAlerts: LicenseAlert[]
  upgradeRecommendations: UpgradeRecommendation[]
  planFeatureFlags: PlanFeatureFlag[]
  isFeatureEnabled: (key: string) => boolean

  showTrialBanner: boolean
  dismissTrialBanner: () => void
  showUsageWarning: boolean
  dismissUsageWarning: () => void
  trialDaysLeft: number
  seatUtilizationPct: number
  metersNearLimit: UsageMeter[]
}

export const CommercialContext = createContext<CommercialContextValue | null>(null)
