import { Prisma } from '@prisma/client';
import { PrismaService } from './prisma.service';

export type TxClient = Prisma.TransactionClient;

export async function withTransaction<T>(
  prisma: PrismaService,
  fn: (tx: TxClient) => Promise<T>,
  options?: {
    maxWait?: number;
    timeout?: number;
    isolationLevel?: Prisma.TransactionIsolationLevel;
  },
): Promise<T> {
  return prisma.$transaction(fn, {
    maxWait: options?.maxWait ?? 5_000,
    timeout: options?.timeout ?? 30_000,
    isolationLevel: options?.isolationLevel,
  });
}
