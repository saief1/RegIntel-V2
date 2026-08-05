import { BullModule } from '@nestjs/bullmq';
import { Global, Logger, Module, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import {
  AuditCleanupProcessor,
  EmailProcessor,
  NotificationDeliveryProcessor,
  PolicyExpiryProcessor,
  ReminderProcessor,
  ReviewCycleProcessor,
  SearchIndexProcessor,
  SyncRetryProcessor,
  WorkflowAutomationProcessor,
} from './processors/domain.processors';
import { QUEUE_NAMES } from './queue.constants';

const queueRegistrations = Object.values(QUEUE_NAMES).map((name) =>
  BullModule.registerQueue({ name }),
);

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const redisUrl = config.getOrThrow<string>('redisUrl');
        return {
          connection: { url: redisUrl },
          defaultJobOptions: {
            attempts: 5,
            backoff: { type: 'exponential', delay: 2000 },
            removeOnComplete: 100,
            removeOnFail: false,
          },
        };
      },
    }),
    ...queueRegistrations,
  ],
  controllers: [JobsController],
  providers: [
    JobsService,
    EmailProcessor,
    ReminderProcessor,
    ReviewCycleProcessor,
    PolicyExpiryProcessor,
    NotificationDeliveryProcessor,
    SyncRetryProcessor,
    WorkflowAutomationProcessor,
    AuditCleanupProcessor,
    SearchIndexProcessor,
  ],
  exports: [JobsService, BullModule],
})
export class QueueModule implements OnModuleInit {
  private readonly logger = new Logger(QueueModule.name);

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const redisUrl = this.configService.get<string>('redisUrl');
    this.logger.log(
      `Queue module ready (BullMQ). Redis configured: ${Boolean(redisUrl)}. Queues: ${Object.values(QUEUE_NAMES).join(', ')}`,
    );
  }
}
