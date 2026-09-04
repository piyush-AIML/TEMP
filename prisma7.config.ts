// Prisma 7 config. Real values live in .env.local (gitignored) — Next.js loads
// it natively for the app runtime, and we load it here for the Prisma CLI
// (dotenv/config only reads `.env`, which this repo deliberately does not use).
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
