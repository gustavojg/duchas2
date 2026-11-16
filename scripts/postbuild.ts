import fs from 'node:fs';
import path from 'node:path';
import { loadConfig } from '../src/config.js';
import { avisoBorrador, datosFaltantes } from '../web/src/lib/borrador.js';
import { cargarNegocio, cargarServicios } from '../web/src/lib/content.js';
import { rutaDeServicio } from '../web/src/lib/rutas.js';
import { normalizarBase, PAGES, paginasDelSitio, robotsTxt, sitemapXml } from '../web/src/lib/site.js';

/**
 * Hook tras `next build` (lo llama `pnpm build`): escribe en WEB_DIR lo que el export de Next no genera.
 * - sitemap.xml y robots.txt sobre `url_base` de negocio.json (la misma base que el canonical del layout, ADR 0005;
 *   BASE_URL del servidor no interviene) y las páginas del sitio (paginasDelSitio: PAGES + servicios de tipo
 *   'servicio' de servicios.json). Falla si alguna ruta de PAGES no tiene su HTML.
 * - En modo borrador avisa en consola. robots.txt no lleva `Disallow: /`: lo que lee el buscador es la meta
 *   noindex de cada página (ADR 0005).
 */
// BASE_URL ya no se usa aquí; se descarta para que un valor ajeno (p. ej. el '/' que pone Vite) no rompa el build.
const { webDir } = loadConfig({ ...process.env, BASE_URL: undefined });
const negocio = cargarNegocio();
const urlBase = normalizarBase(negocio.url_base);
const tieneHtml = (ruta: string) => fs.existsSync(path.join(webDir, ruta, 'index.html'));

for (const ruta of PAGES) {
  if (!tieneHtml(ruta)) throw new Error(`postbuild: falta el HTML de ${ruta}`);
}
// Un servicio del catálogo sin página construida no va al sitemap (aviso, no error).
const servicios = cargarServicios();
const sinPagina = servicios.filter((s) => !tieneHtml(rutaDeServicio(s)));
if (sinPagina.length > 0)
  console.warn(`postbuild: servicios sin página todavía, fuera del sitemap: ${sinPagina.map(rutaDeServicio).join(', ')}`);
const rutas = paginasDelSitio(servicios.filter((s) => !sinPagina.includes(s)));
fs.writeFileSync(path.join(webDir, 'sitemap.xml'), sitemapXml(urlBase, rutas));
fs.writeFileSync(path.join(webDir, 'robots.txt'), robotsTxt(urlBase));

const faltantes = datosFaltantes(negocio);
if (faltantes.length > 0) console.warn(avisoBorrador(faltantes));
console.log(`postbuild: sitemap.xml (${rutas.length} rutas) y robots.txt en ${webDir} (url_base de negocio.json: ${urlBase})`);
