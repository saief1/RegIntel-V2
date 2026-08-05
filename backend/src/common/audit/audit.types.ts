export type AuditEvent = {
  eventId: string;
  userId: string | null;
  organizationId: string | null;
  action: string;
  resource: string;
  category?: string;
  before?: unknown;
  after?: unknown;
  timestamp: string;
  ipAddress: string | null;
  userAgent: string | null;
  device?: string | null;
  requestId?: string | null;
  correlationId?: string | null;
};

export interface AuditWriter {
  write(event: AuditEvent): Promise<void>;
}

export const AUDIT_WRITER = Symbol('AUDIT_WRITER');

export function categoryForAction(action: string): string {
  if (
    action.startsWith('auth.') ||
    action.startsWith('mfa.') ||
    action.startsWith('session.')
  ) {
    return 'authn';
  }
  if (
    action.startsWith('rbac.') ||
    action.startsWith('permission.') ||
    action.includes('access')
  ) {
    return 'authz';
  }
  if (action.startsWith('workflow.') || action.includes('approval')) {
    return 'workflow';
  }
  if (action.startsWith('policy.')) {
    return 'policy';
  }
  if (action.startsWith('task.')) {
    return 'tasks';
  }
  if (action.startsWith('storage.') || action.includes('upload')) {
    return 'uploads';
  }
  if (action.includes('security') || action.includes('suspicious')) {
    return 'security';
  }
  if (action.startsWith('api.') || action.includes('request')) {
    return 'api_access';
  }
  return 'crud';
}
