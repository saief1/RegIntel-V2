import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiProviderName, EmbeddingEntityType, Prisma } from '@prisma/client';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { AI_REPOSITORY } from '../../../common/repositories/tokens';
import type { IAiRepository } from '../../../common/repositories/ai.repository';
import { CitationsService } from '../citations/citations.service';
import { citationKindForEntity, ENTITY_HREF } from '../indexing/indexing.types';
import { PromptManager } from '../prompts/prompt.manager';
import {
  AI_PROVIDER,
  AIProvider,
  AiProviderName as ProviderName,
  ChatMessage,
} from '../providers/ai-provider.types';
import { RetrievalHit, RetrievalService } from '../retrieval/retrieval.service';

export type RagAskInput = {
  organizationId: string;
  userId: string;
  question: string;
  mode?: string;
  conversationId?: string;
  sessionId?: string;
  workspaceId?: string;
  topK?: number;
  similarityThreshold?: number;
  entityTypes?: EmbeddingEntityType[];
  docTypes?: string[];
  context?: Record<string, string>;
  requestId?: string;
  /** When true, persist conversation messages via AI repo. */
  persistConversation?: boolean;
};

const MODE_PROMPT_KEY: Record<string, string> = {
  chat: 'workspace.chat',
  research: 'workspace.research',
  document_analysis: 'workspace.document_analysis',
  compare: 'workspace.compare',
  drafting: 'workspace.drafting',
  executive_brief: 'workspace.executive_brief',
  board_report: 'report.executive',
  work: 'workspace.chat',
  knowledge: 'workspace.research',
  case: 'workspace.chat',
  policy: 'policy.review',
  report: 'report.executive',
};

const LOW_CONFIDENCE_THRESHOLD = 0.45;

/**
 * C008 — RAG Response Engine
 * Question → retrieve → prompt → LLM → grounded answer + citations metadata.
 */
