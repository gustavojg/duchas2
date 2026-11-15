import { copyFileSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { cargarServicios, contentDir } from './content.js';
import { rutaServicio, rutasCanonicas } from './rutas.js';
import { PAGES } from './site.js';

// Lo ejecuta el vitest de la raíz (lógica pura de web/src/lib).
describe('rutas', () => {
  it('rutasCanonicas() lleva todo PAGES y las páginas legales y Quiénes somos', () => {
    const rutas = rutasCanonicas();
    for (const p of PAGES) expect(rutas).toContain(p);
    for (const p of ['/quienes-somos/', '/aviso-legal/', '/privacidad/', '/cookies/']) expect(rutas).toContain(p);
  });

  it('una ruta por servicio, sin duplicados y con barra inicial y final', () => {
    expect(rutaServicio('a')).toBe('/servicios/a/');
    const rutas = rutasCanonicas([{ slug: 'a' }, { slug: 'a' }]);
    expect(rutas.filter((r) => r === '/servicios/a/')).toHaveLength(1);
    expect(new Set(rutas).size).toBe(rutas.length);
    for (const r of rutas) expect(r).toMatch(/^\/(.*\/)?$/);
  });
});

describe('cargarServicios()', () => {
  const previo = process.env.CONTENT_DIR;
  const dirs: string[] = [];
  /** Directorio de contenido temporal con el negocio.json real y, si se pasa, un servicios.json. */
  const directorio = (servicios?: unknown) => {
    const base = contentDir();
    const dir = mkdtempSync(join(tmpdir(), 'servicios-'));
    dirs.push(dir);
    copyFileSync(join(base, 'negocio.json'), join(dir, 'negocio.json'));
    if (servicios !== undefined) writeFileSync(join(dir, 'servicios.json'), JSON.stringify(servicios));
    process.env.CONTENT_DIR = dir;
  };
  afterEach(() => {
    if (previo === undefined) delete process.env.CONTENT_DIR;
    else process.env.CONTENT_DIR = previo;
    for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true });
  });

  it('lee los slugs de servicios.json', () => {
    directorio([
      { slug: 'plato-de-ducha', nombre: 'Plato de ducha', extra: 1 },
      { slug: 'banera', nombre: 'Bañera' },
    ]);
    expect(cargarServicios().map((s) => s.slug)).toEqual(['plato-de-ducha', 'banera']);
  });

  it('sin servicios.json devuelve []', () => {
    directorio();
    expect(cargarServicios()).toEqual([]);
  });

  it('un slug con ../ o con / hace fallar la carga', () => {
    directorio([{ slug: '../x', nombre: 'X' }]);
    expect(() => cargarServicios()).toThrow();
  });

  it('un slug con caracteres XML hace fallar la carga', () => {
    directorio([{ slug: 'a<b', nombre: 'X' }]);
    expect(() => cargarServicios()).toThrow();
  });
});
