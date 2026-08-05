import { Global, Module } from '@nestjs/common';
import { AuditEntryRepository } from './audit-entry.repository';
import { AuditLogRepository } from './audit-log.repository';
import { CaseRepository } from './case.repository';
import { EmailRepository } from './email.repository';
import { KnowledgeRepository } from './knowledge.repository';
import { NotificationRepository } from './notification.repository';
import { OrganizationRepository } from './organization.repository';
import { PolicyRepository } from './policy.repository';
import { ReportRepository } from './report.repository';
import { SearchRepository } from './search.repository';
import { SecurityEventRepository } from './security-event.repository';
import { StorageObjectRepository } from './storage-object.repository';
import { TaskRepository } from './task.repository';
import { TenantRepository } from './tenant.repository';
import {
  AUDIT_ENTRY_REPOSITORY,
  AUDIT_LOG_REPOSITORY,
  CASE_REPOSITORY,
  EMAIL_REPOSITORY,
  KNOWLEDGE_REPOSITORY,
  NOTIFICATION_REPOSITORY,
  ORGANIZATION_REPOSITORY,
  POLICY_REPOSITORY,
  REPORT_REPOSITORY,
  SEARCH_REPOSITORY,
  SECURITY_EVENT_REPOSITORY,
  STORAGE_OBJECT_REPOSITORY,
  TASK_REPOSITORY,
  TENANT_REPOSITORY,
  USER_REPOSITORY,
  WORKFLOW_REPOSITORY,
} from './tokens';
import { UserRepository } from './user.repository';
import { WorkflowRepository } from './workflow.repository';

@Global()
@Module({
  providers: [
    { provide: USER_REPOSITORY, useClass: UserRepository },
    { provide: ORGANIZATION_REPOSITORY, useClass: OrganizationRepository },
    { provide: POLICY_REPOSITORY, useClass: PolicyRepository },
    { provide: TASK_REPOSITORY, useClass: TaskRepository },
    { provide: CASE_REPOSITORY, useClass: CaseRepository },
    { provide: KNOWLEDGE_REPOSITORY, useClass: KnowledgeRepository },
    { provide: REPORT_REPOSITORY, useClass: ReportRepository },
    { provide: NOTIFICATION_REPOSITORY, useClass: NotificationRepository },
    { provide: AUDIT_ENTRY_REPOSITORY, useClass: AuditEntryRepository },
    { provide: AUDIT_LOG_REPOSITORY, useClass: AuditLogRepository },
    { provide: EMAIL_REPOSITORY, useClass: EmailRepository },
    { provide: SEARCH_REPOSITORY, useClass: SearchRepository },
    { provide: TENANT_REPOSITORY, useClass: TenantRepository },
    { provide: SECURITY_EVENT_REPOSITORY, useClass: SecurityEventRepository },
    { provide: WORKFLOW_REPOSITORY, useClass: WorkflowRepository },
    { provide: STORAGE_OBJECT_REPOSITORY, useClass: StorageObjectRepository },
    UserRepository,
    OrganizationRepository,
    PolicyRepository,
    TaskRepository,
    CaseRepository,
    KnowledgeRepository,
    ReportRepository,
    NotificationRepository,
    AuditEntryRepository,
    AuditLogRepository,
    EmailRepository,
    SearchRepository,
    TenantRepository,
    SecurityEventRepository,
    WorkflowRepository,
    StorageObjectRepository,
  ],
  exports: [
    USER_REPOSITORY,
    ORGANIZATION_REPOSITORY,
    POLICY_REPOSITORY,
    TASK_REPOSITORY,
    CASE_REPOSITORY,
    KNOWLEDGE_REPOSITORY,
    REPORT_REPOSITORY,
    NOTIFICATION_REPOSITORY,
    AUDIT_ENTRY_REPOSITORY,
    AUDIT_LOG_REPOSITORY,
    EMAIL_REPOSITORY,
    SEARCH_REPOSITORY,
    TENANT_REPOSITORY,
    SECURITY_EVENT_REPOSITORY,
    WORKFLOW_REPOSITORY,
    STORAGE_OBJECT_REPOSITORY,
    UserRepository,
    OrganizationRepository,
    PolicyRepository,
    TaskRepository,
    CaseRepository,
    KnowledgeRepository,
    ReportRepository,
    NotificationRepository,
    AuditEntryRepository,
    AuditLogRepository,
    EmailRepository,
    SearchRepository,
    TenantRepository,
    SecurityEventRepository,
    WorkflowRepository,
    StorageObjectRepository,
  ],
})
export class RepositoriesModule {}
