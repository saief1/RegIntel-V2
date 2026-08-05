import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const MAX_CONNECT_ATTEMPTS = 8;
const BASE_DELAY_MS = 250;

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit(): Promise<void> {
    let attempt = 0;
    while (attempt < MAX_CONNECT_ATTEMPTS) {
      attempt += 1;
      try {
        await this.$connect();
        this.logger.log('PostgreSQL connection established');
        return;
      } catch (error) {
        const delay = BASE_DELAY_MS * 2 ** (attempt - 1);
        this.logger.warn(
          `Database connect attempt ${attempt}/${MAX_CONNECT_ATTEMPTS} failed; retrying in ${delay}ms`,
        );
        if (attempt >= MAX_CONNECT_ATTEMPTS) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  async ping(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
