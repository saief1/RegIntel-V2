import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { citationKindForEntity, ENTITY_HREF } from '../indexing/indexing.types';
import type { RetrievalHit } from '../retrieval/retrieval.service';

export type CreateCitationsInput = {
  organizationId: string;
  userId?: string;
  queryId: string;
  messageId?: string;
  hits: RetrievalHit[];
  confidence: number;
};

/**
 * C009 — Citation & Explainability
 */
@Injectable()
export class CitationsService {
  constructor(private readonly prisma: PrismaService) {}

  async createFromHits(input: CreateCitationsInput) {
    const rows = input.hits.map((h, i) => {
      const marker = `[${i + 1}]`;
      const kind = citationKindForEntity(h.entityType);
      const href = ENTITY_HREF[h.entityType]?.(h.entityId) ?? null;
      const highlightEnd = Math.min(h.content.length, 180);
      return {
        organizationId: input.organizationId,
        queryId: input.queryId,
        userId: input.userId,
        messageId: input.messageId,
        marker,
        kind,
        title: h.title || `${h.entityType} ${h.entityId.slice(0, 8)}`,
        subtitle: `${h.entityType} · chunk ${h.chunkIndex}${
          h.contentVersion ? ` · v${h.contentVersion}` : ''
        }`,
        href,
        snippet: h.content.slice(0, 240),
        entityType: h.entityType,
        entityId: h.entityId,
        chunkId: h.chunkId,
        chunkIndex: h.chunkIndex,
        highlightStart: 0,
        highlightEnd,
        contentVersion: h.contentVersion,
        score: h.score,
        confidence: input.confidence,
        evidenceChain: [
          {
            step: 'retrieve',
            chunkId: h.chunkId,
            score: h.score,
            vectorScore: h.vectorScore,
            keywordScore: h.keywordScore,
          },
          {
            step: 'rank',
            rank: i + 1,
            freshnessScore: h.freshnessScore,
          },
        ] as Prisma.InputJsonValue,
        metadata: {
          ...(h.metadata ?? {}),
          inlineMarker: marker,
        },
      };
    });

    if (!rows.length) return [];

    await this.prisma.citation.createMany({ data: rows });
    return this.prisma.citation.findMany({
      where: { queryId: input.queryId },
      orderBy: { marker: 'asc' },
    });
  }

  async listForQuery(organizationId: string, queryId: string) {
    const query = await this.prisma.ragQuery.findFirst({
      where: { id: queryId, organizationId },
    });
    if (!query) throw new NotFoundException('RAG query not found');
    return this.prisma.citation.findMany({
      where: { organizationId, queryId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getSourceCard(organizationId: string, citationId: string) {
    const citation = await this.prisma.citation.findFirst({
      where: { id: citationId, organizationId },
    });
    if (!citation) throw new NotFoundException('Citation not found');

    let preview: string | null = citation.snippet;
    if (citation.chunkId) {
      const chunk = await this.prisma.embeddingChunk.findFirst({
        where: { id: citation.chunkId, organizationId },
        include: { document: true },
      });
      if (chunk) {
        preview = chunk.content;
        return {
          citation,
          source: {
            title: chunk.document.title || citation.title,
            entityType: chunk.entityType,
            entityId: chunk.entityId,
            contentVersion: chunk.document.contentVersion,
            sourceVersion: chunk.document.sourceVersion,
            preview,
            highlight: {
              start: citation.highlightStart ?? 0,
              end: citation.highlightEnd ?? Math.min(180, preview.length),
            },
            href: citation.href,
            confidence: citation.confidence,
            score: citation.score,
            evidenceChain: citation.evidenceChain,
          },
        };
      }
    }

    return {
      citation,
      source: {
        title: citation.title,
        entityType: citation.entityType,
        entityId: citation.entityId,
        contentVersion: citation.contentVersion,
        preview,
        highlight: {
          start: citation.highlightStart ?? 0,
          end: citation.highlightEnd ?? 0,
        },
        href: citation.href,
        confidence: citation.confidence,
        score: citation.score,
        evidenceChain: citation.evidenceChain,
      },
    };
  }

  async exportCitations(organizationId: string, queryId: string) {
    const query = await this.prisma.ragQuery.findFirst({
      where: { id: queryId, organizationId },
      include: {
        citations: { orderBy: { marker: 'asc' } },
        results: { orderBy: { rank: 'asc' } },
      },
    });
    if (!query) throw new NotFoundException('RAG query not found');

    // Lightweight audit trail entry via provider log table is handled by callers;
    // persist export metadata on the query.
    await this.prisma.ragQuery.update({
      where: { id: queryId },
      data: {
        metadata: {
          ...((query.metadata as Record<string, unknown>) ?? {}),
          lastCitationExportAt: new Date().toISOString(),
        },
      },
    });

    return {
      queryId: query.id,
      question: query.question,
      confidence: query.confidence,
      reasoningSummary: query.reasoningSummary,
      exportedAt: new Date().toISOString(),
      citations: query.citations.map((c) => ({
        id: c.id,
        marker: c.marker,
        kind: c.kind,
        title: c.title,
        subtitle: c.subtitle,
        href: c.href,
        snippet: c.snippet,
        entityType: c.entityType,
        entityId: c.entityId,
        contentVersion: c.contentVersion,
        score: c.score,
        confidence: c.confidence,
        evidenceChain: c.evidenceChain,
        highlight: {
          start: c.highlightStart,
          end: c.highlightEnd,
          chunkIndex: c.chunkIndex,
        },
      })),
      results: query.results,
    };
  }

  /** Map DB citations to AI Workspace frontend shape. */
  toWorkspaceCitations(
    citations: Array<{
      id: string;
      kind: string;
      title: string;
      subtitle: string | null;
      href: string | null;
      snippet: string | null;
    }>,
  ) {
    return citations.map((c) => ({
      id: c.id,
      kind: (['regulation', 'document', 'evidence', 'case'].includes(c.kind)
        ? c.kind
        : 'document') as 'regulation' | 'document' | 'evidence' | 'case',
      title: c.title,
      subtitle: c.subtitle ?? undefined,
      href: c.href ?? '#',
      snippet: c.snippet ?? undefined,
    }));
  }
}
