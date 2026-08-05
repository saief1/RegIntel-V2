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
export class AzureOpenAiProvider implements AIProvider {
  readonly name = 'azure_openai' as const;
  readonly supportsStreaming = true;
  readonly supportsFunctionCalling = true;
  readonly supportsEmbeddings = true;

  constructor(private readonly config: ConfigService) {}

  private configured(): boolean {
    return Boolean(
      this.config.get<string>('ai.azureOpenAiApiKey') &&
      this.config.get<string>('ai.azureOpenAiEndpoint'),
    );
  }

  chat(_request: ChatCompletionRequest): Promise<ChatCompletionResult> {
    return Promise.reject(
      new Error(
        'Azure OpenAI provider requires AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT',
      ),
    );
  }

  embed(_request: EmbeddingRequest): Promise<EmbeddingResult> {
    return Promise.reject(
      new Error(
        'Azure OpenAI provider requires AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT',
      ),
    );
  }

  healthCheck(): Promise<ProviderHealth> {
    return Promise.resolve({
      status: this.configured() ? 'up' : 'unconfigured',
      provider: this.name,
      supportsStreaming: this.supportsStreaming,
      supportsFunctionCalling: this.supportsFunctionCalling,
      supportsEmbeddings: this.supportsEmbeddings,
      detail: this.configured()
        ? 'Configured (chat/embed wired in later milestone if needed)'
        : 'AZURE_OPENAI_API_KEY / AZURE_OPENAI_ENDPOINT not set',
    });
  }
}
