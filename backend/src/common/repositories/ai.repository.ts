import { Injectable } from '@nestjs/common';
import {
  AiConversation,
  AiCost,
  AiMessage,
  AiMessageRole,
  AiProviderLog,
  AiProviderName,
  AiUsage,
  AiUsageKind,
  EmbeddingChunk,
  EmbeddingDocument,
  EmbeddingEntityType,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BaseRepository } from './base.repository';

export type CreateConversationInput = {
  organizationId: string;
  userId: string;
  title?: string;
  mode?: string;
  metadata?: Prisma.InputJsonValue;
};

export type CreateMessageInput = {
  conversationId: string;
  organizationId: string;
  userId?: string | null;
  role: AiMessageRole;
  content: string;
  tokenCount?: number;
  model?: string;
  provider?: AiProviderName;
  latencyMs?: number;
  costUsd?: number;
  metadata?: Prisma.InputJsonValue;
};

export interface IAiRepository {
  listConversations(
    organizationId: string,
    userId: string,
  ): Promise<AiConversation[]>;
  getConversation(
    organizationId: string,
    userId: string,
    id: string,
  ): Promise<(AiConversation & { messages: AiMessage[] }) | null>;
  createConversation(input: CreateConversationInput): Promise<AiConversation>;
  updateConversation(
    organizationId: string,
    userId: string,
    id: string,
    data: Partial<
      Pick<
        AiConversation,
        'title' | 'isPinned' | 'isFavorite' | 'isSaved' | 'mode'
      >
    >,
  ): Promise<AiConversation>;
  softDeleteConversation(
    organizationId: string,
    userId: string,
    id: string,
  ): Promise<void>;
  createMessage(input: CreateMessageInput): Promise<AiMessage>;
  listMessages(conversationId: string): Promise<AiMessage[]>;
  recordUsage(data: {
    organizationId: string;
    userId?: string | null;
    kind: AiUsageKind;
    provider: AiProviderName;
    model: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    latencyMs?: number;
    conversationId?: string;
    requestId?: string;
    metadata?: Prisma.InputJsonValue;
  }): Promise<AiUsage>;
  recordCost(data: {
    organizationId: string;
    usageId?: string;
    provider: AiProviderName;
    model: string;
    amountUsd: number;
    promptTokens: number;
    completionTokens: number;
    metadata?: Prisma.InputJsonValue;
  }): Promise<AiCost>;
  recordProviderLog(data: {
    organizationId?: string | null;
    userId?: string | null;
    provider: AiProviderName;
    operation: string;
    model?: string;
    success: boolean;
    statusCode?: number;
    latencyMs?: number;
    errorMessage?: string;
    promptKey?: string;
    promptVersion?: number;
    requestId?: string;
    metadata?: Prisma.InputJsonValue;
  }): Promise<AiProviderLog>;
  upsertEmbeddingDocument(data: {
    organizationId: string;
    entityType: EmbeddingEntityType;
    entityId: string;
    namespace: string;
    title: string;
    contentHash: string;
    metadata?: Prisma.InputJsonValue;
    chunkCount: number;
  }): Promise<EmbeddingDocument>;
  replaceChunks(
    documentId: string,
    chunks: Array<{
      organizationId: string;
      entityType: EmbeddingEntityType;
      entityId: string;
      namespace: string;
      chunkIndex: number;
      content: string;
      embedding: number[];
      tokenCount: number;
      contentHash: string;
      metadata?: Prisma.InputJsonValue;
    }>,
  ): Promise<EmbeddingChunk[]>;
  findDocument(
    organizationId: string,
    namespace: string,
    entityType: EmbeddingEntityType,
    entityId: string,
  ): Promise<EmbeddingDocument | null>;
}

