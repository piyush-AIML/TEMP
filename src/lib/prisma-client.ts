import { neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import WebSocket from 'ws';
import { PrismaClient } from '@/generated/prisma/client';

/**
 * Prisma client factory (Dashboard Stage 0). Shared by the Next runtime
 * (lib/db.ts) and the seed script — deliberately free of 'server-only' so both
 * can use it.
 *
 * Node < 22 has no global WebSocket, which the Neon driver wants for its TCP
 * connection — supply one from `ws` once. On Node 22+/Vercel this is a no-op
 * (the global already exists; an explicit ws is still valid).
 */
neonConfig.webSocketConstructor = WebSocket;

export function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      'DATABASE_URL is not set. Copy .env.example to .env.local and fill in your Neon connection string.'
    );
  }
  return new PrismaClient({ adapter: new PrismaNeon({ connectionString }) });
}
