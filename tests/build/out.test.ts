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
    const name = APP_NAME.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    expect(html).toMatch(new RegExp(`<h1[^>]*>(?:(?!</h1>).)*${name}`, 's'));
    expect(html).toMatch(/<main[\s>]|role="main"/);
    expect(html).toMatch(/<nav[^>]*aria-label="[^"]+"/);
    expect(html).toContain('data-astryx-theme="neutral"');
  });

  it('enlaza CSS de /_next/static servido con caché immutable', async () => {
    const html = await (await app.request('/')).text();
    const css = /href="(\/_next\/static\/[^"]+\.css)"/.exec(html)?.[1];
    expect(css, 'la portada no enlaza ningún CSS de /_next/static').toBeDefined();
    const res = await app.request(css!);
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toContain('immutable');
    expect(await res.text()).toContain('Figtree Variable');
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
