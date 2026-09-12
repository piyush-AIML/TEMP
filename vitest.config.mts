import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

/**
 * Vitest config (Landing Redesign Stage 1). Node environment only — the tests
 * in this stage deliberately cover **pure** functions (contrast maths, scroll
 * geometry) so that scroll calibration is verifiable without a DOM or a
 * browser. See Landing-Redesign-Plan.md §10.1.
 *
 * The `.mts` extension is deliberate: no "type": "module" in package.json, so
 * a `.ts` config triggers Vite's configLoader compatibility warning.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
