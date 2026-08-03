import { useCallback, useMemo, useState, type ReactNode } from 'react'
import {
  ADOPTION_SUMMARY,
  BILLING_CONTACTS,
  BILLING_NOTIFICATIONS,
  CONTRACTS,
  COST_BREAKDOWN,
  CUSTOMER_ORG,
  CUSTOMER_TIMELINE,
  DEPLOYMENTS,
  DEPARTMENT_USAGE,
  ENVIRONMENT_LICENSES,
  FEATURE_ADOPTION,
  FEATURE_ENTITLEMENTS,
  HEALTH_SCORE,
  INVOICES,
  LICENSE_ALERTS,
  LICENSE_SUMMARY,
  MARKETING_RESOURCES,
  MODULE_LICENSES,
  OPEN_RECOMMENDATIONS,
  PARTNER_CERTIFICATIONS,
  PARTNER_REVENUE,
  PARTNER_TRAINING,
  PARTNERS,
  PAYMENT_METHODS,
  PLAN_FEATURE_FLAGS,
  PLAN_OPTIONS,
  PRODUCT_UPDATES,
  QBR_SUMMARY,
  REFERRALS,
  REGISTERED_DEALS,
  RENEWAL_READINESS,
  SEAT_ASSIGNMENTS,
  SUBSCRIPTION,
  SUCCESS_MANAGER,
  SUPPORT_TICKETS,
  TAX_INFO,
  TOP_USERS,
  TRAINING_ITEMS,
  TRIAL_LICENSES,
  UPGRADE_RECOMMENDATIONS,
  USAGE_METERS,
  USAGE_SERIES,
  USAGE_SNAPSHOT,
} from '../data/commercial/platform'
import type {
  BillingNotification,
  PartnerType,
  PaymentMethod,
  PlanTier,
  RegisteredDeal,
  SeatAssignment,
  Subscription,
  TrainingItem,
} from '../types/commercial'
import { createId } from '../utils/id'
import { CommercialContext, type CommercialContextValue } from './CommercialContext'

const PLAN_LABELS: Record<PlanTier, string> = {
  starter: 'Starter',
  professional: 'Professional',
  enterprise: 'Enterprise',
  enterprise_plus: 'Enterprise+',
}

function daysUntil(iso: string | null): number {
  if (!iso) return 0
  const ms = new Date(iso).getTime() - Date.now()
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)))
}

