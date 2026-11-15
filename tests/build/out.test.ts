import fs from 'node:fs';
import path from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { testApp } from '../../src/testing.js';
import { APP_NAME } from '../../web/src/lib/site.js';

/** `pnpm test:build`: el web/out real (tras `pnpm build`) servido por la app Hono, con app.request(). */
const webDir = path.resolve('web/out');

describe('web/out servido por Hono', () => {
  beforeAll(() => {
    if (!fs.existsSync(path.join(webDir, 'index.html'))) throw new Error('falta web/out: ejecuta `pnpm build` antes');
  });
  const { app } = testApp({ webDir });

  it('la portada es HTML estático con el marco de Astryx', async () => {
    const res = await app.request('/');
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toMatch(/<h1[^>]*>(?:(?!<\/h1>).)*plato de ducha se repara/s);
    expect(html).toContain(APP_NAME);
    expect(html).toMatch(/<main[\s>]|role="main"/);
    expect(html).toMatch(/<nav[^>]*aria-label="[^"]+"/);
    expect(html).toContain('data-astryx-theme="neutral"');
  });

  it('el HTML público no muestra datos pendientes ni cifras vacías', () => {
    // Sin <script>: el payload RSC lleva el catálogo i18n de Astryx, cuyas plantillas ICU usan «{{».
    const html = fs.readFileSync(path.join(webDir, 'index.html'), 'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
    expect(html).toContain('Garantía por escrito');
    expect(html).not.toContain('PENDIENTE');
    expect(html).not.toContain('{{');
    expect(html).not.toMatch(/\b0 años/);
  });

  it('la portada enlaza a WhatsApp y al teléfono', () => {
    const html = fs.readFileSync(path.join(webDir, 'index.html'), 'utf8');
    expect(html).toMatch(/href="https:\/\/wa\.me\/\d+\?text=/);
    expect(html).toMatch(/href="tel:\+34\d{9}"/);
  });

  it('enlaza CSS de /_next/static servido con caché immutable', async () => {
    const html = await (await app.request('/')).text();
    const css = /href="(\/_next\/static\/[^"]+\.css)"/.exec(html)?.[1];
    expect(css, 'la portada no enlaza ningún CSS de /_next/static').toBeDefined();
    const res = await app.request(css!);
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toContain('immutable');
    // Next puede partir globals.css en varios chunks: se comprueban todos juntos.
    const links = [...html.matchAll(/href="(\/_next\/static\/[^"]+\.css)"/g)].map((m) => m[1]);
    const body = (await Promise.all(links.map(async (l) => (await app.request(l)).text()))).join('\n');
    expect(body).toContain('Figtree Variable');
    expect(body).toContain('Archivo Variable');
    expect(body).toContain('--color-tape');
  });

  it('las rutas desconocidas dan 404 con la página de Next', async () => {
    const res = await app.request('/no-existe/');
    expect(res.status).toBe(404);
    expect(await res.text()).toContain('No encontramos esta página');
  });

  it('postbuild genera sitemap.xml y robots.txt', async () => {
    expect(await (await app.request('/sitemap.xml')).text()).toContain('<urlset');
    expect(await (await app.request('/robots.txt')).text()).toContain('Sitemap:');
  });

  it('/health sigue respondiendo JSON', async () => {
    expect(await (await app.request('/health')).json()).toMatchObject({ ok: true });
  });
});
