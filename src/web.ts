import fs from 'node:fs';
import path from 'node:path';
import { serveStatic } from '@hono/node-server/serve-static';
import type { Hono } from 'hono';

/**
 * Sirve la exportación estática de Next (WEB_DIR, por defecto web/out). Se monta DESPUÉS de /health y /api.
 * - trailingSlash: /ruta → 308 a /ruta/ si existe web/out/ruta/index.html; /ruta/ sirve ese index.html.
 * - /_next/static/* lleva hash en el nombre: caché de un año, immutable.
 * - Lo que no exista responde 404 con web/out/404.html (la página not-found de Next).
 */
export function mountWeb(app: Hono, webDir: string): void {
  const isDir = (p: string) => !p.includes('..') && fs.statSync(path.join(webDir, p), { throwIfNoEntry: false })?.isDirectory();

  app.use('/_next/static/*', async (c, next) => {
    await next();
    if (c.res.status === 200) c.header('Cache-Control', 'public, max-age=31536000, immutable');
  });

  app.use('*', async (c, next) => {
    const p = c.req.path;
    if ((c.req.method === 'GET' || c.req.method === 'HEAD') && !p.endsWith('/') && isDir(p)) {
      const query = new URL(c.req.url).search;
      return c.redirect(`${p}/${query}`, 308);
    }
    return next();
  });

  app.use('*', serveStatic({ root: webDir }));

  app.notFound((c) => {
    const file = path.join(webDir, '404.html');
    if (fs.existsSync(file)) return c.html(fs.readFileSync(file, 'utf8'), 404);
    return c.text('No encontrado', 404);
  });
}
