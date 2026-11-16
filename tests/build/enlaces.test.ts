import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';

/**
 * `pnpm test:build`: ningún <a href> interno de web/out apunta a una ruta sin página generada. Solo cuentan
 * rutas de página (empiezan por «/», no «//», ni /_next/, ni ficheros con extensión); tel:, mailto: y https:
 * quedan fuera. Se ignoran el fragmento #ancla y la query.
 */
const webDir = path.resolve('web/out');

/** Ficheros .html bajo `dir` (relativos, con «/»), sin 404.html ni _next. */
export function htmlDe(dir: string, base = dir): string[] {
  const out: string[] = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, e.name);
    const rel = path.relative(base, abs).split(path.sep).join('/');
    if (e.isDirectory()) {
      if (e.name === '_next') continue;
      out.push(...htmlDe(abs, base));
    } else if (e.name.endsWith('.html') && rel !== '404.html') {
      out.push(rel);
    }
  }
  return out.sort();
}

/** href de las etiquetas <a> del HTML, sin contar lo que va dentro de <script>. */
export function hrefsDeEnlaces(html: string): string[] {
  const sinScripts = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  return [...sinScripts.matchAll(/<a\b[^>]*?\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)].map((m) => m[1] ?? m[2]);
}

/** Ruta interna de página (sin query ni hash), o null si es externa, ancla o un asset. */
export function rutaInterna(href: string): string | null {
  if (!href.startsWith('/') || href.startsWith('//')) return null; // mailto:, tel:, https:, #ancla, relativos
  const ruta = href.split(/[?#]/)[0];
  if (ruta.startsWith('/_next/') || ruta.startsWith('/_not-found')) return null;
  if (/\.[a-z0-9]+$/i.test(ruta.split('/').pop() ?? '')) return null; // .css, .ico, .xml, .txt...
  return ruta;
}

/** href de las etiquetas <a> (sin <script>), reducidos a rutas internas de página sin #ancla ni query. */
export function hrefsInternos(html: string): string[] {
  const rutas = new Set<string>();
  for (const href of hrefsDeEnlaces(html)) {
    const ruta = rutaInterna(href);
    if (ruta !== null) rutas.add(ruta);
  }
  return [...rutas];
}

/** ¿web/out sirve una página para `ruta`? <ruta>/index.html, <ruta>.html o el fichero exacto. */
export function existePagina(out: string, ruta: string): boolean {
  const rel = decodeURIComponent(ruta).replace(/^\/+|\/+$/g, '');
  const candidatos = [path.join(out, rel, 'index.html'), path.join(out, `${rel}.html`), path.join(out, rel)];
  return candidatos.some((c) => fs.existsSync(c) && fs.statSync(c).isFile());
}

type Pagina = string | { nombre: string; html: string };

/**
 * Enlaces rotos como «origen.html -> /ruta/», sin duplicados y ordenados. `paginas` son rutas relativas a
 * `out` (se leen del disco) o páginas ya en memoria ({ nombre, html }).
 */
export function enlacesRotos(out: string, paginas: Pagina[] = htmlDe(out)): string[] {
  const rotos = new Set<string>();
  for (const p of paginas) {
    const { nombre, html } = typeof p === 'string' ? { nombre: p, html: fs.readFileSync(path.join(out, p), 'utf8') } : p;
    for (const ruta of hrefsInternos(html)) if (!existePagina(out, ruta)) rotos.add(`${nombre} -> ${ruta}`);
  }
  return [...rotos].sort();
}

function sitioSintetico(ficheros: Record<string, string>): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'enlaces-'));
  for (const [rel, contenido] of Object.entries(ficheros)) {
    fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    fs.writeFileSync(path.join(dir, rel), contenido);
  }
  return dir;
}

