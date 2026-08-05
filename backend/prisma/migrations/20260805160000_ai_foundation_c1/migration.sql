-- Milestone C1 AI foundation (C001–C005)
-- Optional pgvector: enable when the extension is available; JSON embeddings remain canonical.
DO $$ BEGIN
  CREATE EXTENSION IF NOT EXISTS vector;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pgvector extension unavailable; JSON embedding fallback will be used';
END $$;

-- CreateEnum
CREATE TYPE "AiProviderName" AS ENUM ('MOCK', 'OPENAI', 'AZURE_OPENAI', 'ANTHROPIC', 'GEMINI');
CREATE TYPE "AiMessageRole" AS ENUM ('SYSTEM', 'USER', 'ASSISTANT', 'TOOL');
CREATE TYPE "EmbeddingEntityType" AS ENUM ('DOCUMENT', 'POLICY', 'REGULATION', 'TASK', 'CONVERSATION', 'MESSAGE');
CREATE TYPE "PromptKind" AS ENUM ('SYSTEM', 'WORKSPACE', 'ROLE', 'AGENT', 'POLICY', 'REPORT');
CREATE TYPE "AiUsageKind" AS ENUM ('CHAT', 'EMBEDDING', 'REBUILD', 'SEARCH');

-- CreateTable
CREATE TABLE "ai_conversations" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'New conversation',
    "mode" TEXT NOT NULL DEFAULT 'chat',
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "is_favorite" BOOLEAN NOT NULL DEFAULT false,
    "is_saved" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_conversations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ai_messages" (
    "id" UUID NOT NULL,
    "conversation_id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "user_id" UUID,
    "role" "AiMessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "token_count" INTEGER,
    "model" TEXT,
    "provider" "AiProviderName",
    "latency_ms" INTEGER,
    "cost_usd" DECIMAL(12,6),
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_messages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ai_prompts" (
    "id" UUID NOT NULL,
    "organization_id" UUID,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "PromptKind" NOT NULL DEFAULT 'WORKSPACE',
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "current_version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_prompts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ai_prompt_versions" (
    "id" UUID NOT NULL,
    "prompt_id" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "template" TEXT NOT NULL,
    "variables" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "changelog" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_prompt_versions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "embedding_documents" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "entity_type" "EmbeddingEntityType" NOT NULL,
    "entity_id" TEXT NOT NULL,
    "namespace" TEXT NOT NULL DEFAULT 'default',
    "title" TEXT NOT NULL DEFAULT '',
    "content_hash" TEXT NOT NULL,
    "metadata" JSONB,
    "chunk_count" INTEGER NOT NULL DEFAULT 0,
    "indexed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "embedding_documents_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "embedding_chunks" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "document_id" UUID NOT NULL,
    "entity_type" "EmbeddingEntityType" NOT NULL,
    "entity_id" TEXT NOT NULL,
    "namespace" TEXT NOT NULL DEFAULT 'default',
    "chunk_index" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" JSONB,
    "token_count" INTEGER,
    "metadata" JSONB,
    "content_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "embedding_chunks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "vector_metadata" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "namespace" TEXT NOT NULL DEFAULT 'default',
    "store_provider" TEXT NOT NULL DEFAULT 'pgvector',
    "dimensions" INTEGER NOT NULL DEFAULT 1536,
    "chunk_count" INTEGER NOT NULL DEFAULT 0,
    "last_reindex_at" TIMESTAMP(3),
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vector_metadata_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ai_usage" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "user_id" UUID,
    "kind" "AiUsageKind" NOT NULL DEFAULT 'CHAT',
    "provider" "AiProviderName" NOT NULL,
    "model" TEXT NOT NULL,
    "prompt_tokens" INTEGER NOT NULL DEFAULT 0,
    "completion_tokens" INTEGER NOT NULL DEFAULT 0,
    "total_tokens" INTEGER NOT NULL DEFAULT 0,
    "latency_ms" INTEGER,
    "conversation_id" UUID,
    "request_id" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_usage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ai_costs" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "usage_id" UUID,
    "provider" "AiProviderName" NOT NULL,
    "model" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "amount_usd" DECIMAL(12,6) NOT NULL,
    "prompt_tokens" INTEGER NOT NULL DEFAULT 0,
    "completion_tokens" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_costs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ai_provider_logs" (
    "id" UUID NOT NULL,
    "organization_id" UUID,
    "user_id" UUID,
    "provider" "AiProviderName" NOT NULL,
    "operation" TEXT NOT NULL,
    "model" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "status_code" INTEGER,
    "latency_ms" INTEGER,
    "error_message" TEXT,
    "prompt_key" TEXT,
    "prompt_version" INTEGER,
    "request_id" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_provider_logs_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX "ai_conversations_organization_id_user_id_updated_at_idx" ON "ai_conversations"("organization_id", "user_id", "updated_at");
CREATE INDEX "ai_conversations_organization_id_deleted_at_idx" ON "ai_conversations"("organization_id", "deleted_at");
CREATE INDEX "ai_messages_conversation_id_created_at_idx" ON "ai_messages"("conversation_id", "created_at");
CREATE INDEX "ai_messages_organization_id_created_at_idx" ON "ai_messages"("organization_id", "created_at");
CREATE UNIQUE INDEX "ai_prompts_organization_id_key_key" ON "ai_prompts"("organization_id", "key");
CREATE INDEX "ai_prompts_kind_active_idx" ON "ai_prompts"("kind", "active");
CREATE UNIQUE INDEX "ai_prompt_versions_prompt_id_version_key" ON "ai_prompt_versions"("prompt_id", "version");
CREATE UNIQUE INDEX "embedding_documents_organization_id_namespace_entity_type_entity_id_key" ON "embedding_documents"("organization_id", "namespace", "entity_type", "entity_id");
CREATE INDEX "embedding_documents_organization_id_namespace_entity_type_idx" ON "embedding_documents"("organization_id", "namespace", "entity_type");
CREATE UNIQUE INDEX "embedding_chunks_document_id_chunk_index_key" ON "embedding_chunks"("document_id", "chunk_index");
CREATE INDEX "embedding_chunks_organization_id_namespace_entity_type_idx" ON "embedding_chunks"("organization_id", "namespace", "entity_type");
CREATE INDEX "embedding_chunks_organization_id_entity_id_idx" ON "embedding_chunks"("organization_id", "entity_id");
CREATE UNIQUE INDEX "vector_metadata_organization_id_namespace_key" ON "vector_metadata"("organization_id", "namespace");
CREATE INDEX "ai_usage_organization_id_created_at_idx" ON "ai_usage"("organization_id", "created_at");
CREATE INDEX "ai_usage_organization_id_provider_created_at_idx" ON "ai_usage"("organization_id", "provider", "created_at");
CREATE INDEX "ai_costs_organization_id_created_at_idx" ON "ai_costs"("organization_id", "created_at");
CREATE INDEX "ai_provider_logs_organization_id_created_at_idx" ON "ai_provider_logs"("organization_id", "created_at");
CREATE INDEX "ai_provider_logs_provider_created_at_idx" ON "ai_provider_logs"("provider", "created_at");

-- ForeignKeys
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ai_messages" ADD CONSTRAINT "ai_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "ai_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ai_messages" ADD CONSTRAINT "ai_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ai_prompts" ADD CONSTRAINT "ai_prompts_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ai_prompt_versions" ADD CONSTRAINT "ai_prompt_versions_prompt_id_fkey" FOREIGN KEY ("prompt_id") REFERENCES "ai_prompts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "embedding_documents" ADD CONSTRAINT "embedding_documents_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "embedding_chunks" ADD CONSTRAINT "embedding_chunks_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "embedding_chunks" ADD CONSTRAINT "embedding_chunks_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "embedding_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "vector_metadata" ADD CONSTRAINT "vector_metadata_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ai_usage" ADD CONSTRAINT "ai_usage_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ai_costs" ADD CONSTRAINT "ai_costs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ai_provider_logs" ADD CONSTRAINT "ai_provider_logs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ai_provider_logs" ADD CONSTRAINT "ai_provider_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
