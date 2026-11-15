import fs from 'node:fs';
import path from 'node:path';
import { serve } from '@hono/node-server';
import { getConnInfo } from '@hono/node-server/conninfo';
import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { openDb } from './db.js';
import { createMailer } from './mailer.js';

const config = loadConfig();
if (!fs.existsSync(path.join(config.webDir, 'index.html'))) {
  console.warn(`aviso: no hay ${config.webDir}/index.html; ejecuta \`pnpm build\` (solo responde /health y /api)`);
}
const app = createApp({
  db: openDb(path.join(config.dataDir, 'app.db')),
  mailer: createMailer(config),
  now: () => new Date(),
  commit: config.commit,
  clientIp: (c) => getConnInfo(c).remote.address ?? 'desconocida',
  config,
});
serve({ fetch: app.fetch, port: config.port, hostname: config.host }, () =>
  console.log(`listo en http://${config.host}:${config.port}`),
);
