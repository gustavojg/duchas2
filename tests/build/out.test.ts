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

  const contenido = (f: string) => JSON.parse(fs.readFileSync(path.resolve('web/content', f), 'utf8'));
  /** HTML visible: sin <script> (el payload RSC repite textos y lleva plantillas ICU con «{{»). */
  const visible = (html: string) => html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
  const sinEntidades = (html: string) => html.replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');

  it('/zonas/ sirve HTML con un H1 y todos los distritos y municipios de zonas.json', async () => {
    const res = await app.request('/zonas/');
    expect(res.status).toBe(200);
    const html = sinEntidades(visible(await res.text()));
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    const zonas = contenido('zonas.json') as { madrid_capital: string[]; municipios: string[] };
    for (const z of [...zonas.madrid_capital, ...zonas.municipios]) expect(html).toContain(z);
    expect(html).not.toContain('PENDIENTE');
    expect(html).not.toContain('{{');
  });

  it('la portada lleva los servicios de servicios.json y las secciones nuevas, sin pendientes', () => {
    const html = sinEntidades(visible(fs.readFileSync(path.join(webDir, 'index.html'), 'utf8')));
    const servicios = contenido('servicios.json') as { nombre: string }[];
    expect(servicios).toHaveLength(10);
    for (const s of servicios) expect(html).toContain(s.nombre);
    for (const h of ['¿Reparar o cambiar?', 'Cómo trabajamos', 'Precios orientativos']) expect(html).toContain(h);
    // La cifra sin confirmar de comparativa.json no se publica.
    const comparativa = contenido('comparativa.json') as { filas: { id: string; cambiar: { valor: string | null; confirmado: boolean } }[] };
    const coste = comparativa.filas.find((f) => f.id === 'coste')!;
    if (!coste.cambiar.confirmado && coste.cambiar.valor) expect(html).not.toContain(coste.cambiar.valor);
    expect(html).not.toContain('PENDIENTE');
    expect(html).not.toContain('{{');
    expect(html).not.toMatch(/\b0 años/);
  });

  it('el sitemap incluye /zonas/', async () => {
    expect(await (await app.request('/sitemap.xml')).text()).toMatch(/<loc>[^<]*\/zonas\/<\/loc>/);
  });

  it('/preguntas-frecuentes/ se exporta con su FAQPage, sin pendientes y en el sitemap', async () => {
    expect(fs.existsSync(path.join(webDir, 'preguntas-frecuentes', 'index.html'))).toBe(true);
    const res = await app.request('/preguntas-frecuentes/');
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('"@type":"FAQPage"');
    expect(html).toMatch(/<h1[^>]*>(?:(?!<\/h1>).)*Preguntas frecuentes/s);
    const sinScripts = visible(html);
    expect(sinScripts).not.toContain('PENDIENTE');
    expect(sinScripts).not.toContain('{{');
    expect(await (await app.request('/sitemap.xml')).text()).toContain('/preguntas-frecuentes/');
  });

  it('la portada lleva LocalBusiness sin AggregateRating, el antes/después y la FAQ resumida', () => {
    const html = fs.readFileSync(path.join(webDir, 'index.html'), 'utf8');
    expect(html).toContain('"@type":"LocalBusiness"');
    expect(html).not.toContain('AggregateRating'); // web/content/resenas.json está vacío
    // Sin <script>: el payload RSC lleva el catálogo i18n de Astryx, cuyas plantillas ICU usan «{{».
    const visible = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
    expect(visible).toContain('Pronto, fotos reales de este trabajo');
    expect(visible).toContain('href="/preguntas-frecuentes/"');
    expect(visible).not.toContain('PENDIENTE');
    expect(visible).not.toContain('{{');
  });

  const ldTipos = (html: string) =>
    [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(
      (m) => (JSON.parse(m[1]) as { '@type': string })['@type'],
    );

  it.each([
    ['/platos-de-ducha/', ['Service', 'FAQPage', 'BreadcrumbList']],
    ['/tarifas/', ['BreadcrumbList']],
  ])('%s se exporta con un H1, canonical, JSON-LD parseable y en el sitemap', async (ruta, tipos) => {
    const res = await app.request(ruta);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(html).toMatch(new RegExp(`<link rel="canonical" href="https?://[^"]+${ruta}"`));
    expect(ldTipos(html).sort()).toEqual([...tipos].sort());
    expect(html).toMatch(/<nav[^>]*aria-label="Migas de pan"/);
    const sinScripts = visible(html);
    expect(sinScripts).not.toContain('PENDIENTE');
    expect(sinScripts).not.toContain('{{');
    expect(await (await app.request('/sitemap.xml')).text()).toContain(ruta);
  });

  it('/health sigue respondiendo JSON', async () => {
    expect(await (await app.request('/health')).json()).toMatchObject({ ok: true });
  });
});
