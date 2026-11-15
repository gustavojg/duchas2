import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { testApp } from '../../src/testing.js';
import { configFormulario } from '../../web/src/lib/config.js';
import { cargarNegocio, cargarServicios } from '../../web/src/lib/content.js';
import { rutasCanonicas } from '../../web/src/lib/rutas.js';
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

/** Rutas canónicas, SEO, borrador y teléfono único sobre el web/out de ejemplo (negocio.json sin confirmar). */
describe('web/out: rutas, SEO y modo borrador', () => {
  const { app } = testApp({ webDir });
  const negocio = cargarNegocio();
  const base = negocio.url_base.replace(/\/+$/, '');
  const rutas = rutasCanonicas(cargarServicios());
  const fichero = (ruta: string) => path.join(webDir, ruta, 'index.html');
  // Sin <script>: el payload RSC repite metadatos y lleva plantillas ICU con «{{».
  const sinScripts = (h: string) => h.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
  const html = (ruta: string) => sinScripts(fs.readFileSync(fichero(ruta), 'utf8'));
  const todos = () => rutas.map((r) => ({ ruta: r, html: html(r) }));

  it('cada ruta canónica tiene su HTML y responde 200', async () => {
    expect(rutas).toEqual(expect.arrayContaining(['/', '/quienes-somos/', '/aviso-legal/', '/privacidad/', '/cookies/']));
    for (const ruta of rutas) {
      expect(fs.existsSync(fichero(ruta)), ruta).toBe(true);
      expect((await app.request(ruta)).status, ruta).toBe(200);
    }
  });

  it('sitemap con todas las rutas sobre url_base y robots sin bloquear todo el sitio', async () => {
    const sitemap = await (await app.request('/sitemap.xml')).text();
    for (const ruta of rutas) expect(sitemap).toContain(`<loc>${base}${ruta}</loc>`);
    const robots = await (await app.request('/robots.txt')).text();
    expect(robots).toContain('Sitemap:');
    expect(robots).toContain('Disallow: /api/');
    expect(robots.split('\n').map((l) => l.trim())).not.toContain('Disallow: /');
  });

  it('en borrador todas las páginas llevan noindex, nofollow', () => {
    for (const p of todos()) expect(p.html, p.ruta).toContain('<meta name="robots" content="noindex, nofollow"');
  });

  it('title, description, canonical y Open Graph existen, son únicos y el canonical es url_base + ruta', () => {
    const extrae = (h: string, re: RegExp) => re.exec(h)?.[1];
    const campos: Record<string, RegExp> = {
      title: /<title>([^<]+)<\/title>/,
      description: /<meta name="description" content="([^"]+)"/,
      canonical: /<link rel="canonical" href="([^"]+)"/,
      'og:title': /<meta property="og:title" content="([^"]+)"/,
      'og:description': /<meta property="og:description" content="([^"]+)"/,
      'og:url': /<meta property="og:url" content="([^"]+)"/,
    };
    const paginas = todos();
    for (const [campo, re] of Object.entries(campos)) {
      const valores = paginas.map((p) => {
        const v = extrae(p.html, re);
        expect(v, `${campo} en ${p.ruta}`).toBeTruthy();
        return v;
      });
      expect(new Set(valores).size, campo).toBe(paginas.length);
    }
    for (const p of paginas) {
      expect(extrae(p.html, campos.canonical)).toBe(`${base}${p.ruta}`);
      expect(extrae(p.html, campos['og:url'])).toBe(`${base}${p.ruta}`);
    }
  });

  it('todo número con forma de teléfono es el de negocio.json', () => {
    const TELEFONO = /(?:\+34|0034)?[\s.-]?[6-9]\d{2}[\s.-]?\d{3}[\s.-]?\d{3}/g;
    const nueve = (s: string) => s.replace(/\D/g, '').slice(-9);
    const unico = nueve(negocio.telefono.valor!);
    for (const p of todos()) {
      for (const m of p.html.matchAll(TELEFONO)) expect(nueve(m[0]), `${p.ruta}: «${m[0]}»`).toBe(unico);
    }
  });

  it('sin ga4_id no hay rastro de Google Analytics', () => {
    expect(negocio.analitica.ga4_id).toBeNull();
    for (const ruta of rutas) {
      const crudo = fs.readFileSync(fichero(ruta), 'utf8');
      expect(crudo, ruta).not.toContain('googletagmanager');
      expect(crudo, ruta).not.toContain('gtag(');
    }
  });

  it('ninguna página muestra PENDIENTE ni «{{»', () => {
    for (const p of todos()) {
      expect(p.html, p.ruta).not.toContain('PENDIENTE');
      expect(p.html, p.ruta).not.toContain('{{');
    }
  });

  it('privacidad dice la retención de config y todas las páginas llevan el pie con la retención', () => {
    expect(html('/privacidad/')).toContain(`${configFormulario().retencion_dias} días`);
    for (const p of todos()) expect(p.html, p.ruta).toContain('Guardamos tu foto');
  });

  it('el postbuild termina bien y avisa del modo borrador', () => {
    const r = spawnSync('pnpm', ['exec', 'tsx', 'scripts/postbuild.ts'], {
      env: { ...process.env, WEB_DIR: webDir },
      encoding: 'utf8',
    });
    const salida = `${r.stdout}${r.stderr}`;
    expect(r.status, salida).toBe(0);
    expect(salida).toContain('⚠ MODO BORRADOR: faltan');
    expect(salida).toContain('razón social');
  }, 60_000);
});
