/**
 * Lista canónica de rutas públicas: la usan el sitemap (scripts/postbuild.ts), el pie y los tests del build.
 * Puro: sin React, Next, node:* ni window.
 */
import { PAGES } from './site.ts';

export function rutaServicio(slug: string): string {
  return `/servicios/${slug}/`;
}

/** Barra inicial y final (trailingSlash). */
const normalizar = (ruta: string) => `/${ruta.replace(/^\/+|\/+$/g, '')}/`.replace(/^\/\/$/, '/');

/** PAGES más una ruta por servicio, sin duplicados. */
export function rutasCanonicas(servicios: { slug: string }[] = []): string[] {
  const todas = [...PAGES, ...servicios.map((s) => rutaServicio(s.slug))].map(normalizar);
  return [...new Set(todas)];
}
