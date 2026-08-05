import { Injectable } from '@nestjs/common';
import {
  EmailDelivery,
  EmailDeliveryStatus,
  EmailProviderType,
  EmailTemplate,
  Prisma,
} from '@prisma/client';
import { PageResult } from '../dto/pagination-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import { BaseRepository } from './base.repository';

export type CreateEmailDeliveryInput = {
  organizationId?: string | null;
  userId?: string | null;
  toAddress: string;
  templateKey: string;
  subject: string;
  provider: EmailProviderType;
  payload?: Prisma.InputJsonValue;
  maxAttempts?: number;
};

export interface IEmailRepository {
  upsertSystemTemplate(input: {
    key: string;
    name: string;
    subject: string;
    htmlBody: string;
    textBody: string;
    variables: string[];
  }): Promise<EmailTemplate>;
  findTemplate(
    key: string,
    organizationId?: string | null,
  ): Promise<EmailTemplate | null>;
  listTemplates(organizationId?: string | null): Promise<EmailTemplate[]>;
  createDelivery(input: CreateEmailDeliveryInput): Promise<EmailDelivery>;
  updateDelivery(
    id: string,
    data: {
      status?: EmailDeliveryStatus;
      attempts?: number;
      lastError?: string | null;
      providerMessageId?: string | null;
      sentAt?: Date | null;
      provider?: EmailProviderType;
    },
  ): Promise<EmailDelivery>;
  listDeliveries(
    organizationId: string,
    page: number,
    pageSize: number,
  ): Promise<PageResult<EmailDelivery>>;
  findDelivery(id: string): Promise<EmailDelivery | null>;
}

@Injectable()
export class EmailRepository
  extends BaseRepository
  implements IEmailRepository
{
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  upsertSystemTemplate(input: {
    key: string;
    name: string;
    subject: string;
    htmlBody: string;
    textBody: string;
    variables: string[];
  }) {
    return this.prisma.emailTemplate
      .upsert({
        where: {
          organizationId_key: {
            organizationId: null as unknown as string,
            key: input.key,
          },
        },
        create: {
          organizationId: null,
          key: input.key,
          name: input.name,
          subject: input.subject,
          htmlBody: input.htmlBody,
          textBody: input.textBody,
          variables: input.variables,
          active: true,
        },
        update: {
          name: input.name,
          subject: input.subject,
          htmlBody: input.htmlBody,
          textBody: input.textBody,
          variables: input.variables,
          active: true,
        },
      })
      .catch(async () => {
        // Prisma unique on nullable orgId can be finicky; fall back to find+create.
        const existing = await this.prisma.emailTemplate.findFirst({
          where: { key: input.key, organizationId: null },
        });
        if (existing) {
          return this.prisma.emailTemplate.update({
            where: { id: existing.id },
            data: {
              name: input.name,
              subject: input.subject,
              htmlBody: input.htmlBody,
              textBody: input.textBody,
              variables: input.variables,
              active: true,
            },
          });
        }
        return this.prisma.emailTemplate.create({
          data: {
            organizationId: null,
            key: input.key,
            name: input.name,
            subject: input.subject,
            htmlBody: input.htmlBody,
            textBody: input.textBody,
            variables: input.variables,
            active: true,
          },
        });
      });
  }

  async findTemplate(key: string, organizationId?: string | null) {
    if (organizationId) {
      const orgTemplate = await this.prisma.emailTemplate.findFirst({
        where: { key, organizationId, active: true },
      });
      if (orgTemplate) return orgTemplate;
    }
    return this.prisma.emailTemplate.findFirst({
      where: { key, organizationId: null, active: true },
    });
  }

  listTemplates(organizationId?: string | null) {
    return this.prisma.emailTemplate.findMany({
      where: {
        active: true,
        OR: [
          { organizationId: null },
          ...(organizationId ? [{ organizationId }] : []),
        ],
      },
      orderBy: { key: 'asc' },
    });
  }

  createDelivery(input: CreateEmailDeliveryInput) {
    return this.prisma.emailDelivery.create({
      data: {
        organizationId: input.organizationId,
        userId: input.userId,
        toAddress: input.toAddress,
        templateKey: input.templateKey,
        subject: input.subject,
        provider: input.provider,
        payload: input.payload,
        maxAttempts: input.maxAttempts ?? 5,
        status: 'QUEUED',
      },
    });
  }

  updateDelivery(
    id: string,
    data: {
      status?: EmailDeliveryStatus;
      attempts?: number;
      lastError?: string | null;
      providerMessageId?: string | null;
      sentAt?: Date | null;
      provider?: EmailProviderType;
    },
  ) {
    return this.prisma.emailDelivery.update({ where: { id }, data });
  }

  async listDeliveries(
    organizationId: string,
    page: number,
    pageSize: number,
  ): Promise<PageResult<EmailDelivery>> {
    const skip = (page - 1) * pageSize;
    const where = { organizationId };
    const [total, data] = await Promise.all([
      this.prisma.emailDelivery.count({ where }),
      this.prisma.emailDelivery.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    return this.toPageResult(data, total, page, pageSize);
  }

  findDelivery(id: string) {
    return this.prisma.emailDelivery.findUnique({ where: { id } });
  }
}
