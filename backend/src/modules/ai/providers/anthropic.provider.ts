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
export class AnthropicProvider implements AIProvider {
  readonly name = 'anthropic' as const;
  readonly supportsStreaming = true;
  readonly supportsFunctionCalling = true;
  readonly supportsEmbeddings = false;

  constructor(private readonly config: ConfigService) {}

  private configured(): boolean {
    return Boolean(this.config.get<string>('ai.anthropicApiKey'));
  }

  chat(_request: ChatCompletionRequest): Promise<ChatCompletionResult> {
    return Promise.reject(
      new Error(
        'Anthropic provider requires ANTHROPIC_API_KEY (interface ready; use mock/openai for C1)',
      ),
    );
  }

  embed(_request: EmbeddingRequest): Promise<EmbeddingResult> {
    return Promise.reject(
      new Error(
        'Anthropic provider does not support embeddings in this milestone',
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
        ? 'Key present; full Anthropic chat path deferred — use openai/mock'
        : 'ANTHROPIC_API_KEY not set',
    });
  }
}
