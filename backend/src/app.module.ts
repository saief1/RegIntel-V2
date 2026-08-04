import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuditModule } from './common/audit/audit.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { RepositoriesModule } from './common/repositories/repositories.module';
import { requestIdMiddleware } from './common/request-id/request-id.middleware';
import configuration from './config/configuration';
import { validateEnv } from './config/env.validation';
import { AuditEntriesModule } from './modules/audit-entries/audit-entries.module';
import { AuthModule } from './modules/auth/auth.module';
import { CasesModule } from './modules/cases/cases.module';
import { HealthModule } from './modules/health/health.module';
import { KnowledgeModule } from './modules/knowledge/knowledge.module';
import { MfaModule } from './modules/mfa/mfa.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { PoliciesModule } from './modules/policies/policies.module';
import { QueueModule } from './modules/queue/queue.module';
import { RbacModule } from './modules/rbac/rbac.module';
import { ReportsModule } from './modules/reports/reports.module';
import { ScimModule } from './modules/scim/scim.module';
import { SecurityModule } from './modules/security/security.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { SsoModule } from './modules/sso/sso.module';
import { StorageModule } from './modules/storage/storage.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { UsersModule } from './modules/users/users.module';
import { WorkflowModule } from './modules/workflow/workflow.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validateEnv,
    }),
    PrismaModule,
    RepositoriesModule,
    AuditModule,
    QueueModule,
    HealthModule,
    AuthModule,
    UsersModule,
    OrganizationsModule,
    MfaModule,
    RbacModule,
    PermissionsModule,
    SsoModule,
    ScimModule,
    SessionsModule,
    SecurityModule,
    PoliciesModule,
    TasksModule,
    CasesModule,
    KnowledgeModule,
    ReportsModule,
    NotificationsModule,
    StorageModule,
    WorkflowModule,
    AuditEntriesModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(requestIdMiddleware).forRoutes('{*path}');
  }
}
