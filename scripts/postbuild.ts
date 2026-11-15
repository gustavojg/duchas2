import fs from 'node:fs';
import path from 'node:path';
import { loadConfig } from '../src/config.js';
import { robotsTxt, sitemapXml } from '../web/src/lib/site.js';

/**
 * Hook tras `next build` (lo llama `pnpm build`): escribe en WEB_DIR lo que el export de Next no genera
 * a partir de datos del sitio. Hoy sitemap.xml y robots.txt con BASE_URL; añade aquí otros derivados.
 */
const { webDir, baseUrl } = loadConfig();
if (!fs.existsSync(path.join(webDir, 'index.html'))) throw new Error(`postbuild: falta ${webDir}/index.html`);
fs.writeFileSync(path.join(webDir, 'sitemap.xml'), sitemapXml(baseUrl));
fs.writeFileSync(path.join(webDir, 'robots.txt'), robotsTxt(baseUrl));
console.log(`postbuild: sitemap.xml y robots.txt en ${webDir} (${baseUrl})`);
