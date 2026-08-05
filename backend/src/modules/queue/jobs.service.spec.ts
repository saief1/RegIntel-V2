import { JobsService } from './jobs.service';

describe('JobsService', () => {
  it('falls back to in-process enqueue when queues are absent', async () => {
    const jobs = new JobsService();
    const result = await jobs.enqueueEmail({
      organizationId: 'org',
      userId: 'user',
      subject: 'Hello',
      body: 'World',
    });

    expect(result.mode).toBe('in-process');
    expect(jobs.getInProcessFallback()).toHaveLength(1);

    const stats = await jobs.getQueueStats();
    expect(stats.queues).toHaveLength(9);
    expect(stats.inProcessPending).toBe(1);
  });
});