describe('comprobación de enlaces (HTML sintético)', () => {
  const out = sitioSintetico({ 'index.html': '', 'zonas/index.html': '', '404.html': '' });

  const html = `
    <a href="/">Inicio</a>
    <a class="x" href="/zonas/?a=1#mapa">Zonas</a>
    <a href="/zonas">Zonas sin barra</a>
    <a href="/404">404</a>
    <a href="/no-existe/">Roto</a>
    <a href="/servicios/azulejos/">Roto 2</a>
    <a href="mailto:hola@example.com">Correo</a>
    <a href="tel:+34600000000">Llamar</a>
    <a href="https://wa.me/34600000000">WhatsApp</a>
    <a href="//cdn.example.com/x">CDN</a>
    <a href="#contacto">Ancla</a>
    <a href="/_next/static/chunks/a.js">Chunk</a>
    <a href="/favicon.ico">Icono</a>
    <link href="/estilos-rotos/" rel="x">
    <script>document.write('<a href="/en-script/">x</a>')</script>`;

  it('extrae los href de <a> e ignora <script> y otras etiquetas', () => {
    const hrefs = hrefsDeEnlaces(html);
    expect(hrefs).toContain('/');
    expect(hrefs).toContain('/no-existe/');
    expect(hrefs).not.toContain('/en-script/');
    expect(hrefs).not.toContain('/estilos-rotos/');

    const html2 =
      '<link href="/estilo/"><a class="x" href="/zonas/">Z</a><script>var a = \'<a href="/en-script/">\';</script>' +
      '<img src="/foto/"><a href="/contacto/#formulario">C</a>';
    expect(hrefsInternos(html2).sort()).toEqual(['/contacto/', '/zonas/']);
  });

  it('solo cuenta rutas internas de página', () => {
    expect(rutaInterna('/zonas/?a=1#mapa')).toBe('/zonas/');
    for (const href of ['mailto:a@b.c', 'tel:+34', 'https://x.es/', '#x', '//cdn/x', '/_next/static/a.css', '/favicon.ico', '/sitemap.xml', '/robots.txt', '/_not-found']) {
      expect(rutaInterna(href), href).toBeNull();
    }

    const html2 = [
      '/', '//cdn.test/x/', '/_next/static/a/', '/logo.svg', 'tel:+34600000000', 'mailto:a@b.test',
      'https://wa.me/34600000000?text=hola', '#ancla', '/zonas/?a=1',
    ]
      .map((h) => `<a href="${h}">x</a>`)
      .join('');
    expect(hrefsInternos(html2).sort()).toEqual(['/', '/zonas/']);
  });

  it('detecta todos los enlaces rotos y acepta los válidos', () => {
    expect(enlacesRotos(out, [{ nombre: 'index.html', html }])).toEqual([
      'index.html -> /no-existe/',
      'index.html -> /servicios/azulejos/',
    ]);
    expect(enlacesRotos(out, [{ nombre: 'ok.html', html: '<a href="/">a</a><a href="tel:+34">b</a><a href="mailto:x@y.z">c</a>' }])).toEqual([]);

    const dir = sitioSintetico({
      'index.html': '<a href="/">i</a><a href="/zonas/">z</a><a href="/falta/">f</a><a href="/plana/">p</a>',
      'zonas/index.html': '<a href="/otra-que-falta/#x">o</a><a href="/zonas/">z</a>',
      'plana.html': '<a href="/">i</a>',
      '404.html': '<a href="/no-cuenta/">n</a>',
      '_next/x.html': '<a href="/tampoco/">t</a>',
    });
    expect(htmlDe(dir)).toEqual(['index.html', 'plana.html', 'zonas/index.html']);
    expect(enlacesRotos(dir)).toEqual(['index.html -> /falta/', 'zonas/index.html -> /otra-que-falta/']);
  });
});

/**
 * Fichas de servicio (`ruta` de web/content/servicios.json): las tarjetas de la portada ya enlazan a ellas pero
 * sus páginas son una entrega aparte. Se excluyen solo esas rutas, sacadas del contenido, no a mano.
 */
const RUTAS_FICHA_SERVICIO = new Set(
  (JSON.parse(fs.readFileSync(path.resolve('web/content/servicios.json'), 'utf8')) as { ruta: string }[]).map((s) => s.ruta),
);

describe('web/out: enlaces internos', () => {
  beforeAll(() => {
    if (!fs.existsSync(path.join(webDir, 'index.html'))) throw new Error('falta web/out: ejecuta `pnpm build` antes');
  });

  it('ningún enlace interno apunta a una ruta sin página generada', () => {
    const paginas = htmlDe(webDir);
    expect(paginas.length).toBeGreaterThan(0);
    const rotos = enlacesRotos(webDir, paginas).filter((r) => !RUTAS_FICHA_SERVICIO.has(r.split(' -> ')[1]));
    expect(rotos).toEqual([]);
  });
});
