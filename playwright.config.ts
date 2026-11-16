import fs from 'node:fs';
import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';
import { e2eTarget } from './src/e2e-target.js';

/**
 * `pnpm e2e`: Chromium contra `pnpm start` (requiere `pnpm build` y `pnpm exec playwright install chromium`).
 * `pnpm e2e:staging`: el mismo smoke contra un servidor ya levantado (E2E_BASE_URL, por defecto :8804), sin servidor propio.
 * E2E_CHROMIUM_PATH: ruta a un Chromium de la imagen en lugar del que descarga Playwright.
 */
const { baseURL, usaServidorLocal } = e2eTarget(process.env);
const executablePath = process.env.E2E_CHROMIUM_PATH;

/**
 * Datos del e2e aislados (SQLite, fotos y outbox del mailer `file`, que escribe en DATA_DIR/mail: src/mailer.ts).
 * Se vacían al empezar para que el límite por IP (envios_ip) y el outbox no arrastren otras ejecuciones; solo en el
 * proceso principal: los workers también cargan este fichero y el servidor ya está usando el directorio.
 */
const RAIZ_E2E = path.resolve('data');

/**
 * DATA_DIR del e2e: E2E_DATA_DIR o data/e2e, y siempre por debajo de ./data (nunca ./data mismo ni fuera), porque
 * se borra entero. Si no cumple, lanza antes de borrar nada. Lo usa también tests/e2e/contacto.spec.ts (OUTBOX).
 */
export function dataDirE2E(valor = process.env.E2E_DATA_DIR): string {
  const dir = path.resolve(valor ?? 'data/e2e');
  const rel = path.relative(RAIZ_E2E, dir);
  if (rel === '' || rel.startsWith('..') || path.isAbsolute(rel)) {
    throw new Error(`E2E_DATA_DIR tiene que estar dentro de ${RAIZ_E2E} (sin ser esa carpeta); recibido: ${dir}. No se ha borrado nada.`);
  }
  return dir;
}

const DATA_DIR = dataDirE2E();
if (usaServidorLocal && process.env.TEST_WORKER_INDEX === undefined) fs.rmSync(DATA_DIR, { recursive: true, force: true });

export default defineConfig({
  testDir: 'tests/e2e',
  use: { baseURL, ...(executablePath ? { launchOptions: { executablePath } } : {}) },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  ...(usaServidorLocal
    ? {
        webServer: {
          command: 'pnpm start',
          url: `${baseURL}/health`,
          env: {
            PORT: new URL(baseURL).port,
            HOST: '127.0.0.1',
            DATA_DIR,
            // Nombres de src/config.ts. Sal y destino de prueba: no son secretos y solo valen para este servidor local.
            MAIL_TRANSPORT: 'file',
            EMAIL_DESTINO: 'peticiones@e2e.test',
            IP_SALT: 'e2e-sal-de-prueba',
          },
          reuseExistingServer: false,
        },
      }
    : {}),
});
