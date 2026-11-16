import fs from 'node:fs';
import path from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { cargarServicios } from '../../web/src/lib/content.js';
import { rutaDeServicio, rutasCanonicas } from '../../web/src/lib/rutas.js';
import { construirFixtureConSalida } from './construir-fixture.js';

/**
 * Build de fixture: web/content con negocio.json completo (datos legales, teléfono, garantía y ga4_id) en
 * web/out-fixture (tests/build/construir-fixture.ts). Comprueba lo que el build de ejemplo (en borrador y sin
 * ga4_id) no puede: sin noindex, sin aviso de borrador y sin GA en el HTML estático aunque haya ga4_id.
 * No ejecutar a la vez que el e2e de :3101, que también reconstruye web/out-fixture.
 */
const webDir = path.resolve('web/out-fixture');
let salidaPostbuild = '';

beforeAll(() => {
  ({ salidaPostbuild } = construirFixtureConSalida());
}, 600_000);

/** Todos los .html del export, salvo los de /_next. */
function htmls(dir = webDir): string[] {
  return fs
    .readdirSync(dir, { recursive: true, encoding: 'utf8' })
    .map((f) => f.split('\\').join('/'))
    .filter((f) => f.endsWith('.html') && !f.startsWith('_next/'))
    .map((f) => path.join(dir, f));
}

const sinScripts = (h: string) => h.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');

describe('web/out-fixture (negocio completo con ga4_id)', () => {
  // Como postbuild y out.test.ts: los servicios sin página construida no cuentan como ruta canónica.
  const rutas = () =>
    rutasCanonicas(cargarServicios().filter((s) => fs.existsSync(path.join(webDir, rutaDeServicio(s), 'index.html'))));
  const html = (ruta: string) => fs.readFileSync(path.join(webDir, ruta, 'index.html'), 'utf8');

  it('hay HTML de todas las rutas canónicas', () => {
    expect(rutas()).toEqual(expect.arrayContaining(['/', '/aviso-legal/', '/privacidad/', '/cookies/']));
    for (const r of rutas()) expect(fs.existsSync(path.join(webDir, r, 'index.html')), r).toBe(true);
  });

  it('ningún HTML lleva noindex (salvo las páginas de error, que Next marca noindex por su cuenta)', () => {
    const ERROR = new Set(['404.html', '404/index.html', '_not-found/index.html'].map((f) => path.join(webDir, f)));
    const todos = htmls().filter((f) => !ERROR.has(f));
    expect(todos.length).toBeGreaterThanOrEqual(rutas().length);
    for (const f of todos) expect(fs.readFileSync(f, 'utf8'), f).not.toContain('noindex');
  });

  it('el postbuild no avisa del modo borrador', () => {
    expect(salidaPostbuild).toContain('postbuild: sitemap.xml');
    expect(salidaPostbuild).not.toContain('MODO BORRADOR');
  });

  it('existen sitemap.xml y robots.txt', () => {
    expect(fs.readFileSync(path.join(webDir, 'sitemap.xml'), 'utf8')).toContain('<urlset');
    expect(fs.readFileSync(path.join(webDir, 'robots.txt'), 'utf8')).toContain('Sitemap:');
  });

  it('todo número con forma de teléfono es el del fixture (+34611222333)', () => {
    const TELEFONO = /(?:\+34|0034)?[\s.-]?[6-9]\d{2}[\s.-]?\d{3}[\s.-]?\d{3}/g;
    const nueve = (s: string) => s.replace(/\D/g, '').slice(-9);
    const unico = nueve('+34611222333');
    let vistos = 0;
    for (const r of rutas()) {
      for (const m of sinScripts(html(r)).matchAll(TELEFONO)) {
        vistos++;
        expect(nueve(m[0]), `${r}: «${m[0]}»`).toBe(unico);
      }
    }
    expect(vistos).toBeGreaterThan(0);
  });

  it('los <title> de las rutas canónicas son únicos', () => {
    const titulos = rutas().map((r) => /<title>([^<]+)<\/title>/.exec(html(r))?.[1]);
    for (const [i, t] of titulos.entries()) expect(t, rutas()[i]).toBeTruthy();
    expect(new Set(titulos).size).toBe(titulos.length);
  });

  it('ningún HTML (crudo, con scripts) carga GA aunque haya ga4_id', () => {
    for (const f of htmls()) {
      const crudo = fs.readFileSync(f, 'utf8');
      expect(crudo, f).not.toContain('googletagmanager');
      expect(crudo, f).not.toContain('gtag(');
    }
  });

  it('la privacidad muestra la razón social del fixture', () => {
    expect(sinScripts(html('/privacidad/'))).toContain('Reformas Fixture S.L.');
  });
});
