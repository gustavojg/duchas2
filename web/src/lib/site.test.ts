import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { PAGES, robotsTxt, sitemapXml } from './site.js';

// Lo ejecuta el vitest de la raíz (lógica pura de web/src/lib), no el de web/.
describe('site', () => {
  it('el sitemap lista cada página con la URL base', () => {
    const xml = sitemapXml('https://ejemplo.test');
    for (const p of PAGES) expect(xml).toContain(`<loc>https://ejemplo.test${p}</loc>`);
  });

  it('PAGES incluye /contacto/ y el sitemap lo lista', () => {
    expect(PAGES).toContain('/contacto/');
    expect(sitemapXml('https://ejemplo.test')).toContain('<loc>https://ejemplo.test/contacto/</loc>');
  });

  it('la navegación (NAV de web/src/config.ts) enlaza /contacto/', () => {
    // Se lee como texto: config.ts importa de web/src/ui, que el tsconfig de la raíz no compila.
    const src = readFileSync(fileURLToPath(new URL('../config.ts', import.meta.url)), 'utf8');
    const nav = /export const NAV[^=]*=\s*\[([\s\S]*?)\];/.exec(src)?.[1] ?? '';
    expect(nav).toMatch(/\{\s*href:\s*'\/contacto\/',\s*label:\s*'Contacto'\s*\}/);
  });

  it('PAGES y el sitemap incluyen /platos-de-ducha/ y /tarifas/, con / primero y /contacto/ al final', () => {
    const xml = sitemapXml('https://ejemplo.test');
    for (const p of ['/platos-de-ducha/', '/tarifas/']) {
      expect(PAGES).toContain(p);
      expect(xml).toContain(`<loc>https://ejemplo.test${p}</loc>`);
    }
    expect(PAGES[0]).toBe('/');
    expect(PAGES.at(-1)).toBe('/contacto/');
  });

  it('la navegación enlaza /platos-de-ducha/ y /tarifas/, con Inicio primero y Contacto al final', () => {
    const src = readFileSync(fileURLToPath(new URL('../config.ts', import.meta.url)), 'utf8');
    const nav = /export const NAV[^=]*=\s*\[([\s\S]*?)\];/.exec(src)?.[1] ?? '';
    expect(nav).toMatch(/\{\s*href:\s*'\/platos-de-ducha\/',\s*label:\s*'Platos de ducha'\s*\}/);
    expect(nav).toMatch(/\{\s*href:\s*'\/tarifas\/',\s*label:\s*'Tarifas'\s*\}/);
    const hrefs = [...nav.matchAll(/href:\s*'([^']+)'/g)].map((m) => m[1]);
    expect(hrefs[0]).toBe('/');
    expect(hrefs.at(-1)).toBe('/contacto/');
  });

  it('robots.txt apunta al sitemap y excluye la API', () => {
    const txt = robotsTxt('https://ejemplo.test');
    expect(txt).toContain('Sitemap: https://ejemplo.test/sitemap.xml');
    expect(txt).toContain('Disallow: /api/');
  });
});
