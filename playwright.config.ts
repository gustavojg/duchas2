import fs from 'node:fs';
import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';
import { e2eTarget } from './src/e2e-target.js';

/**
 * `pnpm e2e`: Chromium contra `pnpm start` (requiere `pnpm build` y `pnpm exec playwright install chromium`).
 * `pnpm e2e:staging`: el mismo smoke contra un servidor ya levantado (E2E_BASE_URL, por defecto :8804), sin servidor propio.
 * E2E_CHROMIUM_PATH: ruta a un Chromium de la imagen en lugar del que descarga Playwright.
 *
 * Con servidor local hay un segundo servidor en :3101 que sirve web/out-fixture (negocio completo con ga4_id,
 * tests/build/construir-fixture.ts; si falta, se construye antes de arrancar) y el project 'chromium-fixture', que
 * ejecuta solo tests/e2e/cookies.spec.ts contra él. Si web/out-fixture ya existe se reutiliza: tras cambiar web/
 * o web/content, bórralo (o ejecuta `pnpm test:build`, que lo reconstruye) para no probar un build viejo.
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
/** DATA_DIR del servidor de fixture (:3101): hermano del anterior, también dentro de ./data. */
const DATA_DIR_FIXTURE = dataDirE2E(`${DATA_DIR}-fixture`);
if (usaServidorLocal && process.env.TEST_WORKER_INDEX === undefined) {
  fs.rmSync(DATA_DIR, { recursive: true, force: true });
  fs.rmSync(DATA_DIR_FIXTURE, { recursive: true, force: true });
}

const PUERTO_FIXTURE = '3101';
const COOKIES = /cookies\.spec\.ts$/;
// Nombres de src/config.ts. Sal y destino de prueba: no son secretos y solo valen para estos servidores locales.
const ENV_SERVIDOR = { HOST: '127.0.0.1', MAIL_TRANSPORT: 'file', EMAIL_DESTINO: 'peticiones@e2e.test', IP_SALT: 'e2e-sal-de-prueba' };

export default defineConfig({
  testDir: 'tests/e2e',
  use: { baseURL, ...(executablePath ? { launchOptions: { executablePath } } : {}) },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] }, testIgnore: COOKIES },
    ...(usaServidorLocal
      ? [{ name: 'chromium-fixture', use: { ...devices['Desktop Chrome'], baseURL: `http://127.0.0.1:${PUERTO_FIXTURE}` }, testMatch: COOKIES }]
      : []),
  ],
  ...(usaServidorLocal
    ? {
        webServer: [
          {
            command: 'pnpm start',
            url: `${baseURL}/health`,
            env: { ...ENV_SERVIDOR, PORT: new URL(baseURL).port, DATA_DIR },
            reuseExistingServer: false,
          },
          {
            // Si el build de fixture falla, el servidor no arranca (en vez de servir un web/out-fixture vacío).
            command: 'sh -c "(test -f web/out-fixture/index.html || pnpm exec tsx tests/build/construir-fixture.ts) && pnpm start"',
            url: `http://127.0.0.1:${PUERTO_FIXTURE}/health`,
            env: { ...ENV_SERVIDOR, PORT: PUERTO_FIXTURE, WEB_DIR: 'web/out-fixture', DATA_DIR: DATA_DIR_FIXTURE },
            reuseExistingServer: false,
            // Puede incluir un build completo de Next.
            timeout: 600_000,
          },
        ],
      }
    : {}),
});
