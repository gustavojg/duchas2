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
export const PAGES: readonly string[] = ['/', '/antes-y-despues/', '/zonas/', '/preguntas-frecuentes/', '/contacto/'];

export function sitemapXml(baseUrl: string, pages: readonly string[] = PAGES): string {
  const urls = pages.map((p) => `  <url><loc>${baseUrl}${p}</loc></url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function robotsTxt(baseUrl: string): string {
  return `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${baseUrl}/sitemap.xml\n`;
}
