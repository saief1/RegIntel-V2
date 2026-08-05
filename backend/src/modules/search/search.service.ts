import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SearchEntityType } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ISearchRepository } from '../../common/repositories/search.repository';
import { SEARCH_REPOSITORY } from '../../common/repositories/tokens';
import { JobsService } from '../queue/jobs.service';

const ENTITY_TYPES: SearchEntityType[] = [
  'POLICY',
  'KNOWLEDGE',
  'DOCUMENT',
  'TASK',
  'CASE',
  'REPORT',
  'COMMENT',
  'NOTIFICATION',
  'USER',
  'ORGANIZATION',
];

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    @Inject(SEARCH_REPOSITORY) private readonly repo: ISearchRepository,
    private readonly prisma: PrismaService,
    private readonly jobs: JobsService,
    private readonly config: ConfigService,
  ) {}

  isRealSearchEnabled() {
    return this.config.get<boolean>('featureFlags.useRealSearch') === true;
  }

  provider() {
    return this.config.get<string>('search.provider') ?? 'postgres';
  }

  search(input: {
    organizationId: string;
    q: string;
    entityTypes?: string[];
    page?: number;
    pageSize?: number;
  }) {
    const entityTypes = input.entityTypes
      ?.map((t) => t.toUpperCase())
      .filter((t): t is SearchEntityType =>
        ENTITY_TYPES.includes(t as SearchEntityType),
      );
    return this.repo.search({
      organizationId: input.organizationId,
      q: input.q,
      entityTypes,
      page: input.page ?? 1,
      pageSize: input.pageSize ?? 20,
    });
  }

  async indexEntity(
    organizationId: string,
    entityType: string,
    entityId: string,
  ) {
    const type = entityType.toUpperCase() as SearchEntityType;
    switch (type) {
      case 'POLICY': {
        const row = await this.prisma.policy.findFirst({
          where: { id: entityId, organizationId, deletedAt: null },
        });
        if (!row) return;
        await this.repo.upsert({
          organizationId,
          entityType: 'POLICY',
          entityId,
          title: row.title,
          body: row.description ?? '',
          rankBoost: 1.2,
        });
        return;
      }
      case 'TASK': {
        const row = await this.prisma.task.findFirst({
          where: { id: entityId, organizationId, deletedAt: null },
        });
        if (!row) return;
        await this.repo.upsert({
          organizationId,
          entityType: 'TASK',
          entityId,
          title: row.title,
          body: row.description ?? '',
        });
        return;
      }
      case 'CASE': {
        const row = await this.prisma.case.findFirst({
          where: { id: entityId, organizationId, deletedAt: null },
        });
        if (!row) return;
        await this.repo.upsert({
          organizationId,
          entityType: 'CASE',
          entityId,
          title: row.title,
          body: row.summary ?? '',
          rankBoost: 1.1,
        });
        return;
      }
      case 'KNOWLEDGE':
      case 'DOCUMENT': {
        const row = await this.prisma.knowledgeDocument.findFirst({
          where: { id: entityId, organizationId, deletedAt: null },
        });
        if (!row) return;
        await this.repo.upsert({
          organizationId,
          entityType: type === 'DOCUMENT' ? 'DOCUMENT' : 'KNOWLEDGE',
          entityId,
          title: row.title,
          body: row.summary ?? row.body ?? '',
        });
        return;
      }
      case 'REPORT': {
        const row = await this.prisma.report.findFirst({
          where: { id: entityId, organizationId, deletedAt: null },
        });
        if (!row) return;
        await this.repo.upsert({
          organizationId,
          entityType: 'REPORT',
          entityId,
          title: row.title,
          body: row.description ?? '',
        });
        return;
      }
      case 'NOTIFICATION': {
        const row = await this.prisma.notification.findFirst({
          where: { id: entityId, organizationId, deletedAt: null },
        });
        if (!row) return;
        await this.repo.upsert({
          organizationId,
          entityType: 'NOTIFICATION',
          entityId,
          title: row.title,
          body: row.body ?? '',
          rankBoost: 0.5,
        });
        return;
      }
      case 'ORGANIZATION': {
        const row = await this.prisma.organization.findUnique({
          where: { id: organizationId },
        });
        if (!row) return;
        await this.repo.upsert({
          organizationId,
          entityType: 'ORGANIZATION',
          entityId: row.id,
          title: row.name,
          body: row.slug,
          rankBoost: 0.8,
        });
        return;
      }
      case 'USER': {
        const membership = await this.prisma.organizationMembership.findFirst({
          where: { organizationId, userId: entityId, status: 'ACTIVE' },
          include: { user: true },
        });
        if (!membership) return;
        await this.repo.upsert({
          organizationId,
          entityType: 'USER',
          entityId,
          title: membership.user.name,
          body: membership.user.email,
          rankBoost: 0.7,
        });
        return;
      }
      default:
        this.logger.debug(`No indexer for entity type ${entityType}`);
    }
  }

  async rebuild(organizationId: string) {
    await this.repo.clearOrganization(organizationId);
    let indexed = 0;

    const policies = await this.prisma.policy.findMany({
      where: { organizationId, deletedAt: null },
      select: { id: true },
    });
    for (const p of policies) {
      await this.indexEntity(organizationId, 'POLICY', p.id);
      indexed++;
    }

    const tasks = await this.prisma.task.findMany({
      where: { organizationId, deletedAt: null },
      select: { id: true },
    });
    for (const t of tasks) {
      await this.indexEntity(organizationId, 'TASK', t.id);
      indexed++;
    }

    const cases = await this.prisma.case.findMany({
      where: { organizationId, deletedAt: null },
      select: { id: true },
    });
    for (const c of cases) {
      await this.indexEntity(organizationId, 'CASE', c.id);
      indexed++;
    }

    const docs = await this.prisma.knowledgeDocument.findMany({
      where: { organizationId, deletedAt: null },
      select: { id: true },
    });
    for (const d of docs) {
      await this.indexEntity(organizationId, 'KNOWLEDGE', d.id);
      indexed++;
    }

    const reports = await this.prisma.report.findMany({
      where: { organizationId, deletedAt: null },
      select: { id: true },
    });
    for (const r of reports) {
      await this.indexEntity(organizationId, 'REPORT', r.id);
      indexed++;
    }

    const notifications = await this.prisma.notification.findMany({
      where: { organizationId, deletedAt: null },
      select: { id: true },
      take: 500,
    });
    for (const n of notifications) {
      await this.indexEntity(organizationId, 'NOTIFICATION', n.id);
      indexed++;
    }

    const members = await this.prisma.organizationMembership.findMany({
      where: { organizationId, status: 'ACTIVE' },
      select: { userId: true },
    });
    for (const m of members) {
      await this.indexEntity(organizationId, 'USER', m.userId);
      indexed++;
    }

    await this.indexEntity(organizationId, 'ORGANIZATION', organizationId);
    indexed++;

    return { indexed, provider: this.provider() };
  }

  async incremental(organizationId: string) {
    // Lightweight pass: re-index recently updated domain rows.
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    let indexed = 0;
    const policies = await this.prisma.policy.findMany({
      where: { organizationId, deletedAt: null, updatedAt: { gte: since } },
      select: { id: true },
    });
    for (const p of policies) {
      await this.indexEntity(organizationId, 'POLICY', p.id);
      indexed++;
    }
    const tasks = await this.prisma.task.findMany({
      where: { organizationId, deletedAt: null, updatedAt: { gte: since } },
      select: { id: true },
    });
    for (const t of tasks) {
      await this.indexEntity(organizationId, 'TASK', t.id);
      indexed++;
    }
    return { indexed };
  }

  enqueueRebuild(organizationId: string) {
    return this.jobs.enqueueSearchIndex({
      organizationId,
      mode: 'rebuild',
    });
  }

  stats(organizationId: string) {
    return this.repo.countByOrg(organizationId).then((count) => ({
      documents: count,
      provider: this.provider(),
      useRealSearch: this.isRealSearchEnabled(),
    }));
  }
}
