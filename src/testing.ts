import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createApp, type Deps } from './app.js';
import { openDb } from './db.js';
import type { Mail } from './mailer.js';

/**
 * App lista para tests con app.request(): BD en memoria, mailer que guarda en `sent`, reloj controlable
 * (`clock.advance(minutos)`), IP fija, commit fijo ('test-commit') y DATA_DIR temporal. Por defecto WEB_DIR es
 * un directorio temporal vacío; pasa `webDir` para probar contra web/out. Cualquier dep se sobrescribe con `over`.
 */
export function testApp(over: Partial<Deps> & { webDir?: string } = {}) {
  const sent: Mail[] = [];
  const webDir = over.webDir ?? fs.mkdtempSync(path.join(os.tmpdir(), 'web-'));
  const dataDir = over.dataDir ?? fs.mkdtempSync(path.join(os.tmpdir(), 'data-'));
  const clock = {
    now: new Date('2026-01-01T10:00:00Z'),
    advance(minutos: number) {
      clock.now = new Date(clock.now.getTime() + minutos * 60000);
    },
  };
  const { webDir: _w, ...resto } = over;
  const deps: Deps = {
    db: openDb(':memory:'),
    mailer: { send: async (m) => void sent.push(m) },
    now: () => clock.now,
    commit: 'test-commit',
    clientIp: () => '203.0.113.1',
    config: { webDir, baseUrl: 'http://127.0.0.1:3000' },
    dataDir,
    formulario: { retencion_dias: 90, foto_max_mb: 10, limite_envios: 5, ventana_min: 60 },
    ipSalt: 'sal-de-test',
    emailDestino: 'taller@ejemplo.test',
    ...resto,
  };
  return { app: createApp(deps), deps, sent, webDir, dataDir, clock };
}
