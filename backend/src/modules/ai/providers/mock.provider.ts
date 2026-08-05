import { Injectable } from '@nestjs/common';
import {
  AIProvider,
  ChatCompletionRequest,
  ChatCompletionResult,
  EmbeddingRequest,
  EmbeddingResult,
  ProviderHealth,
  estimateCostUsd,
  estimateTokenCount,
} from './ai-provider.types';

const MOCK_DIM = 64;

function hashToUnit(seed: string, i: number): number {
  let h = 2166136261;
  const s = `${seed}:${i}`;
  for (let j = 0; j < s.length; j += 1) {
    h ^= s.charCodeAt(j);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000 - 0.5;
}

function mockEmbedding(text: string, dimensions = MOCK_DIM): number[] {
  const vec = Array.from({ length: dimensions }, (_, i) =>
    hashToUnit(text.slice(0, 64), i),
  );
  const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0)) || 1;
  return vec.map((v) => v / norm);
}

@Injectable()
export class MockAiProvider implements AIProvider {
  readonly name = 'mock' as const;
  readonly supportsStreaming = true;
  readonly supportsFunctionCalling = true;
  readonly supportsEmbeddings = true;

  chat(request: ChatCompletionRequest): Promise<ChatCompletionResult> {
    const started = Date.now();
    const lastUser = [...request.messages]
      .reverse()
      .find((m) => m.role === 'user');
    const prompt = lastUser?.content?.trim() || 'Hello';
    const content = [
      `RegIntel mock assistant response.`,
      ``,
      `You asked: "${prompt.slice(0, 280)}"`,
      ``,
      `This path runs without API keys (USE_REAL_AI=false or AI_PROVIDER=mock).`,
      `Recommended next steps: review related policies, confirm evidence gaps, and create a follow-up task if needed.`,
    ].join('\n');

    const promptTokens = request.messages.reduce(
      (sum, m) => sum + estimateTokenCount(m.content),
      0,
    );
    const completionTokens = estimateTokenCount(content);
    const usage = {
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
    };
    const model = request.model ?? 'mock-chat';
    return Promise.resolve({
      content,
      model,
      provider: this.name,
      usage,
      latencyMs: Date.now() - started,
      costUsd: estimateCostUsd(model, usage),
      finishReason: 'stop',
    });
  }

  embed(request: EmbeddingRequest): Promise<EmbeddingResult> {
    const started = Date.now();
    const model = request.model ?? 'mock-embed';
    const embeddings = request.texts.map((t) => mockEmbedding(t, MOCK_DIM));
    const promptTokens = request.texts.reduce(
      (sum, t) => sum + estimateTokenCount(t),
      0,
    );
    const usage = {
      promptTokens,
      completionTokens: 0,
      totalTokens: promptTokens,
    };
    return Promise.resolve({
      embeddings,
      model,
      provider: this.name,
      usage,
      latencyMs: Date.now() - started,
      costUsd: 0,
      dimensions: MOCK_DIM,
    });
  }

  healthCheck(): Promise<ProviderHealth> {
    return Promise.resolve({
      status: 'up',
      provider: this.name,
      supportsStreaming: this.supportsStreaming,
      supportsFunctionCalling: this.supportsFunctionCalling,
      supportsEmbeddings: this.supportsEmbeddings,
      detail: 'Mock provider always available',
    });
  }
}
