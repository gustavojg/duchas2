/**
 * Datos del sitio compartidos por la web y el servidor. Módulo PURO: sin React, sin Next, sin imports de
 * Node ni del navegador. El servidor lo importa por ruta relativa (`../web/src/lib/site.js`) y lo comprueba
 * el tsconfig de la raíz; si importa otro módulo de lib, con extensión `.js`.
 */
/** Nombre de trabajo del producto mientras el cliente no confirme la marca (`{{MARCA}}`). */
export const APP_NAME = 'Duchas 2';

/** Frase del producto: titular de la portada (docs/DESIGN.md › Portada). */
export const TAGLINE = 'Tu plato de ducha se repara. Sin obras.';

/** Descripción para metadatos y subtítulo de la portada; no promete plazos ni precios sin confirmar. */
export const DESCRIPTION =
  'Lo esmaltamos en tu baño, sin polvo y con garantía por escrito. Mándanos una foto y te decimos si tiene arreglo.';

/** Rutas públicas que se exportan como página y van al sitemap (con barra final: trailingSlash). */
export const PAGES: readonly string[] = [
  '/',
  '/platos-de-ducha/',
  '/tarifas/',
  '/zonas/',
  '/preguntas-frecuentes/',
  '/hoteles-y-comunidades/',
  '/antes-y-despues/',
  '/privacidad/',
  '/contacto/',
];

/**
 * Páginas del sitio para el sitemap y los tests de build: PAGES con la ruta de cada servicio de tipo
 * 'servicio' (servicios.json) antes de '/contacto/', sin duplicados y en orden. No muta PAGES.
 */
export function paginasDelSitio(servicios: readonly { ruta: string; tipo: string }[]): string[] {
  const rutas = servicios.filter((s) => s.tipo === 'servicio').map((s) => s.ruta);
  const fin = PAGES.indexOf('/contacto/');
  const antes = fin === -1 ? [...PAGES] : PAGES.slice(0, fin);
  const despues = fin === -1 ? [] : PAGES.slice(fin);
  return [...new Set([...antes, ...rutas, ...despues])];
}

/**
 * Base de las URL absolutas del SEO (canonical, sitemap y robots) sin barras finales. La base es `url_base` de
 * web/content/negocio.json: `http://x/` y `http://x` dan lo mismo.
 */
export function normalizarBase(urlBase: string): string {
  return urlBase.replace(/\/+$/, '');
}

/**
 * URL absoluta de una página: base normalizada + ruta con barra inicial y final (trailingSlash, como PAGES).
 * Es la misma que el `<loc>` de sitemapXml, que la usa; el canonical de cada página sale de aquí.
 */
export function canonicalUrl(urlBase: string, ruta: string): string {
  const conInicial = ruta.startsWith('/') ? ruta : `/${ruta}`;
  const conFinal = conInicial.endsWith('/') ? conInicial : `${conInicial}/`;
  return `${normalizarBase(urlBase)}${conFinal}`;
}

export function sitemapXml(baseUrl: string, pages: readonly string[] = PAGES): string {
  const urls = pages.map((p) => `  <url><loc>${canonicalUrl(baseUrl, p)}</loc></url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function robotsTxt(baseUrl: string): string {
  return `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${normalizarBase(baseUrl)}/sitemap.xml\n`;
}
