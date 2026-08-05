import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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

@Injectable()
export class OpenAiProvider implements AIProvider {
  readonly name = 'openai' as const;
  readonly supportsStreaming = true;
  readonly supportsFunctionCalling = true;
  readonly supportsEmbeddings = true;

  constructor(private readonly config: ConfigService) {}

  private apiKey(): string {
    return this.config.get<string>('ai.openaiApiKey') ?? '';
  }

  private baseUrl(): string {
    return (
      this.config.get<string>('ai.openaiBaseUrl') ?? 'https://api.openai.com/v1'
    );
  }

  async chat(request: ChatCompletionRequest): Promise<ChatCompletionResult> {
    const key = this.apiKey();
    if (!key) {
      throw new Error('OpenAI provider is not configured (set OPENAI_API_KEY)');
    }
    const started = Date.now();
    const model =
      request.model ?? this.config.get<string>('ai.chatModel') ?? 'gpt-4o-mini';
    const timeoutMs = this.config.get<number>('ai.timeoutMs') ?? 30000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const body: Record<string, unknown> = {
        model,
        messages: request.messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        temperature: request.temperature ?? 0.2,
        max_tokens: request.maxTokens ?? 1024,
      };
      if (request.functions?.length) {
        body.tools = request.functions.map((fn) => ({
          type: 'function',
          function: fn,
        }));
      }
      const res = await fetch(`${this.baseUrl()}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`OpenAI chat failed (${res.status}): ${text}`);
      }
      const json = (await res.json()) as {
        choices?: Array<{
          message?: {
            content?: string;
            tool_calls?: Array<{
              function?: { name?: string; arguments?: string };
            }>;
          };
          finish_reason?: string;
        }>;
        usage?: {
          prompt_tokens?: number;
          completion_tokens?: number;
          total_tokens?: number;
        };
      };
      const choice = json.choices?.[0];
      const content = choice?.message?.content ?? '';
      const tool = choice?.message?.tool_calls?.[0]?.function;
      const usage = {
        promptTokens: json.usage?.prompt_tokens ?? estimateTokenCount(content),
        completionTokens:
          json.usage?.completion_tokens ?? estimateTokenCount(content),
        totalTokens: json.usage?.total_tokens ?? 0,
      };
      usage.totalTokens =
        usage.totalTokens || usage.promptTokens + usage.completionTokens;
      return {
        content,
        model,
        provider: this.name,
        usage,
        latencyMs: Date.now() - started,
        costUsd: estimateCostUsd(model, usage),
        finishReason: choice?.finish_reason,
        functionCall: tool?.name
          ? { name: tool.name, arguments: tool.arguments ?? '{}' }
          : undefined,
        raw: json,
      };
    } finally {
      clearTimeout(timer);
    }
  }

  async embed(request: EmbeddingRequest): Promise<EmbeddingResult> {
    const key = this.apiKey();
    if (!key) {
      throw new Error('OpenAI provider is not configured (set OPENAI_API_KEY)');
    }
    const started = Date.now();
    const model =
      request.model ??
      this.config.get<string>('ai.embeddingModel') ??
      'text-embedding-3-small';
    const timeoutMs = this.config.get<number>('ai.timeoutMs') ?? 30000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(`${this.baseUrl()}/embeddings`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model, input: request.texts }),
        signal: controller.signal,
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`OpenAI embeddings failed (${res.status}): ${text}`);
      }
      const json = (await res.json()) as {
        data?: Array<{ embedding: number[] }>;
        usage?: { prompt_tokens?: number; total_tokens?: number };
      };
      const embeddings = (json.data ?? []).map((d) => d.embedding);
      const usage = {
        promptTokens: json.usage?.prompt_tokens ?? 0,
        completionTokens: 0,
        totalTokens: json.usage?.total_tokens ?? json.usage?.prompt_tokens ?? 0,
      };
      return {
        embeddings,
        model,
        provider: this.name,
        usage,
        latencyMs: Date.now() - started,
        costUsd: estimateCostUsd(model, usage),
        dimensions: embeddings[0]?.length ?? 0,
      };
    } finally {
      clearTimeout(timer);
    }
  }

  healthCheck(): Promise<ProviderHealth> {
    if (!this.apiKey()) {
      return Promise.resolve({
        status: 'unconfigured',
        provider: this.name,
        supportsStreaming: this.supportsStreaming,
        supportsFunctionCalling: this.supportsFunctionCalling,
        supportsEmbeddings: this.supportsEmbeddings,
        detail: 'OPENAI_API_KEY not set',
      });
    }
    return Promise.resolve({
      status: 'up',
      provider: this.name,
      supportsStreaming: this.supportsStreaming,
      supportsFunctionCalling: this.supportsFunctionCalling,
      supportsEmbeddings: this.supportsEmbeddings,
    });
  }
}
