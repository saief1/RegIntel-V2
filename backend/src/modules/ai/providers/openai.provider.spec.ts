import { ConfigService } from '@nestjs/config';
import { OpenAiProvider } from './openai.provider';

describe('OpenAiProvider', () => {
  it('errors clearly without API key', async () => {
    const config = {
      get: () => '',
    } as unknown as ConfigService;
    const provider = new OpenAiProvider(config);
    await expect(
      provider.chat({ messages: [{ role: 'user', content: 'hi' }] }),
    ).rejects.toThrow(/OPENAI_API_KEY/);
    const health = await provider.healthCheck();
    expect(health.status).toBe('unconfigured');
  });
});
