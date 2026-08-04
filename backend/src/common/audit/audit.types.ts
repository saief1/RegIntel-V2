export type AuditEvent = {
  eventId: string;
  userId: string | null;
  organizationId: string | null;
  action: string;
  resource: string;
  before?: unknown;
  after?: unknown;
  timestamp: string;
  ipAddress: string | null;
  userAgent: string | null;
};

export interface AuditWriter {
  write(event: AuditEvent): Promise<void>;
}

export const AUDIT_WRITER = Symbol('AUDIT_WRITER');