export function CommercialProvider({ children }: { children: ReactNode }) {
  const [subscription, setSubscription] = useState<Subscription>(SUBSCRIPTION)
  const [usageMeters, setUsageMeters] = useState(USAGE_METERS)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(PAYMENT_METHODS)
  const [trainingItems, setTrainingItems] = useState<TrainingItem[]>(TRAINING_ITEMS)
  const [partnerFilter, setPartnerFilter] = useState<PartnerType | 'all'>('all')
  const [registeredDeals, setRegisteredDeals] = useState<RegisteredDeal[]>(REGISTERED_DEALS)
  const [seats, setSeats] = useState<SeatAssignment[]>(SEAT_ASSIGNMENTS)
  const [billingNotifications, setBillingNotifications] =
    useState<BillingNotification[]>(BILLING_NOTIFICATIONS)
  const [showTrialBanner, setShowTrialBanner] = useState(true)
  const [showUsageWarning, setShowUsageWarning] = useState(true)
  const [lastDownloadedInvoice, setLastDownloadedInvoice] = useState<string | null>(null)
  const [lastUsageExport, setLastUsageExport] = useState<string | null>(null)

  const trialDaysLeft = daysUntil(subscription.trialEndsAt)
  const seatUtilizationPct = Math.round((subscription.seatsUsed / Math.max(subscription.seatsIncluded, 1)) * 100)
  const metersNearLimit = useMemo(
    () => usageMeters.filter((meter) => (meter.used / Math.max(meter.limit, 1)) * 100 >= meter.warnAtPct),
    [usageMeters],
  )

  const syncSeatCounts = useCallback((nextSeats: SeatAssignment[]) => {
    const used = nextSeats.filter((seat) => seat.status === 'assigned' || seat.status === 'invited').length
    setSubscription((current) => ({ ...current, seatsUsed: used }))
    setUsageMeters((current) =>
      current.map((meter) => (meter.id === 'seats' ? { ...meter, used } : meter)),
    )
  }, [])

  const changePlan = useCallback((plan: PlanTier) => {
    setSubscription((current) => ({
      ...current,
      plan,
      planLabel: PLAN_LABELS[plan],
      status: plan === 'starter' || plan === 'professional' ? 'trial' : 'active',
    }))
  }, [])

  const exportUsageCsv = useCallback(() => {
    const header = 'month,aiRequests,apiCalls,activeUsers'
    const rows = USAGE_SERIES.map(
      (point) => `${point.month},${point.aiRequests},${point.apiCalls},${point.activeUsers}`,
    )
    const csv = [header, ...rows].join('\n')
    setLastUsageExport(csv)
    return csv
  }, [])

  const value = useMemo<CommercialContextValue>(
    () => ({
      subscription,
      usageMeters,
      planOptions: PLAN_OPTIONS,
      paymentMethods,
      billingContacts: BILLING_CONTACTS,
      taxInfo: TAX_INFO,
      invoices: INVOICES,
      costBreakdown: COST_BREAKDOWN,
      changePlan,
      setDefaultPaymentMethod: (id) =>
        setPaymentMethods((current) =>
          current.map((method) => ({ ...method, isDefault: method.id === id })),
        ),
      downloadInvoice: (id) => {
        const invoice = INVOICES.find((item) => item.id === id)
        if (!invoice) return null
        setLastDownloadedInvoice(invoice.downloadLabel)
        return invoice.downloadLabel
      },
      lastDownloadedInvoice,

      customerOrg: CUSTOMER_ORG,
      contracts: CONTRACTS,
      successManager: SUCCESS_MANAGER,
      supportTickets: SUPPORT_TICKETS,
      productUpdates: PRODUCT_UPDATES,
      trainingItems,
      toggleTrainingComplete: (id) =>
        setTrainingItems((current) =>
          current.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)),
        ),
      licenseSummary: {
        ...LICENSE_SUMMARY,
        activeSeats: seats.filter((seat) => seat.status === 'assigned').length,
        availableSeats: seats.filter((seat) => seat.status === 'available').length,
      },
      deployments: DEPLOYMENTS,
      healthScore: HEALTH_SCORE,
      openRecommendations: OPEN_RECOMMENDATIONS,
      customerTimeline: CUSTOMER_TIMELINE,
      qbr: QBR_SUMMARY,
      renewalReadiness: RENEWAL_READINESS,
      adoptionSummary: ADOPTION_SUMMARY,

      partners: PARTNERS,
      partnerFilter,
      setPartnerFilter,
      certifications: PARTNER_CERTIFICATIONS,
      referrals: REFERRALS,
      registeredDeals,
      partnerRevenue: PARTNER_REVENUE,
      marketingResources: MARKETING_RESOURCES,
      partnerTraining: PARTNER_TRAINING,
      registerDeal: (account, amountLabel) =>
        setRegisteredDeals((current) => [
          {
            id: createId('rd'),
            account: account.trim(),
            stage: 'Discovery',
            amountLabel: amountLabel.trim() || '$0',
            owner: 'Self-registered',
            registeredAt: new Date().toISOString().slice(0, 10),
          },
          ...current,
        ]),

      usageSnapshot: USAGE_SNAPSHOT,
      usageSeries: USAGE_SERIES,
      topUsers: TOP_USERS,
      featureAdoption: FEATURE_ADOPTION,
      departmentUsage: DEPARTMENT_USAGE,
      exportUsageCsv,
      lastUsageExport,

      seats,
      featureEntitlements: FEATURE_ENTITLEMENTS,
      moduleLicenses: MODULE_LICENSES,
      environmentLicenses: ENVIRONMENT_LICENSES,
      trialLicenses: TRIAL_LICENSES,
      assignSeat: (seatId, userName, email) =>
        setSeats((current) => {
          const next = current.map((seat) =>
            seat.id === seatId
              ? {
                  ...seat,
                  userName: userName.trim(),
                  email: email.trim(),
                  status: 'assigned' as const,
                  assignedAt: new Date().toISOString().slice(0, 10),
                }
              : seat,
          )
          syncSeatCounts(next)
          return next
        }),
      revokeSeat: (seatId) =>
        setSeats((current) => {
          const next = current.map((seat) =>
            seat.id === seatId
              ? {
                  ...seat,
                  userName: null,
                  email: null,
                  status: 'available' as const,
                  assignedAt: null,
                }
              : seat,
          )
          syncSeatCounts(next)
          return next
        }),
      transferSeat: (fromSeatId, toSeatId) =>
        setSeats((current) => {
          const from = current.find((seat) => seat.id === fromSeatId)
          const to = current.find((seat) => seat.id === toSeatId)
          if (!from || !to || from.status !== 'assigned' || to.status !== 'available') return current
          const next = current.map((seat) => {
            if (seat.id === fromSeatId) {
              return {
                ...seat,
                userName: null,
                email: null,
                status: 'available' as const,
                assignedAt: null,
              }
            }
            if (seat.id === toSeatId) {
              return {
                ...seat,
                userName: from.userName,
                email: from.email,
                status: 'assigned' as const,
                assignedAt: new Date().toISOString().slice(0, 10),
                licenseType: from.licenseType,
              }
            }
            return seat
          })
          syncSeatCounts(next)
          return next
        }),
      bulkAssignSeats: (assignments) =>
        setSeats((current) => {
          const map = new Map(assignments.map((item) => [item.seatId, item]))
          const next = current.map((seat) => {
            const assignment = map.get(seat.id)
            if (!assignment || seat.status !== 'available') return seat
            return {
              ...seat,
              userName: assignment.userName.trim(),
              email: assignment.email.trim(),
              status: 'assigned' as const,
              assignedAt: new Date().toISOString().slice(0, 10),
            }
          })
          syncSeatCounts(next)
          return next
        }),
      inviteUser: (email, licenseType) =>
        setSeats((current) => {
          const available = current.find((seat) => seat.status === 'available')
          if (!available) {
            const invited: SeatAssignment = {
              id: createId('seat'),
              userName: null,
              email: email.trim(),
              status: 'invited',
              assignedAt: null,
              licenseType,
            }
            const next = [invited, ...current]
            syncSeatCounts(next)
            return next
          }
          const next = current.map((seat) =>
            seat.id === available.id
              ? {
                  ...seat,
                  email: email.trim(),
                  status: 'invited' as const,
                  licenseType,
                }
              : seat,
          )
          syncSeatCounts(next)
          return next
        }),

      billingNotifications,
      dismissBillingNotification: (id) =>
        setBillingNotifications((current) => current.filter((item) => item.id !== id)),
      licenseAlerts: LICENSE_ALERTS,
      upgradeRecommendations: UPGRADE_RECOMMENDATIONS,
      planFeatureFlags: PLAN_FEATURE_FLAGS,
      isFeatureEnabled: (key) => PLAN_FEATURE_FLAGS.find((flag) => flag.key === key)?.enabled ?? false,

      showTrialBanner,
      dismissTrialBanner: () => setShowTrialBanner(false),
      showUsageWarning,
      dismissUsageWarning: () => setShowUsageWarning(false),
      trialDaysLeft,
      seatUtilizationPct,
      metersNearLimit,
    }),
    [
      billingNotifications,
      changePlan,
      exportUsageCsv,
      lastDownloadedInvoice,
      lastUsageExport,
      metersNearLimit,
      partnerFilter,
      paymentMethods,
      registeredDeals,
      seatUtilizationPct,
      seats,
      showTrialBanner,
      showUsageWarning,
      subscription,
      syncSeatCounts,
      trainingItems,
      trialDaysLeft,
      usageMeters,
    ],
  )

  return <CommercialContext.Provider value={value}>{children}</CommercialContext.Provider>
}
