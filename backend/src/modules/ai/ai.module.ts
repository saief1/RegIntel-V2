import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiController } from './ai.controller';
import { EmbeddingsController } from './embeddings.controller';
import { EmbeddingsService } from './embeddings/embeddings.service';
import { AiGatewayService } from './gateway/ai-gateway.service';
import { PromptManager } from './prompts/prompt.manager';
import { AI_PROVIDER } from './providers/ai-provider.types';
import { AnthropicProvider } from './providers/anthropic.provider';
import { AzureOpenAiProvider } from './providers/azure-openai.provider';
import { GeminiProvider } from './providers/gemini.provider';
import { MockAiProvider } from './providers/mock.provider';
import { OpenAiProvider } from './providers/openai.provider';
import { JsonFallbackVectorStore } from './vector/json-fallback.store';
import { PgVectorStore } from './vector/pgvector.store';
import { PineconeVectorStore } from './vector/pinecone.store';
import { QdrantVectorStore } from './vector/qdrant.store';
import { VECTOR_STORE } from './vector/vector.types';

@Module({
  controllers: [AiController, EmbeddingsController],
  providers: [
    MockAiProvider,
    OpenAiProvider,
    AzureOpenAiProvider,
    AnthropicProvider,
    GeminiProvider,
    JsonFallbackVectorStore,
    PgVectorStore,
    PineconeVectorStore,
    QdrantVectorStore,
    {
      provide: AI_PROVIDER,
      inject: [
        ConfigService,
        MockAiProvider,
        OpenAiProvider,
        AzureOpenAiProvider,
        AnthropicProvider,
        GeminiProvider,
      ],
      useFactory: (
        config: ConfigService,
        mock: MockAiProvider,
        openai: OpenAiProvider,
        azure: AzureOpenAiProvider,
        anthropic: AnthropicProvider,
        gemini: GeminiProvider,
      ) => {
        const useReal = config.get<boolean>('featureFlags.useRealAi') === true;
        const name = (
          config.get<string>('ai.provider') ?? (useReal ? 'openai' : 'mock')
        ).toLowerCase();
        if (!useReal || name === 'mock') return mock;
        switch (name) {
          case 'openai':
            return openai;
          case 'azure_openai':
          case 'azure-openai':
            return azure;
          case 'anthropic':
            return anthropic;
          case 'gemini':
          case 'google':
            return gemini;
          default:
            return mock;
        }
      },
    },
    {
      provide: VECTOR_STORE,
      inject: [
        ConfigService,
        PgVectorStore,
        JsonFallbackVectorStore,
        PineconeVectorStore,
        QdrantVectorStore,
      ],
      useFactory: (
        config: ConfigService,
        pg: PgVectorStore,
        json: JsonFallbackVectorStore,
        pinecone: PineconeVectorStore,
        qdrant: QdrantVectorStore,
      ) => {
        const name = (
          config.get<string>('ai.vectorStore') ?? 'pgvector'
        ).toLowerCase();
        switch (name) {
          case 'json':
            return json;
          case 'pinecone':
            return pinecone;
          case 'qdrant':
            return qdrant;
          case 'pgvector':
          default:
            return pg;
        }
      },
    },
    PromptManager,
    EmbeddingsService,
    AiGatewayService,
  ],
  exports: [AiGatewayService, EmbeddingsService, PromptManager, AI_PROVIDER],
})
export class AiModule {}
