import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

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

/** href de las etiquetas <a> (sin <script>), reducidos a rutas internas de página sin #ancla ni query. */
export function hrefsInternos(html: string): string[] {
  const limpio = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  const rutas = new Set<string>();
  for (const m of limpio.matchAll(/<a\b[^>]*?\shref="([^"]*)"/gi)) {
    const ruta = m[1].replace(/[#?].*$/, '');
    if (!ruta.startsWith('/') || ruta.startsWith('//') || ruta.startsWith('/_next/')) continue;
    if (/\.[a-z0-9]+$/i.test(ruta)) continue;
    rutas.add(ruta);
  }
  return [...rutas];
}

function existePagina(webDir: string, ruta: string): boolean {
  const limpia = ruta.replace(/^\/+|\/+$/g, '');
  if (limpia === '') return fs.existsSync(path.join(webDir, 'index.html'));
  return fs.existsSync(path.join(webDir, limpia, 'index.html')) || fs.existsSync(path.join(webDir, `${limpia}.html`));
}

/** Enlaces rotos como «origen.html -> /ruta/», ordenados. */
export function enlacesRotos(webDir: string, paginas: string[] = htmlDe(webDir)): string[] {
  const rotos = new Set<string>();
  for (const origen of paginas) {
    const html = fs.readFileSync(path.join(webDir, origen), 'utf8');
    for (const ruta of hrefsInternos(html)) if (!existePagina(webDir, ruta)) rotos.add(`${origen} -> ${ruta}`);
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
  it('extrae los href de <a> e ignora <script> y otras etiquetas', () => {
    const html =
      '<link href="/estilo/"><a class="x" href="/zonas/">Z</a><script>var a = \'<a href="/en-script/">\';</script>' +
      '<img src="/foto/"><a href="/contacto/#formulario">C</a>';
    expect(hrefsInternos(html).sort()).toEqual(['/contacto/', '/zonas/']);
  });

  it('solo cuenta rutas internas de página', () => {
    const html = [
      '/', '//cdn.test/x/', '/_next/static/a/', '/logo.svg', 'tel:+34600000000', 'mailto:a@b.test',
      'https://wa.me/34600000000?text=hola', '#ancla', '/zonas/?a=1',
    ]
      .map((h) => `<a href="${h}">x</a>`)
      .join('');
    expect(hrefsInternos(html).sort()).toEqual(['/', '/zonas/']);
  });

  it('detecta todos los enlaces rotos y acepta los válidos', () => {
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
  it('ningún enlace interno apunta a una ruta sin página generada', () => {
    if (!fs.existsSync(path.join(webDir, 'index.html'))) throw new Error('falta web/out: ejecuta `pnpm build` antes');
    const rotos = enlacesRotos(webDir, htmlDe(webDir)).filter((r) => !RUTAS_FICHA_SERVICIO.has(r.split(' -> ')[1]));
    expect(rotos).toEqual([]);
  });
});
