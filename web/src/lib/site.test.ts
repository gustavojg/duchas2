import { describe, expect, it } from 'vitest';
import { PAGES, robotsTxt, sitemapXml } from './site.js';

// Lo ejecuta el vitest de la raíz (lógica pura de web/src/lib), no el de web/.
describe('site', () => {
  it('el sitemap lista cada página con la URL base', () => {
    const xml = sitemapXml('https://ejemplo.test');
    for (const p of PAGES) expect(xml).toContain(`<loc>https://ejemplo.test${p}</loc>`);
  });

  it('robots.txt apunta al sitemap y excluye la API', () => {
    const txt = robotsTxt('https://ejemplo.test');
    expect(txt).toContain('Sitemap: https://ejemplo.test/sitemap.xml');
    expect(txt).toContain('Disallow: /api/');
  });
});
