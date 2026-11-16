import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { testApp } from '../../src/testing.js';
import { configFormulario } from '../../web/src/lib/config.js';
import { cargarNegocio, cargarServicios } from '../../web/src/lib/content.js';
import { rutaDeServicio, rutasCanonicas } from '../../web/src/lib/rutas.js';
import { APP_NAME, canonicalUrl, PAGES } from '../../web/src/lib/site.js';

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

  it('todas las páginas de PAGES llevan un único canonical = url_base + ruta', () => {
    const base = (contenido('negocio.json') as { url_base: string }).url_base.replace(/\/+$/, '');
    const vistos = new Set<string>();
    for (const ruta of PAGES) {
      const html = fs.readFileSync(path.join(webDir, ruta, 'index.html'), 'utf8');
      const canonicals = [...html.matchAll(/<link\b[^>]*\brel="canonical"[^>]*>/g)].map((m) => /href="([^"]*)"/.exec(m[0])?.[1]);
      expect(canonicals, `canonical en ${ruta}`).toEqual([`${base}${ruta}`]);
      vistos.add(canonicals[0]!);
    }
    expect(vistos.size).toBe(PAGES.length);
  });

  it('todas las páginas de PAGES llevan un único canonical', async () => {
    const { url_base } = contenido('negocio.json') as { url_base: string };
    for (const p of PAGES) {
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

  it('/health sigue respondiendo JSON', async () => {
    expect(await (await app.request('/health')).json()).toMatchObject({ ok: true });
  });
});

/** Rutas canónicas, SEO, borrador y teléfono único sobre el web/out de ejemplo (negocio.json sin confirmar). */
describe('web/out: rutas, SEO y modo borrador', () => {
  const { app } = testApp({ webDir });
  const negocio = cargarNegocio();
  const base = negocio.url_base.replace(/\/+$/, '');
  // Como postbuild: los servicios de servicios.json sin página construida todavía no cuentan como ruta canónica.
  const rutas = rutasCanonicas(cargarServicios().filter((s) => fs.existsSync(path.join(webDir, rutaDeServicio(s), 'index.html'))));
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

  describe('enlaces internos', () => {
    const internos = (h: string) =>
      [...h.matchAll(/href="(\/[^"]*)"/g)].map((m) => m[1]).filter((href) => !href.startsWith('//') && !href.startsWith('/_next/'));
    const existe = (href: string) => {
      const destino = decodeURIComponent(href.replace(/[?#].*$/, ''));
      const f = path.join(webDir, destino);
      return fs.existsSync(path.join(f, 'index.html')) || (fs.existsSync(f) && fs.statSync(f).isFile());
    };
    // Destinos que enlaza el cuerpo de la portada (galería y tarjetas de servicio, de otras entregas) y cuya
    // página aún no existe. Se quitan de aquí al crear cada página; la navegación y el pie no tienen excepción.
    const PAGINAS_PENDIENTES = new Set(['/antes-y-despues/', ...cargarServicios().map((s) => rutaDeServicio(s))]);

    it('la navegación y el pie de cada página solo enlazan a páginas o ficheros que existen', () => {
      for (const p of todos()) {
        const navs = [...p.html.matchAll(/<nav\b[^>]*>[\s\S]*?<\/nav>/g)].map((m) => m[0]);
        expect(navs.length, p.ruta).toBeGreaterThan(0);
        for (const href of navs.flatMap(internos)) expect(existe(href), `${p.ruta} enlaza a ${href}`).toBe(true);
      }
    });

    it('todo enlace interno apunta a una página o fichero que existe en web/out', () => {
      for (const p of todos()) {
        for (const href of internos(p.html)) {
          if (PAGINAS_PENDIENTES.has(href)) continue;
          expect(existe(href), `${p.ruta} enlaza a ${href}`).toBe(true);
        }
      }
    });
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
