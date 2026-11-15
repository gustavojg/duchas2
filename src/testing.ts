import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createApp, type Deps } from './app.js';
import { openDb } from './db.js';
import type { Mail } from './mailer.js';

/**
 * App lista para tests con app.request(): BD en memoria, mailer que guarda en `sent`, reloj fijo, IP fija y commit fijo ('test-commit').
 * Por defecto WEB_DIR es un directorio temporal vacío; pasa `webDir` para probar contra web/out.
 */
export function testApp(over: Partial<Deps> & { webDir?: string } = {}) {
  const sent: Mail[] = [];
  const webDir = over.webDir ?? fs.mkdtempSync(path.join(os.tmpdir(), 'web-'));
  const deps: Deps = {
    db: openDb(':memory:'),
    mailer: { send: async (m) => void sent.push(m) },
    now: () => new Date('2026-01-01T10:00:00Z'),
    commit: 'test-commit',
    clientIp: () => '203.0.113.1',
    config: { webDir, baseUrl: 'http://127.0.0.1:3000' },
    ...over,
  };
  return { app: createApp(deps), deps, sent, webDir };
}