@Injectable()
export class RagService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly retrieval: RetrievalService,
    private readonly citations: CitationsService,
    private readonly prompts: PromptManager,
    @Inject(AI_PROVIDER) private readonly provider: AIProvider,
    @Inject(AI_REPOSITORY) private readonly aiRepo: IAiRepository,
  ) {}

  isEnabled(): boolean {
    return this.config.get<boolean>('featureFlags.useRag') === true;
  }

  async ask(input: RagAskInput) {
    const started = Date.now();
    const mode = (input.mode ?? 'chat').toLowerCase();
    const topK = input.topK ?? 8;
    const threshold = input.similarityThreshold ?? 0.15;

    const ragQuery = await this.prisma.ragQuery.create({
      data: {
        organizationId: input.organizationId,
        userId: input.userId,
        sessionId: input.sessionId,
        conversationId: input.conversationId,
        question: input.question,
        mode,
        workspaceId: input.workspaceId,
        topK,
        similarityThreshold: threshold,
        filters: {
          entityTypes: input.entityTypes,
          docTypes: input.docTypes,
        },
      },
    });

    const retrieved = await this.retrieval.retrieve({
      organizationId: input.organizationId,
      userId: input.userId,
      query: input.question,
      topK,
      similarityThreshold: threshold,
      sessionId: input.sessionId,
      queryId: ragQuery.id,
      includeRelated: true,
      recommendPolicies: true,
      filters: {
        namespace: 'default',
        workspaceId: input.workspaceId,
        entityTypes: input.entityTypes,
        docTypes: input.docTypes,
      },
    });

    const confidence = this.computeConfidence(retrieved.hits);
    const lowConfidence = confidence < LOW_CONFIDENCE_THRESHOLD;

    const contextBlock = retrieved.hits
      .map(
        (h, i) =>
          `[${i + 1}] (${h.entityType}:${h.entityId} v${h.contentVersion ?? 1}) ${h.title}\n${h.content.slice(0, 600)}`,
      )
      .join('\n\n');

    const promptKey = MODE_PROMPT_KEY[mode] ?? 'workspace.rag';
    const rendered = await this.prompts.render(
      promptKey,
      {
        context:
          contextBlock || (input.context?.notes ?? 'No retrieved sources.'),
        history: '',
        userMessage: input.question,
        orgName: input.context?.orgName ?? 'RegIntel',
        role: input.context?.role ?? 'analyst',
        framework: input.context?.framework ?? 'applicable regulations',
        policyText: contextBlock,
        changes: '',
        period: input.context?.period ?? 'current period',
        notes: input.question,
        documentText: contextBlock,
        leftText: input.context?.leftText ?? '',
        rightText: input.context?.rightText ?? '',
        draftBrief: input.context?.draftBrief ?? '',
      },
      input.organizationId,
    );

    const system = await this.prompts.render(
      'system.rag',
      {
        orgName: input.context?.orgName ?? 'RegIntel',
        role: input.context?.role ?? 'analyst',
      },
      input.organizationId,
    );

    const messages: ChatMessage[] = [
      { role: 'system', content: system.text },
      {
        role: 'user',
        content: [
          rendered.text,
          '',
          'Ground your answer in the numbered sources. Use inline markers like [1], [2].',
          lowConfidence
            ? 'Confidence is low — state uncertainty clearly and recommend manual review.'
            : '',
        ]
          .filter(Boolean)
          .join('\n'),
      },
    ];

    const llm = await this.provider.chat({
      messages,
      organizationId: input.organizationId,
      userId: input.userId,
      requestId: input.requestId,
    });

    let answer = llm.content;
    if (lowConfidence) {
      answer = [
        answer,
        '',
        '---',
        '**Low confidence:** Supporting evidence is limited or weakly matched.',
        'Manual review is recommended. You can refine the question or request an additional search across policies and regulations.',
      ].join('\n');
    }

    const reasoningSummary = this.buildReasoningSummary(
      retrieved.hits,
      confidence,
      lowConfidence,
    );

    const citationRecords = await this.citations.createFromHits({
      organizationId: input.organizationId,
      userId: input.userId,
      queryId: ragQuery.id,
      hits: retrieved.hits,
      confidence,
    });

    await this.prisma.ragResult.createMany({
      data: retrieved.hits.map((h, rank) => ({
        queryId: ragQuery.id,
        organizationId: input.organizationId,
        chunkId: h.chunkId,
        entityType: h.entityType,
        entityId: h.entityId,
        title: h.title,
        contentPreview: h.content.slice(0, 400),
        score: h.score,
        rank: rank + 1,
        contentVersion: h.contentVersion,
        metadata: (h.metadata ?? undefined) as
          Prisma.InputJsonValue | undefined,
      })),
    });

    const latencyMs = Date.now() - started;
    await this.prisma.ragQuery.update({
      where: { id: ragQuery.id },
      data: {
        confidence,
        latencyMs,
        chunkCount: retrieved.hits.length,
        tokenUsage: llm.usage,
        answer,
        reasoningSummary,
        lowConfidence,
        metadata: {
          provider: llm.provider,
          model: llm.model,
          relatedCount: retrieved.related.length,
          recommendedPolicies: retrieved.recommendedPolicies,
        },
      },
    });

    await this.aiRepo.recordUsage({
      organizationId: input.organizationId,
      userId: input.userId,
      kind: 'RAG',
      provider: this.toPrismaProvider(llm.provider),
      model: llm.model,
      promptTokens: llm.usage.promptTokens,
      completionTokens: llm.usage.completionTokens,
      totalTokens: llm.usage.totalTokens,
      latencyMs,
      conversationId: input.conversationId,
      requestId: input.requestId,
      metadata: { ragQueryId: ragQuery.id, confidence },
    });

    await this.touchMetrics(
      input.organizationId,
      latencyMs,
      confidence,
      retrieved.hits.length,
      lowConfidence,
    );

    return {
      queryId: ragQuery.id,
      answer,
      confidence,
      lowConfidence,
      chunkCount: retrieved.hits.length,
      latencyMs,
      tokenUsage: llm.usage,
      provider: llm.provider,
      model: llm.model,
      prompt: { key: rendered.key, version: rendered.version },
      reasoningSummary,
      supportingDocuments: retrieved.hits.map((h, i) => ({
        marker: `[${i + 1}]`,
        entityType: h.entityType,
        entityId: h.entityId,
        title: h.title,
        score: h.score,
        contentVersion: h.contentVersion,
        preview: h.content.slice(0, 240),
        href: ENTITY_HREF[h.entityType]?.(h.entityId) ?? undefined,
        kind: citationKindForEntity(h.entityType),
      })),
      regulationsReferenced: retrieved.hits
        .filter(
          (h) => h.entityType === 'REGULATION' || h.entityType === 'GUIDANCE',
        )
        .map((h) => ({ entityId: h.entityId, title: h.title })),
      policiesReferenced: retrieved.hits
        .filter((h) => h.entityType === 'POLICY')
        .map((h) => ({ entityId: h.entityId, title: h.title })),
      citations: citationRecords,
      related: retrieved.related,
      recommendedPolicies: retrieved.recommendedPolicies,
      retrieval: {
        useVector: retrieved.useVector,
        useHybrid: retrieved.useHybrid,
        latencyMs: retrieved.latencyMs,
      },
      offerAdditionalSearch: lowConfidence,
    };
  }

  computeConfidence(hits: RetrievalHit[]): number {
    if (!hits.length) return 0.15;
    const top = hits.slice(0, 5);
    const avg =
      top.reduce((sum, h) => sum + Math.min(1, Math.max(0, h.score)), 0) /
      top.length;
    const coverage = Math.min(1, hits.length / 4);
    return Math.round((avg * 0.7 + coverage * 0.3) * 1000) / 1000;
  }

  private buildReasoningSummary(
    hits: RetrievalHit[],
    confidence: number,
    lowConfidence: boolean,
  ): string {
    if (!hits.length) {
      return 'No indexed sources matched the question closely enough.';
    }
    const types = [...new Set(hits.map((h) => h.entityType))].join(', ');
    return [
      `Retrieved ${hits.length} chunk(s) across ${types}.`,
      `Top score ${hits[0].score.toFixed(3)}; confidence ${confidence.toFixed(2)}.`,
      lowConfidence
        ? 'Evidence strength is weak — treat the answer as provisional.'
        : 'Answer is grounded in the highest-ranked retrieved sources.',
    ].join(' ');
  }

  private async touchMetrics(
    organizationId: string,
    latencyMs: number,
    confidence: number,
    hitCount: number,
    lowConfidence: boolean,
  ) {
    const periodStart = new Date();
    periodStart.setUTCHours(0, 0, 0, 0);
    const periodEnd = new Date(periodStart);
    periodEnd.setUTCDate(periodEnd.getUTCDate() + 1);

    const existing = await this.prisma.retrievalMetric.findUnique({
      where: {
        organizationId_periodStart_periodEnd: {
          organizationId,
          periodStart,
          periodEnd,
        },
      },
    });
    if (!existing) {
      await this.prisma.retrievalMetric.create({
        data: {
          organizationId,
          periodStart,
          periodEnd,
          queryCount: 1,
          avgLatencyMs: latencyMs,
          avgConfidence: confidence,
          avgHitCount: hitCount,
          lowConfidenceCount: lowConfidence ? 1 : 0,
        },
      });
      return;
    }
    const n = existing.queryCount + 1;
    await this.prisma.retrievalMetric.update({
      where: { id: existing.id },
      data: {
        queryCount: n,
        avgLatencyMs:
          (existing.avgLatencyMs * existing.queryCount + latencyMs) / n,
        avgConfidence:
          (existing.avgConfidence * existing.queryCount + confidence) / n,
        avgHitCount:
          (existing.avgHitCount * existing.queryCount + hitCount) / n,
        lowConfidenceCount:
          existing.lowConfidenceCount + (lowConfidence ? 1 : 0),
      },
    });
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
