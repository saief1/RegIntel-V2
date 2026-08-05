export type AiProviderName =
  'mock' | 'openai' | 'azure_openai' | 'anthropic' | 'gemini';

export type ChatRole = 'system' | 'user' | 'assistant' | 'tool';

export type ChatMessage = {
  role: ChatRole;
  content: string;
  name?: string;
};

export type ChatFunctionDefinition = {
  name: string;
  description?: string;
  parameters?: Record<string, unknown>;
};

export type ChatCompletionRequest = {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  functions?: ChatFunctionDefinition[];
  organizationId?: string;
  userId?: string;
  requestId?: string;
};

export type TokenUsage = {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
};

export type ChatCompletionResult = {
  content: string;
  model: string;
  provider: AiProviderName;
  usage: TokenUsage;
  latencyMs: number;
  costUsd: number;
  finishReason?: string;
  functionCall?: { name: string; arguments: string };
  raw?: unknown;
};

export type EmbeddingRequest = {
  texts: string[];
  model?: string;
  organizationId?: string;
  requestId?: string;
};

export type EmbeddingResult = {
  embeddings: number[][];
  model: string;
  provider: AiProviderName;
  usage: TokenUsage;
  latencyMs: number;
  costUsd: number;
  dimensions: number;
};

export type ProviderHealth = {
  status: 'up' | 'down' | 'unconfigured' | 'degraded';
  provider: AiProviderName;
  supportsStreaming: boolean;
  supportsFunctionCalling: boolean;
  supportsEmbeddings: boolean;
  detail?: string;
};

export interface AIProvider {
  readonly name: AiProviderName;
  readonly supportsStreaming: boolean;
  readonly supportsFunctionCalling: boolean;
  readonly supportsEmbeddings: boolean;
  chat(request: ChatCompletionRequest): Promise<ChatCompletionResult>;
  embed(request: EmbeddingRequest): Promise<EmbeddingResult>;
  healthCheck(): Promise<ProviderHealth>;
}

export const AI_PROVIDER = Symbol('AI_PROVIDER');

/** Rough USD per 1K tokens for cost tracking (illustrative defaults). */
export const DEFAULT_TOKEN_COSTS: Record<
  string,
  { prompt: number; completion: number }
> = {
  'mock-chat': { prompt: 0, completion: 0 },
  'mock-embed': { prompt: 0, completion: 0 },
  'gpt-4o-mini': { prompt: 0.00015, completion: 0.0006 },
  'text-embedding-3-small': { prompt: 0.00002, completion: 0 },
  'claude-3-5-haiku-latest': { prompt: 0.0008, completion: 0.004 },
  'gemini-1.5-flash': { prompt: 0.000075, completion: 0.0003 },
};

export function estimateCostUsd(model: string, usage: TokenUsage): number {
  const rates = DEFAULT_TOKEN_COSTS[model] ?? {
    prompt: 0.0005,
    completion: 0.0015,
  };
  return (
    (usage.promptTokens / 1000) * rates.prompt +
    (usage.completionTokens / 1000) * rates.completion
  );
}

export function estimateTokenCount(text: string): number {
  return Math.max(1, Math.ceil(text.length / 4));
}
