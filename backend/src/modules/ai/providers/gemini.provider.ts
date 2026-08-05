import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AIProvider,
  ChatCompletionRequest,
  ChatCompletionResult,
  EmbeddingRequest,
  EmbeddingResult,
  ProviderHealth,
} from './ai-provider.types';

@Injectable()
export class GeminiProvider implements AIProvider {
  readonly name = 'gemini' as const;
  readonly supportsStreaming = true;
  readonly supportsFunctionCalling = true;
  readonly supportsEmbeddings = true;

  constructor(private readonly config: ConfigService) {}

  private configured(): boolean {
    return Boolean(this.config.get<string>('ai.geminiApiKey'));
  }

  chat(_request: ChatCompletionRequest): Promise<ChatCompletionResult> {
    return Promise.reject(
      new Error(
        'Gemini provider requires GOOGLE_GEMINI_API_KEY (interface ready; use mock/openai for C1)',
      ),
    );
  }

  embed(_request: EmbeddingRequest): Promise<EmbeddingResult> {
    return Promise.reject(
      new Error(
        'Gemini embeddings require GOOGLE_GEMINI_API_KEY (interface ready; use mock/openai for C1)',
      ),
    );
  }

  healthCheck(): Promise<ProviderHealth> {
    return Promise.resolve({
      status: this.configured() ? 'degraded' : 'unconfigured',
      provider: this.name,
      supportsStreaming: this.supportsStreaming,
      supportsFunctionCalling: this.supportsFunctionCalling,
      supportsEmbeddings: this.supportsEmbeddings,
      detail: this.configured()
        ? 'Key present; full Gemini path deferred — use openai/mock'
        : 'GOOGLE_GEMINI_API_KEY not set',
    });
  }
}
