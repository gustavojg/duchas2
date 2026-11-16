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

  it('el SegmentedControl avisa del servicio elegido', () => {
    const onElegir = vi.fn();
    const arbol = FiltroGaleriaVista({ pares, servicios, elegido: 'todos', onElegir });
    const control = buscar(arbol, (e) => (e.props as { label?: unknown }).label === 'Filtrar por servicio');
    expect(control, 'falta el SegmentedControl').toBeDefined();
    (control!.props as { onChange: (v: string) => void }).onChange('azulejos');
    expect(onElegir).toHaveBeenCalledWith('azulejos');
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

  it('sin estilos sueltos', () => {
    const html = sinVariablesAstryx(renderToStaticMarkup(<FiltroGaleria pares={[...pares, conFoto]} servicios={servicios} />));
    expect(html).not.toContain('style=');
    expect(html).not.toContain('<style');
    expect(fuente).not.toMatch(/style=|<style|<div|<span/);
  });
});
