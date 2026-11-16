import fs from 'node:fs';
import path from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { testApp } from '../../src/testing.js';
import { cargarServicios } from '../../web/src/lib/content.js';
import { APP_NAME, canonicalUrl, paginasDelSitio } from '../../web/src/lib/site.js';

/** `pnpm test:build`: el web/out real (tras `pnpm build`) servido por la app Hono, con app.request(). */
const webDir = path.resolve('web/out');
/** Páginas del sitio: PAGINAS más una por servicio de tipo 'servicio' de servicios.json. */
const servicios = cargarServicios();
const PAGINAS = paginasDelSitio(servicios);

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

  it('todas las páginas del sitio llevan un único canonical = url_base + ruta', () => {
    const base = (contenido('negocio.json') as { url_base: string }).url_base.replace(/\/+$/, '');
    const vistos = new Set<string>();
    for (const ruta of PAGINAS) {
      const html = fs.readFileSync(path.join(webDir, ruta, 'index.html'), 'utf8');
      const canonicals = [...html.matchAll(/<link\b[^>]*\brel="canonical"[^>]*>/g)].map((m) => /href="([^"]*)"/.exec(m[0])?.[1]);
      expect(canonicals, `canonical en ${ruta}`).toEqual([`${base}${ruta}`]);
      vistos.add(canonicals[0]!);
    }
    expect(vistos.size).toBe(PAGINAS.length);
  });

  it('todas las páginas del sitio llevan un único canonical', async () => {
    const { url_base } = contenido('negocio.json') as { url_base: string };
    for (const p of PAGINAS) {
      const html = await (await app.request(p)).text();
      const canonicals = [...html.matchAll(/<link\b[^>]*\brel="canonical"[^>]*>/g)].map((m) => /\bhref="([^"]*)"/.exec(m[0])?.[1]);
      expect(canonicals, p).toEqual([canonicalUrl(url_base, p)]);
    }
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

  const urlBase = (contenido('negocio.json') as { url_base: string }).url_base.replace(/\/+$/, '');
  /** HTML exportado de una ruta del sitio: web/out/index.html para '/', web/out/<ruta>/index.html para el resto. */
  const htmlDe = (ruta: string) => fs.readFileSync(path.join(webDir, ruta, 'index.html'), 'utf8');
  const canonicalDe = (ruta: string) => /<link rel="canonical" href="([^"]*)"\/?>/.exec(htmlDe(ruta))?.[1];

  it('cada página del sitio lleva su canonical absoluto con url_base y barra final', () => {
    expect(htmlDe('/zonas/')).toContain(`<link rel="canonical" href="${urlBase}/zonas/"/>`);
    for (const ruta of PAGINAS) expect(canonicalDe(ruta), ruta).toBe(`${urlBase}${ruta}`);
  });

  it('la página 404 no lleva canonical (no inventa una ruta fuera del sitio)', () => {
    expect(fs.readFileSync(path.join(webDir, '404.html'), 'utf8')).not.toContain('rel="canonical"');
  });

  it('sitemap.xml y robots.txt usan url_base de negocio.json, no BASE_URL del servidor', async () => {
    const xml = await (await app.request('/sitemap.xml')).text();
    const locs = [...xml.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]);
    expect(locs.length).toBeGreaterThan(0);
    for (const loc of locs) expect(loc.startsWith(`${urlBase}/`), loc).toBe(true);
    const robots = await (await app.request('/robots.txt')).text();
    expect(robots).toContain(`Sitemap: ${urlBase}/sitemap.xml`);
  });

  it('canonical y sitemap comparten base', async () => {
    const xml = await (await app.request('/sitemap.xml')).text();
    const locs = [...xml.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]);
    const robots = await (await app.request('/robots.txt')).text();
    const sitemapDeRobots = /^Sitemap: (\S+)$/m.exec(robots)?.[1];
    expect(locs.length, 'sitemap.xml sin <loc>').toBeGreaterThan(0);
    expect(sitemapDeRobots, 'robots.txt sin línea Sitemap:').toBeDefined();

    const canonicals = PAGINAS.map((ruta) => {
      const c = canonicalDe(ruta);
      expect(c, `${ruta} sin canonical`).toBeDefined();
      return c!;
    });
    const origen = new URL(urlBase).origin;
    const origenes = [...canonicals, locs[0], sitemapDeRobots!].map((u) => new URL(u).origin);
    for (const o of origenes) expect(o).toBe(origen);

    // Cada <loc> es exactamente el canonical de su página, y el sitemap lista todas las del sitio.
    expect(locs).toEqual(canonicals);
  });

  const deTipoServicio = servicios.filter((s) => s.tipo === 'servicio');

  it('existe un HTML por cada servicio de tipo servicio, con un H1 y JSON-LD Service y BreadcrumbList', async () => {
    expect(deTipoServicio.length).toBeGreaterThan(0);
    for (const s of deTipoServicio) {
      expect(fs.existsSync(path.join(webDir, 'servicios', s.slug, 'index.html')), s.ruta).toBe(true);
      const res = await app.request(s.ruta);
      expect(res.status, s.ruta).toBe(200);
      const html = await res.text();
      expect(html.match(/<h1[\s>]/g), s.ruta).toHaveLength(1);
      expect(ldTipos(html).sort(), s.ruta).toEqual(['BreadcrumbList', 'Service']);
      const sinScripts = visible(html);
      expect(sinScripts).not.toContain('PENDIENTE');
      expect(sinScripts).not.toContain('{{');
    }
    expect((await app.request('/servicios/no-existe/')).status).toBe(404);
  });

  it('los <title> de las páginas de servicio son únicos', () => {
    const titulos = deTipoServicio.map((s) => /<title>([^<]*)<\/title>/.exec(htmlDe(s.ruta))?.[1]);
    for (const [i, t] of titulos.entries()) expect(t, deTipoServicio[i].ruta).toBeTruthy();
    expect(new Set(titulos).size).toBe(deTipoServicio.length);
  });

  it('/hoteles-y-comunidades/ existe y no tiene sección «Referencias» mientras referencias.json esté vacío', () => {
    const html = visible(htmlDe('/hoteles-y-comunidades/'));
    expect(html).toMatch(/<h1[^>]*>Renovamos bañeras de hotel sin cerrar habitaciones<\/h1>/);
    if ((contenido('referencias.json') as unknown[]).length === 0) expect(html).not.toContain('Referencias');
  });

  it('/antes-y-despues/ se exporta con un H1, el filtro y el sitemap la lista', async () => {
    const html = visible(htmlDe('/antes-y-despues/'));
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(html).toContain('Filtrar por trabajo');
    expect(await (await app.request('/sitemap.xml')).text()).toContain('/antes-y-despues/');
  });

  it('/health sigue respondiendo JSON', async () => {
    expect(await (await app.request('/health')).json()).toMatchObject({ ok: true });
  });
});
