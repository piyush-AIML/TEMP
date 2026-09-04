import 'server-only';
import type { PrismaClient } from '@/generated/prisma/client';
import { createPrismaClient } from '@/lib/prisma-client';

/**
 * Prisma client singleton (Dashboard Stage 0-A). Client is created lazily so
 * importing this module never connects: the first db() call does. Hot-reload
 * guard: reuse the client across HMR reloads in dev.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export function db(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}
