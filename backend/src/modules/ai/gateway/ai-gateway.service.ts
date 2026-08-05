import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiMessageRole, AiProviderName } from '@prisma/client';
import { AI_REPOSITORY } from '../../../common/repositories/tokens';
import type { IAiRepository } from '../../../common/repositories/ai.repository';
import { EmbeddingsService } from '../embeddings/embeddings.service';
import { PromptManager } from '../prompts/prompt.manager';
import {
  AI_PROVIDER,
  AIProvider,
  ChatMessage,
  AiProviderName as ProviderName,
} from '../providers/ai-provider.types';
import { VECTOR_STORE, VectorStore } from '../vector/vector.types';

export type GatewayChatInput = {
  organizationId: string;
  userId: string;
  conversationId?: string;
  message: string;
  mode?: string;
  title?: string;
  context?: Record<string, string>;
  requestId?: string;
};

@Injectable()
export class AiGatewayService {
  private metrics = {
    chatRequests: 0,
    chatErrors: 0,
    totalLatencyMs: 0,
    totalTokens: 0,
    totalCostUsd: 0,
  };

  constructor(
    @Inject(AI_PROVIDER) private readonly provider: AIProvider,
    @Inject(VECTOR_STORE) private readonly vectorStore: VectorStore,
    @Inject(AI_REPOSITORY) private readonly aiRepo: IAiRepository,
    private readonly prompts: PromptManager,
    private readonly embeddings: EmbeddingsService,
    private readonly config: ConfigService,
  ) {}

  getMetrics() {
    return {
      ...this.metrics,
      avgLatencyMs:
        this.metrics.chatRequests === 0
          ? 0
          : Math.round(this.metrics.totalLatencyMs / this.metrics.chatRequests),
      provider: this.provider.name,
    };
  }

  async health() {
    const provider = await this.provider.healthCheck();
    const vector = await this.vectorStore.healthCheck();
    return {
      status:
        provider.status === 'down' || vector === 'down'
          ? 'down'
          : provider.status === 'unconfigured' && this.provider.name !== 'mock'
            ? 'degraded'
            : 'ok',
      provider,
      vectorStore: { name: this.vectorStore.name, status: vector },
      useRealAi: this.config.get<boolean>('featureFlags.useRealAi') ?? false,
      metrics: this.getMetrics(),
    };
  }

  listConversations(organizationId: string, userId: string) {
    return this.aiRepo.listConversations(organizationId, userId);
  }

  async getConversation(organizationId: string, userId: string, id: string) {
    const row = await this.aiRepo.getConversation(organizationId, userId, id);
    if (!row) throw new NotFoundException('Conversation not found');
    return row;
  }

  createConversation(
    organizationId: string,
    userId: string,
    title?: string,
    mode?: string,
  ) {
    return this.aiRepo.createConversation({
      organizationId,
      userId,
      title,
      mode,
    });
  }

  async deleteConversation(organizationId: string, userId: string, id: string) {
    await this.aiRepo.softDeleteConversation(organizationId, userId, id);
    return { deleted: true };
  }

