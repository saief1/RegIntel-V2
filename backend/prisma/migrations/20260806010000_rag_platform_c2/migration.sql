-- Milestone C2 RAG Platform (C006–C010)

-- AlterEnum EmbeddingEntityType
ALTER TYPE "EmbeddingEntityType" ADD VALUE IF NOT EXISTS 'CONTROL';
ALTER TYPE "EmbeddingEntityType" ADD VALUE IF NOT EXISTS 'PROCEDURE';
ALTER TYPE "EmbeddingEntityType" ADD VALUE IF NOT EXISTS 'GUIDANCE';
ALTER TYPE "EmbeddingEntityType" ADD VALUE IF NOT EXISTS 'REPORT';
ALTER TYPE "EmbeddingEntityType" ADD VALUE IF NOT EXISTS 'EVIDENCE';
ALTER TYPE "EmbeddingEntityType" ADD VALUE IF NOT EXISTS 'CASE';
ALTER TYPE "EmbeddingEntityType" ADD VALUE IF NOT EXISTS 'UPLOADED_DOCUMENT';

-- AlterEnum AiUsageKind
ALTER TYPE "AiUsageKind" ADD VALUE IF NOT EXISTS 'RAG';
ALTER TYPE "AiUsageKind" ADD VALUE IF NOT EXISTS 'RETRIEVAL';
ALTER TYPE "AiUsageKind" ADD VALUE IF NOT EXISTS 'INDEX';

-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "IndexingJobStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "IndexingJobKind" AS ENUM ('INDEX', 'REINDEX', 'DELETE', 'INCREMENTAL');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "KnowledgeRelationType" AS ENUM ('RELATED', 'IMPLEMENTS', 'REFERENCES', 'SUPERSEDES', 'SUPPORTS', 'DERIVED_FROM');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- AlterTable embedding_documents
ALTER TABLE "embedding_documents" ADD COLUMN IF NOT EXISTS "workspace_id" TEXT;
ALTER TABLE "embedding_documents" ADD COLUMN IF NOT EXISTS "content_version" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "embedding_documents" ADD COLUMN IF NOT EXISTS "source_version" TEXT;

CREATE INDEX IF NOT EXISTS "embedding_documents_organization_id_workspace_id_idx"
  ON "embedding_documents"("organization_id", "workspace_id");

-- CreateTable embedding_document_versions
CREATE TABLE IF NOT EXISTS "embedding_document_versions" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "document_id" UUID NOT NULL,
    "content_version" INTEGER NOT NULL,
    "content_hash" TEXT NOT NULL,
    "source_version" TEXT,
    "title" TEXT NOT NULL DEFAULT '',
    "chunk_count" INTEGER NOT NULL DEFAULT 0,
    "chunks_snapshot" JSONB,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "embedding_document_versions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "embedding_document_versions_document_id_content_version_key"
  ON "embedding_document_versions"("document_id", "content_version");
CREATE INDEX IF NOT EXISTS "embedding_document_versions_organization_id_document_id_idx"
  ON "embedding_document_versions"("organization_id", "document_id");

-- CreateTable indexing_jobs
CREATE TABLE IF NOT EXISTS "indexing_jobs" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "kind" "IndexingJobKind" NOT NULL DEFAULT 'INDEX',
    "status" "IndexingJobStatus" NOT NULL DEFAULT 'PENDING',
    "entity_type" "EmbeddingEntityType",
    "entity_id" TEXT,
    "namespace" TEXT NOT NULL DEFAULT 'default',
    "workspace_id" TEXT,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,
    "metadata" JSONB,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "indexing_jobs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "indexing_jobs_organization_id_status_created_at_idx"
  ON "indexing_jobs"("organization_id", "status", "created_at");
CREATE INDEX IF NOT EXISTS "indexing_jobs_organization_id_kind_idx"
  ON "indexing_jobs"("organization_id", "kind");

-- CreateTable search_sessions
CREATE TABLE IF NOT EXISTS "search_sessions" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "user_id" UUID,
    "workspace_id" TEXT,
    "title" TEXT NOT NULL DEFAULT 'Search session',
    "mode" TEXT NOT NULL DEFAULT 'research',
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "search_sessions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "search_sessions_organization_id_user_id_updated_at_idx"
  ON "search_sessions"("organization_id", "user_id", "updated_at");

-- CreateTable rag_queries
CREATE TABLE IF NOT EXISTS "rag_queries" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "user_id" UUID,
    "session_id" UUID,
    "conversation_id" UUID,
    "question" TEXT NOT NULL,
    "mode" TEXT NOT NULL DEFAULT 'chat',
    "workspace_id" TEXT,
    "filters" JSONB,
    "top_k" INTEGER NOT NULL DEFAULT 8,
    "similarity_threshold" DOUBLE PRECISION NOT NULL DEFAULT 0.15,
    "confidence" DOUBLE PRECISION,
    "latency_ms" INTEGER,
    "chunk_count" INTEGER NOT NULL DEFAULT 0,
    "token_usage" JSONB,
    "answer" TEXT,
    "reasoning_summary" TEXT,
    "low_confidence" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rag_queries_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "rag_queries_organization_id_created_at_idx"
  ON "rag_queries"("organization_id", "created_at");
CREATE INDEX IF NOT EXISTS "rag_queries_organization_id_user_id_created_at_idx"
  ON "rag_queries"("organization_id", "user_id", "created_at");
CREATE INDEX IF NOT EXISTS "rag_queries_session_id_idx" ON "rag_queries"("session_id");

