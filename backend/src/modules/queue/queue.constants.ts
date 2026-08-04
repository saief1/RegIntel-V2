export const QUEUE_NAMES = {
  email: 'email',
  reminder: 'reminder',
  reviewCycle: 'review-cycle',
  policyExpiry: 'policy-expiry',
  notificationDelivery: 'notification-delivery',
  syncRetry: 'sync-retry',
  workflowAutomation: 'workflow-automation',
  auditCleanup: 'audit-cleanup',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

export const DEFAULT_JOB_OPTIONS = {
  attempts: 5,
  backoff: { type: 'exponential' as const, delay: 2000 },
  removeOnComplete: 100,
  removeOnFail: false,
};

/** Dead-letter queue naming convention (placeholder wiring). */
export function dlqName(queue: string): string {
  return `${queue}:dlq`;
}
