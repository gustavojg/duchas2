import fs from 'node:fs';
import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';

/** `pnpm e2e`: Chromium contra `pnpm start` (requiere `pnpm build` y `pnpm exec playwright install chromium`). */
const PORT = Number(process.env.E2E_PORT ?? 3100);

/**
 * Datos del e2e aislados (SQLite, fotos y outbox del mailer `file`, que escribe en DATA_DIR/mail: src/mailer.ts).
 * Se vacían al empezar para que el límite por IP (envios_ip) y el outbox no arrastren otras ejecuciones; solo en el
 * proceso principal: los workers también cargan este fichero y el servidor ya está usando el directorio.
 */
const DATA_DIR = path.resolve(process.env.E2E_DATA_DIR ?? 'data/e2e');
if (process.env.TEST_WORKER_INDEX === undefined) fs.rmSync(DATA_DIR, { recursive: true, force: true });

export default defineConfig({
  testDir: 'tests/e2e',
  use: { baseURL: `http://127.0.0.1:${PORT}` },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'pnpm start',
    url: `http://127.0.0.1:${PORT}/health`,
    env: {
      PORT: String(PORT),
      HOST: '127.0.0.1',
      DATA_DIR,
      // Nombres de src/config.ts. Sal y destino de prueba: no son secretos y solo valen para este servidor local.
      MAIL_TRANSPORT: 'file',
      EMAIL_DESTINO: 'peticiones@e2e.test',
      IP_SALT: 'e2e-sal-de-prueba',
    },
    reuseExistingServer: false,
  },
});
