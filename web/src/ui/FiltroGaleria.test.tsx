import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { isValidElement, type ReactElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { ParGaleria } from '../lib/content';
import { FiltroGaleria, FiltroGaleriaVista } from './FiltroGaleria';

const par = (servicio: string, hueco: string): ParGaleria => ({
  servicio,
  antes: null,
  despues: null,
  alt_antes: `Antes de ${hueco}`,
  alt_despues: `Después de ${hueco}`,
  hueco,
});

const pares: ParGaleria[] = [par('platos-de-ducha', 'Hueco ducha uno'), par('azulejos', 'Hueco azulejo uno'), par('platos-de-ducha', 'Hueco ducha dos')];
const servicios = [
  { slug: 'platos-de-ducha', nombre: 'Platos de ducha' },
  { slug: 'azulejos', nombre: 'Esmaltado de azulejos' },
];

const conFoto: ParGaleria = {
  servicio: 'platos-de-ducha',
  antes: '/galeria/antes-1.jpg',
  despues: '/galeria/despues-1.jpg',
  alt_antes: 'Plato con la grieta antes',
  alt_despues: 'Plato liso después',
};

/** Astryx (AspectRatio) pinta variables CSS internas en `style`; eso no es estilo propio. */
const sinVariablesAstryx = (html: string) => html.replace(/ style="(?:--[\w-]+:[\w.\s-]+;?)+"/g, '');
const fuente = readFileSync(join(__dirname, 'FiltroGaleria.tsx'), 'utf8');

/** Busca en el árbol de elementos (sin montar) el primero cuyo tipo cumple `es`. */
function buscar(nodo: ReactNode, es: (e: ReactElement) => boolean): ReactElement | undefined {
  if (Array.isArray(nodo)) {
    for (const n of nodo) {
      const r = buscar(n, es);
      if (r) return r;
    }
    return undefined;
  }
  if (!isValidElement(nodo)) return undefined;
  if (es(nodo)) return nodo;
  return buscar((nodo.props as { children?: ReactNode }).children, es);
}

describe('FiltroGaleria', () => {
  it('estado inicial: «Todos» elegido y se pintan los huecos de todos los pares', () => {
    const html = renderToStaticMarkup(<FiltroGaleria pares={pares} servicios={servicios} />);
    for (const p of pares) expect(html).toContain(p.hueco);
    expect(html).toContain('Filtrar por servicio');
    expect(html).toContain('Todos');
    for (const s of servicios) expect(html).toContain(s.nombre);
    expect(html).not.toContain('astryx-segmented-control');
    expect(html).toContain('astryx-selector');
    expect(html).toContain('Antes');
    expect(html).toContain('Después');
    expect(html).toMatch(/<ul[\s>]/);
  });

  it('al elegir un servicio solo se ven los pares de ese servicio', () => {
    const html = renderToStaticMarkup(<FiltroGaleriaVista pares={pares} servicios={servicios} elegido="azulejos" onElegir={() => {}} />);
    expect(html).toContain('Hueco azulejo uno');
    expect(html).not.toContain('Hueco ducha uno');
    expect(html).not.toContain('Hueco ducha dos');
  });

  it('el selector ofrece «Todos» y cada servicio con su nombre entero, y avisa del servicio elegido', () => {
    const onElegir = vi.fn();
    const arbol = FiltroGaleriaVista({ pares, servicios, elegido: 'todos', onElegir });
    const control = buscar(arbol, (e) => (e.props as { label?: unknown }).label === 'Filtrar por servicio');
    expect(control, 'falta el control «Filtrar por servicio»').toBeDefined();
    const props = control!.props as { options?: { value: string; label: string }[]; value: string; onChange: (v: string | null) => void };
    expect(props.options).toEqual([{ value: 'todos', label: 'Todos' }, ...servicios.map((s) => ({ value: s.slug, label: s.nombre }))]);
    expect(props.value).toBe('todos');
    props.onChange('azulejos');
    expect(onElegir).toHaveBeenCalledWith('azulejos');
  });

  it('el valor elegido se pinta entero (sin recorte de una línea) en el disparador', () => {
    const largo = [{ slug: 'platos-de-ducha', nombre: 'Reparación y esmaltado de platos de ducha' }];
    const html = renderToStaticMarkup(<FiltroGaleriaVista pares={pares} servicios={largo} elegido="platos-de-ducha" onElegir={() => {}} />);
    expect(html).toMatch(/class="[^"]*\bgaleria-filtro-valor\b[^"]*"[^>]*>Reparación y esmaltado de platos de ducha</);
  });

  it('un par con foto real pinta <img> con su alt_antes y alt_despues', () => {
    const html = renderToStaticMarkup(<FiltroGaleria pares={[conFoto]} servicios={servicios} />);
    expect(html).toMatch(/<img[^>]*alt="Plato con la grieta antes"/);
    expect(html).toMatch(/<img[^>]*alt="Plato liso después"/);
  });

  it('un par sin foto pinta su hueco y no pinta <img>', () => {
    const html = renderToStaticMarkup(<FiltroGaleria pares={[pares[0]]} servicios={servicios} />);
    expect(html).toContain('Hueco ducha uno');
    expect(html).not.toContain('<img');
  });

  it('cada par lleva el nombre de su servicio (o el slug si no está en servicios)', () => {
    const conHuerfano = [...pares, par('mamparas', 'Hueco mampara uno')];
    const html = renderToStaticMarkup(<FiltroGaleria pares={conHuerfano} servicios={servicios} />);
    const items = html.match(/<li[\s>][\s\S]*?<\/li>/g) ?? [];
    expect(items).toHaveLength(conHuerfano.length);
    conHuerfano.forEach((p, i) => {
      const nombre = servicios.find((s) => s.slug === p.servicio)?.nombre ?? p.servicio;
      expect(items[i]).toContain(p.hueco);
      expect(items[i]).toContain(nombre);
    });
    const otro = (p: ParGaleria) => servicios.find((s) => s.slug !== p.servicio)!.nombre;
    expect(items[0]).not.toContain(otro(conHuerfano[0]));
  });

  it('la lista es una rejilla (1 columna en móvil, 2 en escritorio) y cada par pone antes y después lado a lado desde 640 px', () => {
    const html = renderToStaticMarkup(<FiltroGaleria pares={pares} servicios={servicios} />);
    expect(html).toMatch(/<ul[^>]*class="[^"]*\bgaleria-pares\b/);
    expect(html.match(/class="[^"]*\bgaleria-par-lados\b/g)).toHaveLength(pares.length);
    expect(html.match(/class="[^"]*\bgaleria-par-lado\b/g)).toHaveLength(pares.length * 2);
    const css = readFileSync(join(__dirname, '../app/globals.css'), 'utf8');
    expect(css).toMatch(/\.galeria-pares\s*\{[^}]*display:\s*grid/);
    expect(css).toMatch(/@media \(min-width: 64rem\)\s*\{\s*\.galeria-pares\s*\{[^}]*grid-template-columns:\s*repeat\(2,/);
    expect(css).toMatch(/@media \(min-width: 40rem\)\s*\{\s*\.galeria-par-lados\s*\{[^}]*flex-direction:\s*row/);
  });

  it('sin estilos sueltos', () => {
    const html = sinVariablesAstryx(renderToStaticMarkup(<FiltroGaleria pares={[...pares, conFoto]} servicios={servicios} />));
    expect(html).not.toContain('style=');
    expect(html).not.toContain('<style');
    expect(fuente).not.toMatch(/style=|<style|<div|<span/);
  });
});
