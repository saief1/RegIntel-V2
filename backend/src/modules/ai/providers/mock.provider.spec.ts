import { MockAiProvider } from './mock.provider';

describe('MockAiProvider', () => {
  const provider = new MockAiProvider();

  it('chats without API keys', async () => {
    const result = await provider.chat({
      messages: [{ role: 'user', content: 'Summarize FINTRAC changes' }],
    });
    expect(result.provider).toBe('mock');
    expect(result.content).toContain('FINTRAC');
    expect(result.usage.totalTokens).toBeGreaterThan(0);
    expect(result.costUsd).toBe(0);
  });

  it('embeds deterministically', async () => {
    const a = await provider.embed({ texts: ['policy text'] });
    const b = await provider.embed({ texts: ['policy text'] });
    expect(a.dimensions).toBe(64);
    expect(a.embeddings[0]).toEqual(b.embeddings[0]);
  });

  it('reports healthy', async () => {
    const health = await provider.healthCheck();
    expect(health.status).toBe('up');
    expect(health.supportsEmbeddings).toBe(true);
  });
});
