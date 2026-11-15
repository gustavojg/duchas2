import { defineConfig, devices } from '@playwright/test';
import { e2eTarget } from './src/e2e-target.js';

/**
 * `pnpm e2e`: Chromium contra `pnpm start` (requiere `pnpm build` y `pnpm exec playwright install chromium`).
 * `pnpm e2e:staging`: el mismo smoke contra un servidor ya levantado (E2E_BASE_URL, por defecto :8804), sin servidor propio.
 * E2E_CHROMIUM_PATH: ruta a un Chromium de la imagen en lugar del que descarga Playwright.
 */
const { baseURL, usaServidorLocal } = e2eTarget(process.env);
const executablePath = process.env.E2E_CHROMIUM_PATH;

export default defineConfig({
  testDir: 'tests/e2e',
  use: { baseURL, ...(executablePath ? { launchOptions: { executablePath } } : {}) },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  ...(usaServidorLocal
    ? {
        webServer: {
          command: 'pnpm start',
          url: `${baseURL}/health`,
          env: { PORT: new URL(baseURL).port, HOST: '127.0.0.1', DATA_DIR: 'data/e2e' },
          reuseExistingServer: false,
        },
      }
    : {}),
});