  async chat(input: GatewayChatInput) {
    const started = Date.now();
    this.metrics.chatRequests += 1;
    const retries = this.config.get<number>('ai.maxRetries') ?? 2;
    let conversationId = input.conversationId;

    try {
      if (!conversationId) {
        const created = await this.aiRepo.createConversation({
          organizationId: input.organizationId,
          userId: input.userId,
          title: input.title ?? input.message.slice(0, 64),
          mode: input.mode ?? 'chat',
        });
        conversationId = created.id;
      } else {
        const existing = await this.aiRepo.getConversation(
          input.organizationId,
          input.userId,
          conversationId,
        );
        if (!existing) {
          throw new NotFoundException('Conversation not found');
        }
      }

      await this.aiRepo.createMessage({
        conversationId,
        organizationId: input.organizationId,
        userId: input.userId,
        role: AiMessageRole.USER,
        content: input.message,
      });

      const historyRows = await this.aiRepo.listMessages(conversationId);
      const historyBudget =
        this.config.get<number>('ai.historyTokenBudget') ?? 2500;
      const history = this.prompts.budgetHistory(
        historyRows
          .filter((m) => m.role === 'USER' || m.role === 'ASSISTANT')
          .map((m) => ({
            role: m.role === 'USER' ? 'user' : 'assistant',
            content: m.content,
          })),
        historyBudget,
      );

      let retrievedContext = '';
      try {
        const qEmbed = await this.provider.embed({
          texts: [input.message],
          organizationId: input.organizationId,
          requestId: input.requestId,
        });
        const hits = await this.vectorStore.similaritySearch({
          vector: qEmbed.embeddings[0] ?? [],
          topK: 5,
          filter: {
            organizationId: input.organizationId,
            namespace: 'default',
          },
          queryText: input.message,
        });
        retrievedContext = hits
          .map(
            (h, i) =>
              `[${i + 1}] (${h.entityType}:${h.entityId}) ${h.content.slice(0, 400)}`,
          )
          .join('\n');
      } catch {
        retrievedContext = '';
      }

      const rendered = await this.prompts.render(
        'workspace.chat',
        {
          context: retrievedContext || (input.context?.notes ?? ''),
          history: history
            .map((m) => `${m.role}: ${m.content}`)
            .join('\n')
            .slice(0, 6000),
          userMessage: input.message,
          orgName: input.context?.orgName ?? 'RegIntel',
          role: input.context?.role ?? 'analyst',
        },
        input.organizationId,
      );
      await this.prompts.auditRender(
        input.organizationId,
        input.userId,
        rendered,
        input.requestId,
      );

      const system = await this.prompts.render(
        'system.default',
        {
          orgName: input.context?.orgName ?? 'RegIntel',
          role: input.context?.role ?? 'analyst',
        },
        input.organizationId,
      );

      const messages: ChatMessage[] = [
        { role: 'system', content: system.text },
        { role: 'user', content: rendered.text },
      ];

      const result = await this.withRetries(retries, () =>
        this.provider.chat({
          messages,
          organizationId: input.organizationId,
          userId: input.userId,
          requestId: input.requestId,
          stream: false,
        }),
      );

      const assistant = await this.aiRepo.createMessage({
        conversationId,
        organizationId: input.organizationId,
        userId: input.userId,
        role: AiMessageRole.ASSISTANT,
        content: result.content,
        tokenCount: result.usage.completionTokens,
        model: result.model,
        provider: this.toPrismaProvider(result.provider),
        latencyMs: result.latencyMs,
        costUsd: result.costUsd,
        metadata: {
          finishReason: result.finishReason,
          promptKey: rendered.key,
          promptVersion: rendered.version,
          usage: result.usage,
        },
      });

      const usage = await this.aiRepo.recordUsage({
        organizationId: input.organizationId,
        userId: input.userId,
        kind: 'CHAT',
        provider: this.toPrismaProvider(result.provider),
        model: result.model,
        promptTokens: result.usage.promptTokens,
        completionTokens: result.usage.completionTokens,
        totalTokens: result.usage.totalTokens,
        latencyMs: result.latencyMs,
        conversationId,
        requestId: input.requestId,
      });
      if (result.costUsd > 0) {
        await this.aiRepo.recordCost({
          organizationId: input.organizationId,
          usageId: usage.id,
          provider: this.toPrismaProvider(result.provider),
          model: result.model,
          amountUsd: result.costUsd,
          promptTokens: result.usage.promptTokens,
          completionTokens: result.usage.completionTokens,
        });
      }
      await this.aiRepo.recordProviderLog({
        organizationId: input.organizationId,
        userId: input.userId,
        provider: this.toPrismaProvider(result.provider),
        operation: 'gateway.chat',
        model: result.model,
        success: true,
        latencyMs: result.latencyMs,
        promptKey: rendered.key,
        promptVersion: rendered.version,
        requestId: input.requestId,
      });

      // Best-effort conversation embedding for future retrieval
      void this.embeddings
        .embedEntity({
          organizationId: input.organizationId,
          userId: input.userId,
          entityType: 'CONVERSATION',
          entityId: conversationId,
          title: input.title ?? input.message.slice(0, 64),
          content: `${input.message}\n\n${result.content}`,
          namespace: 'default',
        })
        .catch(() => undefined);

      this.metrics.totalLatencyMs += Date.now() - started;
      this.metrics.totalTokens += result.usage.totalTokens;
      this.metrics.totalCostUsd += result.costUsd;

      return {
        conversationId,
        message: assistant,
        provider: result.provider,
        model: result.model,
        usage: result.usage,
        costUsd: result.costUsd,
        latencyMs: result.latencyMs,
        prompt: { key: rendered.key, version: rendered.version },
      };
    } catch (err) {
      this.metrics.chatErrors += 1;
      await this.aiRepo.recordProviderLog({
        organizationId: input.organizationId,
        userId: input.userId,
        provider: this.toPrismaProvider(this.provider.name),
        operation: 'gateway.chat',
        success: false,
        latencyMs: Date.now() - started,
        errorMessage: err instanceof Error ? err.message : String(err),
        requestId: input.requestId,
      });
      throw err;
    }
  }

  private async withRetries<T>(
    maxRetries: number,
    fn: () => Promise<T>,
  ): Promise<T> {
    let lastErr: unknown;
    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
      try {
        return await fn();
      } catch (err) {
        lastErr = err;
        if (attempt === maxRetries) break;
        await new Promise((r) => setTimeout(r, 50 * (attempt + 1)));
      }
    }
    throw lastErr;
  }

  private toPrismaProvider(name: ProviderName): AiProviderName {
    switch (name) {
      case 'openai':
        return 'OPENAI';
      case 'azure_openai':
        return 'AZURE_OPENAI';
      case 'anthropic':
        return 'ANTHROPIC';
      case 'gemini':
        return 'GEMINI';
      default:
        return 'MOCK';
    }
  }
}
