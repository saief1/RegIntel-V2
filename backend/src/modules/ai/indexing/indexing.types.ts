import { EmbeddingEntityType, IndexingJobKind } from '@prisma/client';

export type IndexableEntityType = EmbeddingEntityType;

export type IndexDocumentInput = {
  organizationId: string;
  userId?: string;
  entityType: IndexableEntityType;
  entityId: string;
  title: string;
  content: string;
  namespace?: string;
  workspaceId?: string;
  sourceVersion?: string;
  metadata?: Record<string, unknown>;
  relationships?: Array<{
    toEntityType: IndexableEntityType;
    toEntityId: string;
    relationType:
      | 'RELATED'
      | 'IMPLEMENTS'
      | 'REFERENCES'
      | 'SUPERSEDES'
      | 'SUPPORTS'
      | 'DERIVED_FROM';
    weight?: number;
  }>;
  force?: boolean;
};

export type IndexJobRequest = {
  organizationId: string;
  kind: IndexingJobKind;
  namespace?: string;
  workspaceId?: string;
  entityType?: IndexableEntityType;
  entityId?: string;
  /** When true, re-index all domain entities for the org. */
  full?: boolean;
};

export type ParsedDocument = {
  title: string;
  content: string;
  metadata: Record<string, unknown>;
};

export const ENTITY_HREF: Record<string, (id: string) => string> = {
  DOCUMENT: (id) => `/knowledge/library/${id}`,
  POLICY: (id) => `/governance/policies/${id}`,
  REGULATION: (id) => `/knowledge/regulations/${id}`,
  TASK: (id) => `/work/tasks/${id}`,
  CASE: (id) => `/cases/${id}`,
  REPORT: (id) => `/reports/${id}`,
  CONTROL: (id) => `/knowledge/library/${id}`,
  PROCEDURE: (id) => `/knowledge/library/${id}`,
  GUIDANCE: (id) => `/knowledge/library/${id}`,
  EVIDENCE: (id) => `/cases/evidence/${id}`,
  UPLOADED_DOCUMENT: (id) => `/knowledge/library/${id}`,
  CONVERSATION: (id) => `/ai/conversations/${id}`,
  MESSAGE: (id) => `/ai/messages/${id}`,
};

export function citationKindForEntity(
  entityType: string,
): 'regulation' | 'document' | 'evidence' | 'case' {
  switch (entityType) {
    case 'REGULATION':
    case 'GUIDANCE':
      return 'regulation';
    case 'CASE':
      return 'case';
    case 'EVIDENCE':
      return 'evidence';
    default:
      return 'document';
  }
}
