import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';

/** `pnpm test:build`: ningún enlace interno del HTML exportado apunta a una ruta sin página generada. */
const webDir = path.resolve('web/out');

/** Todos los *.html bajo `dir`, recursivo. */
export function htmlDe(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) return htmlDe(p);
    return d.name.endsWith('.html') ? [p] : [];
  });
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

/** ¿web/out sirve una página para `ruta`? <ruta>/index.html, <ruta>.html o el fichero exacto. */
export function existePagina(out: string, ruta: string): boolean {
  const rel = decodeURIComponent(ruta).replace(/^\/+|\/+$/g, '');
  const candidatos = [path.join(out, rel, 'index.html'), path.join(out, `${rel}.html`), path.join(out, rel)];
  return candidatos.some((c) => fs.existsSync(c) && fs.statSync(c).isFile());
}

/** 'página -> href' de cada enlace interno roto de las páginas dadas. */
export function enlacesRotos(out: string, paginas: { nombre: string; html: string }[]): string[] {
  return paginas.flatMap(({ nombre, html }) =>
    hrefsDeEnlaces(html)
      .filter((href) => {
        const ruta = rutaInterna(href);
        return ruta !== null && !existePagina(out, ruta);
      })
      .map((href) => `${nombre} -> ${href}`),
  );
}

describe('comprobación de enlaces (HTML sintético)', () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'enlaces-'));
  fs.writeFileSync(path.join(out, 'index.html'), '');
  fs.mkdirSync(path.join(out, 'zonas'));
  fs.writeFileSync(path.join(out, 'zonas', 'index.html'), '');
  fs.writeFileSync(path.join(out, '404.html'), '');

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
  });

  it('solo cuenta rutas internas de página', () => {
    expect(rutaInterna('/zonas/?a=1#mapa')).toBe('/zonas/');
    for (const href of ['mailto:a@b.c', 'tel:+34', 'https://x.es/', '#x', '//cdn/x', '/_next/static/a.css', '/favicon.ico', '/sitemap.xml', '/robots.txt', '/_not-found']) {
      expect(rutaInterna(href), href).toBeNull();
    }
  });

  it('detecta todos los enlaces rotos y acepta los válidos', () => {
    expect(enlacesRotos(out, [{ nombre: 'index.html', html }])).toEqual([
      'index.html -> /no-existe/',
      'index.html -> /servicios/azulejos/',
    ]);
    expect(enlacesRotos(out, [{ nombre: 'ok.html', html: '<a href="/">a</a><a href="tel:+34">b</a><a href="mailto:x@y.z">c</a>' }])).toEqual([]);
  });
});

describe('web/out: enlaces internos', () => {
  beforeAll(() => {
    if (!fs.existsSync(path.join(webDir, 'index.html'))) throw new Error('falta web/out: ejecuta `pnpm build` antes');
  });

  it('ningún enlace interno apunta a una ruta sin página generada', () => {
    const paginas = htmlDe(webDir).map((f) => ({ nombre: path.relative(webDir, f), html: fs.readFileSync(f, 'utf8') }));
    expect(paginas.length).toBeGreaterThan(0);
    expect(enlacesRotos(webDir, paginas)).toEqual([]);
  });
});