-- CreateTable rag_results
CREATE TABLE IF NOT EXISTS "rag_results" (
    "id" UUID NOT NULL,
    "query_id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "chunk_id" UUID,
    "entity_type" "EmbeddingEntityType" NOT NULL,
    "entity_id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "content_preview" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "rank" INTEGER NOT NULL,
    "content_version" INTEGER,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rag_results_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "rag_results_query_id_rank_idx" ON "rag_results"("query_id", "rank");
CREATE INDEX IF NOT EXISTS "rag_results_organization_id_entity_type_idx"
  ON "rag_results"("organization_id", "entity_type");

-- CreateTable retrieval_logs
CREATE TABLE IF NOT EXISTS "retrieval_logs" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "query_id" UUID,
    "operation" TEXT NOT NULL,
    "use_vector" BOOLEAN NOT NULL DEFAULT false,
    "use_hybrid" BOOLEAN NOT NULL DEFAULT true,
    "top_k" INTEGER NOT NULL DEFAULT 8,
    "hit_count" INTEGER NOT NULL DEFAULT 0,
    "latency_ms" INTEGER,
    "filters" JSONB,
    "scores" JSONB,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "retrieval_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "retrieval_logs_organization_id_created_at_idx"
  ON "retrieval_logs"("organization_id", "created_at");
CREATE INDEX IF NOT EXISTS "retrieval_logs_query_id_idx" ON "retrieval_logs"("query_id");

-- CreateTable citations
CREATE TABLE IF NOT EXISTS "citations" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "query_id" UUID,
    "user_id" UUID,
    "message_id" UUID,
    "marker" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "href" TEXT,
    "snippet" TEXT,
    "entity_type" "EmbeddingEntityType",
    "entity_id" TEXT,
    "chunk_id" UUID,
    "chunk_index" INTEGER,
    "highlight_start" INTEGER,
    "highlight_end" INTEGER,
    "content_version" INTEGER,
    "score" DOUBLE PRECISION,
    "confidence" DOUBLE PRECISION,
    "evidence_chain" JSONB,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "citations_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "citations_organization_id_created_at_idx"
  ON "citations"("organization_id", "created_at");
CREATE INDEX IF NOT EXISTS "citations_query_id_idx" ON "citations"("query_id");
CREATE INDEX IF NOT EXISTS "citations_message_id_idx" ON "citations"("message_id");

-- CreateTable knowledge_relationships
CREATE TABLE IF NOT EXISTS "knowledge_relationships" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "from_entity_type" "EmbeddingEntityType" NOT NULL,
    "from_entity_id" TEXT NOT NULL,
    "to_entity_type" "EmbeddingEntityType" NOT NULL,
    "to_entity_id" TEXT NOT NULL,
    "relation_type" "KnowledgeRelationType" NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_relationships_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "knowledge_relationships_org_from_to_rel_key"
  ON "knowledge_relationships"("organization_id", "from_entity_type", "from_entity_id", "to_entity_type", "to_entity_id", "relation_type");
CREATE INDEX IF NOT EXISTS "knowledge_relationships_from_idx"
  ON "knowledge_relationships"("organization_id", "from_entity_type", "from_entity_id");
CREATE INDEX IF NOT EXISTS "knowledge_relationships_to_idx"
  ON "knowledge_relationships"("organization_id", "to_entity_type", "to_entity_id");

-- CreateTable retrieval_metrics
CREATE TABLE IF NOT EXISTS "retrieval_metrics" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "query_count" INTEGER NOT NULL DEFAULT 0,
    "avg_latency_ms" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avg_confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avg_hit_count" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "low_confidence_count" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "retrieval_metrics_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "retrieval_metrics_organization_id_period_start_period_end_key"
  ON "retrieval_metrics"("organization_id", "period_start", "period_end");
CREATE INDEX IF NOT EXISTS "retrieval_metrics_organization_id_period_start_idx"
  ON "retrieval_metrics"("organization_id", "period_start");

-- Foreign keys
DO $$ BEGIN
  ALTER TABLE "embedding_document_versions" ADD CONSTRAINT "embedding_document_versions_organization_id_fkey"
    FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "embedding_document_versions" ADD CONSTRAINT "embedding_document_versions_document_id_fkey"
    FOREIGN KEY ("document_id") REFERENCES "embedding_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "indexing_jobs" ADD CONSTRAINT "indexing_jobs_organization_id_fkey"
    FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "search_sessions" ADD CONSTRAINT "search_sessions_organization_id_fkey"
    FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "search_sessions" ADD CONSTRAINT "search_sessions_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "rag_queries" ADD CONSTRAINT "rag_queries_organization_id_fkey"
    FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "rag_queries" ADD CONSTRAINT "rag_queries_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "rag_queries" ADD CONSTRAINT "rag_queries_session_id_fkey"
    FOREIGN KEY ("session_id") REFERENCES "search_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "rag_results" ADD CONSTRAINT "rag_results_query_id_fkey"
    FOREIGN KEY ("query_id") REFERENCES "rag_queries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "retrieval_logs" ADD CONSTRAINT "retrieval_logs_organization_id_fkey"
    FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "retrieval_logs" ADD CONSTRAINT "retrieval_logs_query_id_fkey"
    FOREIGN KEY ("query_id") REFERENCES "rag_queries"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "citations" ADD CONSTRAINT "citations_organization_id_fkey"
    FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "citations" ADD CONSTRAINT "citations_query_id_fkey"
    FOREIGN KEY ("query_id") REFERENCES "rag_queries"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "citations" ADD CONSTRAINT "citations_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "knowledge_relationships" ADD CONSTRAINT "knowledge_relationships_organization_id_fkey"
    FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "retrieval_metrics" ADD CONSTRAINT "retrieval_metrics_organization_id_fkey"
    FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