@Injectable()
export class AiRepository extends BaseRepository implements IAiRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  listConversations(organizationId: string, userId: string) {
    return this.prisma.aiConversation.findMany({
      where: { organizationId, userId, deletedAt: null },
      orderBy: { updatedAt: 'desc' },
    });
  }

  getConversation(organizationId: string, userId: string, id: string) {
    return this.prisma.aiConversation.findFirst({
      where: { id, organizationId, userId, deletedAt: null },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
  }

  createConversation(input: CreateConversationInput) {
    return this.prisma.aiConversation.create({
      data: {
        organizationId: input.organizationId,
        userId: input.userId,
        title: input.title ?? 'New conversation',
        mode: input.mode ?? 'chat',
        metadata: input.metadata,
      },
    });
  }

  async updateConversation(
    organizationId: string,
    userId: string,
    id: string,
    data: Partial<
      Pick<
        AiConversation,
        'title' | 'isPinned' | 'isFavorite' | 'isSaved' | 'mode'
      >
    >,
  ) {
    const existing = await this.prisma.aiConversation.findFirst({
      where: { id, organizationId, userId, deletedAt: null },
    });
    if (!existing) {
      throw new Error('Conversation not found');
    }
    return this.prisma.aiConversation.update({
      where: { id },
      data,
    });
  }

  async softDeleteConversation(
    organizationId: string,
    userId: string,
    id: string,
  ): Promise<void> {
    await this.prisma.aiConversation.updateMany({
      where: { id, organizationId, userId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }

  createMessage(input: CreateMessageInput) {
    return this.prisma.aiMessage.create({
      data: {
        conversationId: input.conversationId,
        organizationId: input.organizationId,
        userId: input.userId ?? undefined,
        role: input.role,
        content: input.content,
        tokenCount: input.tokenCount,
        model: input.model,
        provider: input.provider,
        latencyMs: input.latencyMs,
        costUsd: input.costUsd,
        metadata: input.metadata,
      },
    });
  }

  listMessages(conversationId: string) {
    return this.prisma.aiMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
  }

  recordUsage(data: {
    organizationId: string;
    userId?: string | null;
    kind: AiUsageKind;
    provider: AiProviderName;
    model: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    latencyMs?: number;
    conversationId?: string;
    requestId?: string;
    metadata?: Prisma.InputJsonValue;
  }) {
    return this.prisma.aiUsage.create({ data });
  }

  recordCost(data: {
    organizationId: string;
    usageId?: string;
    provider: AiProviderName;
    model: string;
    amountUsd: number;
    promptTokens: number;
    completionTokens: number;
    metadata?: Prisma.InputJsonValue;
  }) {
    return this.prisma.aiCost.create({
      data: {
        organizationId: data.organizationId,
        usageId: data.usageId,
        provider: data.provider,
        model: data.model,
        amountUsd: data.amountUsd,
        promptTokens: data.promptTokens,
        completionTokens: data.completionTokens,
        metadata: data.metadata,
      },
    });
  }

  recordProviderLog(data: {
    organizationId?: string | null;
    userId?: string | null;
    provider: AiProviderName;
    operation: string;
    model?: string;
    success: boolean;
    statusCode?: number;
    latencyMs?: number;
    errorMessage?: string;
    promptKey?: string;
    promptVersion?: number;
    requestId?: string;
    metadata?: Prisma.InputJsonValue;
  }) {
    return this.prisma.aiProviderLog.create({
      data: {
        organizationId: data.organizationId ?? undefined,
        userId: data.userId ?? undefined,
        provider: data.provider,
        operation: data.operation,
        model: data.model,
        success: data.success,
        statusCode: data.statusCode,
        latencyMs: data.latencyMs,
        errorMessage: data.errorMessage,
        promptKey: data.promptKey,
        promptVersion: data.promptVersion,
        requestId: data.requestId,
        metadata: data.metadata,
      },
    });
  }

  async upsertEmbeddingDocument(data: {
    organizationId: string;
    entityType: EmbeddingEntityType;
    entityId: string;
    namespace: string;
    title: string;
    contentHash: string;
    metadata?: Prisma.InputJsonValue;
    chunkCount: number;
  }) {
    return this.prisma.embeddingDocument.upsert({
      where: {
        organizationId_namespace_entityType_entityId: {
          organizationId: data.organizationId,
          namespace: data.namespace,
          entityType: data.entityType,
          entityId: data.entityId,
        },
      },
      create: {
        ...data,
        indexedAt: new Date(),
      },
      update: {
        title: data.title,
        contentHash: data.contentHash,
        metadata: data.metadata,
        chunkCount: data.chunkCount,
        indexedAt: new Date(),
      },
    });
  }

  async replaceChunks(
    documentId: string,
    chunks: Array<{
      organizationId: string;
      entityType: EmbeddingEntityType;
      entityId: string;
      namespace: string;
      chunkIndex: number;
      content: string;
      embedding: number[];
      tokenCount: number;
      contentHash: string;
      metadata?: Prisma.InputJsonValue;
    }>,
  ) {
    await this.prisma.embeddingChunk.deleteMany({ where: { documentId } });
    if (!chunks.length) return [];
    await this.prisma.embeddingChunk.createMany({
      data: chunks.map((c) => ({
        documentId,
        organizationId: c.organizationId,
        entityType: c.entityType,
        entityId: c.entityId,
        namespace: c.namespace,
        chunkIndex: c.chunkIndex,
        content: c.content,
        embedding: c.embedding,
        tokenCount: c.tokenCount,
        contentHash: c.contentHash,
        metadata: c.metadata,
      })),
    });
    return this.prisma.embeddingChunk.findMany({
      where: { documentId },
      orderBy: { chunkIndex: 'asc' },
    });
  }

  findDocument(
    organizationId: string,
    namespace: string,
    entityType: EmbeddingEntityType,
    entityId: string,
  ) {
    return this.prisma.embeddingDocument.findUnique({
      where: {
        organizationId_namespace_entityType_entityId: {
          organizationId,
          namespace,
          entityType,
          entityId,
        },
      },
    });
  }
}
