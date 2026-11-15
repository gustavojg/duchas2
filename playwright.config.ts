import { defineConfig, devices } from '@playwright/test';

/** `pnpm e2e`: Chromium contra `pnpm start` (requiere `pnpm build` y `pnpm exec playwright install chromium`). */
const PORT = Number(process.env.E2E_PORT ?? 3100);

export default defineConfig({
  testDir: 'tests/e2e',
  use: { baseURL: `http://127.0.0.1:${PORT}` },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'pnpm start',
    url: `http://127.0.0.1:${PORT}/health`,
    env: { PORT: String(PORT), HOST: '127.0.0.1', DATA_DIR: 'data/e2e' },
    reuseExistingServer: false,
  },
});
