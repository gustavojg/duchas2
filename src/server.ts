import fs from 'node:fs';
import path from 'node:path';
import { serve } from '@hono/node-server';
import { getConnInfo } from '@hono/node-server/conninfo';
import { createApp } from './app.js';
import { resolverIp } from './client-ip.js';
import { loadConfig } from './config.js';
import { openDb } from './db.js';
import { borrarCaducadas } from './domain/limpieza.js';
import { createMailer } from './mailer.js';
import { configFormulario } from '../web/src/lib/config.js';
import { cargarNegocio } from '../web/src/lib/content.js';

const config = loadConfig();
if (config.ipSaltGenerada) console.warn('aviso: falta IP_SALT; se usa una sal aleatoria y el límite por IP no sobrevive a reinicios. Fija IP_SALT.');
if (!fs.existsSync(path.join(config.webDir, 'index.html'))) {
  console.warn(`aviso: no hay ${config.webDir}/index.html; ejecuta \`pnpm build\` (solo responde /health y /api)`);
}
const dataDir = config.dataDir;
const formulario = configFormulario();
const emailDestino = config.emailDestino ?? cargarNegocio().email_destino.valor;
if (!emailDestino) {
  console.warn(
    'aviso: no hay email_destino confirmado en web/content/negocio.json ni EMAIL_DESTINO; el formulario responderá 503',
  );
}
const db = openDb(path.join(dataDir, 'app.db'));

// Retención (ADR 0006): al arrancar y cada 24 h. Un fallo se registra pero no tumba el proceso.
function limpiar(): void {
  try {
    const r = borrarCaducadas(db, dataDir, formulario.retencion_dias, new Date(), formulario.ventana_min);
    if (r.peticiones || r.ips) console.log(`limpieza: ${r.peticiones} peticiones y ${r.ips} IPs borradas`);
  } catch (e) {
    console.error(`limpieza: error al borrar caducadas (${e instanceof Error ? e.name : 'error'})`);
  }
}
limpiar();
setInterval(limpiar, 24 * 60 * 60 * 1000).unref();
const app = createApp({
  db,
  mailer: createMailer(config),
  now: () => new Date(),
  commit: config.commit,
  clientIp: (c) => resolverIp(getConnInfo(c).remote.address, c.req.header('x-forwarded-for') ?? null, config.trustProxy),
  config,
  dataDir,
  formulario,
  ipSalt: config.ipSalt,
  emailDestino,
});
serve({ fetch: app.fetch, port: config.port, hostname: config.host }, () =>
  console.log(`listo en http://${config.host}:${config.port}`),
);
