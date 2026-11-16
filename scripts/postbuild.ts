import fs from 'node:fs';
import path from 'node:path';
import { loadConfig } from '../src/config.js';
import { cargarNegocio } from '../web/src/lib/content.js';
import { normalizarBase, robotsTxt, sitemapXml } from '../web/src/lib/site.js';

/**
 * Hook tras `next build` (lo llama `pnpm build`): escribe en WEB_DIR lo que el export de Next no genera
 * a partir de datos del sitio. Hoy sitemap.xml y robots.txt con `url_base` de web/content/negocio.json, la
 * misma base que el canonical del layout (ADR 0005); BASE_URL del servidor no interviene. Añade aquí otros
 * derivados.
 */
const { webDir } = loadConfig();
const urlBase = normalizarBase(cargarNegocio().url_base);
if (!fs.existsSync(path.join(webDir, 'index.html'))) throw new Error(`postbuild: falta ${webDir}/index.html`);
fs.writeFileSync(path.join(webDir, 'sitemap.xml'), sitemapXml(urlBase));
fs.writeFileSync(path.join(webDir, 'robots.txt'), robotsTxt(urlBase));
console.log(`postbuild: sitemap.xml y robots.txt en ${webDir} (url_base de negocio.json: ${urlBase})`);
