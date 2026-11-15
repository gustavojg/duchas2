import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Guarda de estilos (ADR 0004, brain/design.md § Reglas): en web/src no hay hex, px, rem, `style=` ni
 * `<div>`/`<span>` sueltos. Excepciones: globals.css (tokens) y art.tsx (SVG con var(--…)). Las composiciones
 * registradas en docs/astryx-componentes.md pueden usar <div>/<span>, pero el resto de la regla les aplica.
 */

const REGLAS: { nombre: string; re: RegExp; contenedor?: boolean }[] = [
  { nombre: 'hex', re: /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g },
  { nombre: 'px', re: /\d+px\b/g },
  { nombre: 'rem', re: /\d+rem\b/g },
  { nombre: 'style=', re: /style=/g },
  { nombre: '<div', re: /<div\b/g, contenedor: true },
  { nombre: '<span', re: /<span\b/g, contenedor: true },
];

export interface Infraccion {
  regla: string;
  texto: string;
}

/** Infracciones de estilo en un texto. Con `permitirContenedores`, <div>/<span> no cuentan (composiciones). */
export function infracciones(texto: string, { permitirContenedores = false } = {}): Infraccion[] {
  const out: Infraccion[] = [];
  for (const r of REGLAS) {
    if (permitirContenedores && r.contenedor) continue;
    for (const m of texto.matchAll(r.re)) out.push({ regla: r.nombre, texto: m[0] });
  }
  return out;
}

const WEB = process.cwd();
const SRC = join(WEB, 'src');
const EXENTOS = new Set(['src/app/globals.css', 'src/ui/art.tsx']);

/** Ficheros de composición registrados en la tabla «Composiciones registradas» del documento D0. */
function composiciones(): Set<string> {
  const md = readFileSync(join(WEB, '..', 'docs', 'astryx-componentes.md'), 'utf8');
  const seccion = md.split('## Composiciones registradas')[1] ?? '';
  return new Set([...seccion.matchAll(/`web\/(src\/ui\/[^`]+\.tsx?)`/g)].map((m) => m[1]));
}

describe('infracciones()', () => {
  it('detecta hex, px, rem, style= y <div>/<span>', () => {
    expect(infracciones('<div>')).not.toEqual([]);
    expect(infracciones('<span class="x">')).not.toEqual([]);
    expect(infracciones('color:#0A6E64')).not.toEqual([]);
    expect(infracciones('color:#fff;')).not.toEqual([]);
    expect(infracciones('min-height: 44px')).not.toEqual([]);
    expect(infracciones('gap: 1.5rem')).not.toEqual([]);
    expect(infracciones('<p style={{ color }}>')).not.toEqual([]);
  });

  it('acepta tokens y deja pasar <div>/<span> solo en composiciones', () => {
    expect(infracciones('var(--color-accent)')).toEqual([]);
    expect(infracciones('<Text type="code">ok</Text>')).toEqual([]);
    expect(infracciones('<span>', { permitirContenedores: true })).toEqual([]);
    expect(infracciones('<span>#0A6E64', { permitirContenedores: true })).toHaveLength(1);
  });
});

describe('web/src sin estilos sueltos', () => {
  it('ningún .ts/.tsx/.css (salvo tokens, art.tsx y tests) tiene infracciones', () => {
    const regs = composiciones();
    const ficheros = readdirSync(SRC, { recursive: true, encoding: 'utf8' })
      .map((f) => `src/${f.split('\\').join('/')}`)
      .filter((f) => /\.(ts|tsx|css)$/.test(f) && !/\.test\.[^/]+$/.test(f) && !EXENTOS.has(f));
    expect(ficheros.length).toBeGreaterThan(0);
    const malas: Record<string, Infraccion[]> = {};
    for (const f of ficheros) {
      const inf = infracciones(readFileSync(join(WEB, f), 'utf8'), { permitirContenedores: regs.has(f) });
      if (inf.length) malas[f] = inf;
    }
    expect(malas).toEqual({});
  });
});
