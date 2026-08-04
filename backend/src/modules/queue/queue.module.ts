import { Global, Logger, Module, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * B1 Redis/BullMQ wiring stub.
 * Full job processors arrive in B021–B022.
 */
@Global()
@Module({})
export class QueueModule implements OnModuleInit {
  private readonly logger = new Logger(QueueModule.name);

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const redisUrl = this.configService.get<string>('redisUrl');
    this.logger.log(
      `Queue module ready (BullMQ stub). Redis URL configured: ${Boolean(redisUrl)}`,
    );
  }
}
