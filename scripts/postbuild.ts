import fs from 'node:fs';
import path from 'node:path';
import { loadConfig } from '../src/config.js';
import { avisoBorrador, datosFaltantes } from '../web/src/lib/borrador.js';
import { cargarNegocio, cargarServicios } from '../web/src/lib/content.js';
import { rutaDeServicio, rutasCanonicas } from '../web/src/lib/rutas.js';
import { PAGES, robotsTxt, sitemapXml } from '../web/src/lib/site.js';

/**
 * Hook tras `next build` (lo llama `pnpm build`): escribe en WEB_DIR lo que el export de Next no genera.
 * - sitemap.xml y robots.txt sobre `url_base` de negocio.json (la misma fuente que canonical y Open Graph; ya no
 *   BASE_URL) y la lista canónica de rutas (PAGES + servicios.json). Falla si alguna ruta no tiene su HTML.
 * - En modo borrador avisa en consola. robots.txt no lleva `Disallow: /`: lo que lee el buscador es la meta
 *   noindex de cada página (ADR 0005).
 */
// BASE_URL ya no se usa aquí; se descarta para que un valor ajeno (p. ej. el '/' que pone Vite) no rompa el build.
const { webDir } = loadConfig({ ...process.env, BASE_URL: undefined });
const negocio = cargarNegocio();
const base = negocio.url_base.replace(/\/+$/, '');
const tieneHtml = (ruta: string) => fs.existsSync(path.join(webDir, ruta, 'index.html'));

for (const ruta of PAGES) {
  if (!tieneHtml(ruta)) throw new Error(`postbuild: falta el HTML de ${ruta}`);
}
// servicios.json existe antes que las páginas de cada servicio: hasta que se construyan, no van al sitemap.
const servicios = cargarServicios();
const sinPagina = servicios.filter((s) => !tieneHtml(rutaDeServicio(s)));
if (sinPagina.length > 0)
  console.warn(`postbuild: servicios sin página todavía, fuera del sitemap: ${sinPagina.map(rutaDeServicio).join(', ')}`);
const rutas = rutasCanonicas(servicios.filter((s) => !sinPagina.includes(s)));
fs.writeFileSync(path.join(webDir, 'sitemap.xml'), sitemapXml(base, rutas));
fs.writeFileSync(path.join(webDir, 'robots.txt'), robotsTxt(base));

const faltantes = datosFaltantes(negocio);
if (faltantes.length > 0) console.warn(avisoBorrador(faltantes));
console.log(`postbuild: sitemap.xml (${rutas.length} rutas) y robots.txt en ${webDir} (${base})`);
