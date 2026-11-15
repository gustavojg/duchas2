import { defineConfig } from 'vitest/config';

/** `pnpm test:build`: pruebas sobre web/out ya generado por `pnpm build` (lo que de verdad sirve Hono). */
export default defineConfig({
  test: {
    include: ['tests/build/**/*.test.ts'],
  },
});
