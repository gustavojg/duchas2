import { Hono, type Context } from 'hono';
import type { DatabaseSync } from 'node:sqlite';
import type { Config } from './config.js';
import type { Mailer } from './mailer.js';
import { contactoRoutes } from './routes/contacto.js';
import { mountWeb } from './web.js';
import { APP_NAME } from '../web/src/lib/site.js';
import type { ConfigFormulario } from '../web/src/lib/config.js';

/** Todo lo que la app necesita del exterior, por parámetro: los tests pasan BD ':memory:', mailer falso y reloj fijo. */
export interface Deps {
  db: DatabaseSync;
  mailer: Mailer;
  now: () => Date;
  /** Commit servido, que informa /health (en el servidor, config.commit de GIT_SHA). */
  commit: string;
  /** IP del cliente (en el servidor, getConnInfo); para límites de envío y auditoría. */
  clientIp: (c: Context) => string;
  config: Pick<Config, 'webDir' | 'baseUrl'>;
  /** DATA_DIR: fotos en DATA_DIR/fotos (nunca servidas por HTTP). */
  dataDir: string;
  /** Retención y límites del formulario (web/content/config.json + overrides). */
  formulario: ConfigFormulario;
  /** Sal del HMAC de la IP (IP_SALT). */
  ipSalt: string;
  /** Adónde se envían las peticiones; null si aún no está confirmado (el formulario responde 503). */
  emailDestino: string | null;
}

export function createApp(deps: Deps): Hono {
  const app = new Hono();

  app.get('/health', (c) => c.json({ ok: true, app: APP_NAME, commit: deps.commit }));

  // Rutas de la API aquí, un módulo por recurso: app.route('/api/<recurso>', <recurso>Routes(deps)).
  app.route('/api/contacto', contactoRoutes(deps));
  app.all('/api/*', (c) => c.json({ error: 'not_found' }, 404));

  // El frontend estático va el último: captura todo lo que no sea /health ni /api.
  mountWeb(app, deps.config.webDir);
  return app;
}
