import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { canonicalUrl, normalizarBase, PAGES, paginasDelSitio, robotsTxt, sitemapXml } from './site.js';

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

  it('canonicalUrl une la URL base y la ruta sin duplicar la barra', () => {
    expect(canonicalUrl('https://ejemplo.test', '/contacto/')).toBe('https://ejemplo.test/contacto/');
    expect(canonicalUrl('https://ejemplo.test/', '/contacto/')).toBe('https://ejemplo.test/contacto/');
    expect(canonicalUrl('https://ejemplo.test/', '/')).toBe('https://ejemplo.test/');
  });

  it('el canonical de cada página coincide con su <loc> del sitemap', () => {
    const xml = sitemapXml('https://ejemplo.test');
    for (const p of PAGES) expect(xml).toContain(`<loc>${canonicalUrl('https://ejemplo.test', p)}</loc>`);
  });

  it('robots.txt apunta al sitemap y excluye la API', () => {
    const txt = robotsTxt('https://ejemplo.test');
    expect(txt).toContain('Sitemap: https://ejemplo.test/sitemap.xml');
    expect(txt).toContain('Disallow: /api/');
  });

  it('normalizarBase quita las barras finales', () => {
    expect(normalizarBase('https://ejemplo.test/')).toBe('https://ejemplo.test');
    expect(normalizarBase('https://ejemplo.test//')).toBe('https://ejemplo.test');
    expect(normalizarBase('https://ejemplo.test')).toBe('https://ejemplo.test');
  });

  it('canonicalUrl une la base normalizada y la ruta con barra final', () => {
    expect(canonicalUrl('https://ejemplo.test/', '/zonas/')).toBe('https://ejemplo.test/zonas/');
    expect(canonicalUrl('https://ejemplo.test', '/')).toBe('https://ejemplo.test/');
    expect(canonicalUrl('https://ejemplo.test', '/zonas')).toBe('https://ejemplo.test/zonas/');
  });

  it('sitemap y robots dan lo mismo con y sin barra final en la base', () => {
    const xml = sitemapXml('https://ejemplo.test/');
    expect(xml).toContain('<loc>https://ejemplo.test/zonas/</loc>');
    expect(xml).not.toContain('//zonas');
    expect(xml).toBe(sitemapXml('https://ejemplo.test'));
    const txt = robotsTxt('https://ejemplo.test/');
    expect(txt).toContain('Sitemap: https://ejemplo.test/sitemap.xml');
    expect(txt).toBe(robotsTxt('https://ejemplo.test'));
  });

  it('cada <loc> del sitemap es el canonicalUrl de su página', () => {
    const xml = sitemapXml('https://ejemplo.test/');
    for (const p of PAGES) expect(xml).toContain(`<loc>${canonicalUrl('https://ejemplo.test', p)}</loc>`);
  });

  describe('paginasDelSitio', () => {
    const fixture = [
      { ruta: '/platos-de-ducha/', tipo: 'principal' },
      { ruta: '/servicios/uno/', tipo: 'servicio' },
      { ruta: '/servicios/dos/', tipo: 'servicio' },
      { ruta: '/hoteles-y-comunidades/', tipo: 'empresas' },
    ];

    it('añade una ruta por servicio de tipo servicio, con / primero y /contacto/ al final, sin repetir', () => {
      const p = paginasDelSitio(fixture);
      expect(p).toContain('/servicios/uno/');
      expect(p).toContain('/servicios/dos/');
      expect(p.filter((r) => r.startsWith('/servicios/'))).toHaveLength(2);
      expect(p[0]).toBe('/');
      expect(p.at(-1)).toBe('/contacto/');
      expect(new Set(p).size).toBe(p.length);
      for (const r of PAGES) expect(p).toContain(r);
    });

    it('un servicio nuevo en el fixture trae su ruta, y conserva el orden', () => {
      const p = paginasDelSitio([...fixture, { ruta: '/servicios/tres/', tipo: 'servicio' }]);
      expect(p).toContain('/servicios/tres/');
      expect(p.indexOf('/servicios/uno/')).toBeLessThan(p.indexOf('/servicios/tres/'));
      expect(p.indexOf('/servicios/tres/')).toBeLessThan(p.indexOf('/contacto/'));
    });

    it('no duplica rutas repetidas ni muta PAGES', () => {
      const antes = [...PAGES];
      const p = paginasDelSitio([...fixture, { ruta: '/servicios/uno/', tipo: 'servicio' }]);
      expect(p.filter((r) => r === '/servicios/uno/')).toHaveLength(1);
      expect(PAGES).toEqual(antes);
    });
  });

  it('PAGES incluye /hoteles-y-comunidades/ y /antes-y-despues/ antes de /contacto/', () => {
    expect(PAGES).toContain('/hoteles-y-comunidades/');
    expect(PAGES).toContain('/antes-y-despues/');
    expect(PAGES.at(-1)).toBe('/contacto/');
  });
});
