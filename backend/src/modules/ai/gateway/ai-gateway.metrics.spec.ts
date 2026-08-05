import { AiGatewayService } from './ai-gateway.service';

describe('AiGatewayService metrics', () => {
  it('exposes zeroed metrics initially', () => {
    const gateway = new AiGatewayService(
      {
        name: 'mock',
        healthCheck: () =>
          Promise.resolve({
            status: 'up',
            provider: 'mock',
            supportsStreaming: true,
            supportsFunctionCalling: true,
            supportsEmbeddings: true,
          }),
      } as never,
      { name: 'json', healthCheck: () => Promise.resolve('up') } as never,
      {} as never,
      {} as never,
      {} as never,
      {
        get: (key: string) =>
          key === 'featureFlags.useRealAi' ? false : undefined,
      } as never,
    );
    const metrics = gateway.getMetrics();
    expect(metrics.chatRequests).toBe(0);
    expect(metrics.provider).toBe('mock');
  });
});
