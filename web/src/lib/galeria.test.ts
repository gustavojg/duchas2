import { describe, expect, it } from 'vitest';
import { cargarServicios, galeriaSchema, type ParGaleria } from './content.ts';
import { filtrarPares, GALERIA_VACIA, grupos, opcionesFiltro, parHueco } from './galeria.ts';

const par = (servicio: string, n: number): ParGaleria => ({
  servicio,
  antes: null,
  despues: null,
  alt_antes: `Antes ${servicio} ${n}`,
  alt_despues: `Después ${servicio} ${n}`,
  hueco: `Hueco ${servicio} ${n}`,
});

describe('galeria.ts', () => {
  const servicios = cargarServicios();

  it('GALERIA_VACIA es el texto de brain/design.md', () => {
    expect(GALERIA_VACIA).toBe('Aún no hemos subido fotos de este trabajo. Mándanos la tuya y te decimos qué podemos hacer.');
  });

  it('opcionesFiltro empieza por «Todos», sigue el orden y no incluye el servicio de empresas', () => {
    const o = opcionesFiltro(servicios);
    expect(o[0]).toEqual({ valor: 'todos', etiqueta: 'Todos' });
    expect(o.map((x) => x.valor)).not.toContain('hoteles-y-comunidades');
    const noEmpresas = [...servicios].filter((s) => s.tipo !== 'empresas').sort((a, b) => a.orden - b.orden);
    expect(o.slice(1)).toEqual(noEmpresas.map((s) => ({ valor: s.slug, etiqueta: s.nombre })));
    expect(o).toHaveLength(10);
  });

  it('opcionesFiltro no muta ni depende del orden de entrada', () => {
    const invertidos = [...servicios].reverse();
    const copia = [...invertidos];
    expect(opcionesFiltro(invertidos)).toEqual(opcionesFiltro(servicios));
    expect(invertidos).toEqual(copia);
  });

  it('filtrarPares con un slug devuelve solo los suyos; con «todos», todos', () => {
    const pares = [par('mamparas', 1), par('azulejos', 1), par('mamparas', 2)];
    const m = filtrarPares(pares, 'mamparas');
    expect(m).toHaveLength(2);
    for (const p of m) expect(p.servicio).toBe('mamparas');
    expect(filtrarPares(pares, 'todos')).toEqual(pares);
    expect(filtrarPares(pares, 'marmol-y-piedra')).toEqual([]);
  });

  it('grupos parte en bloques de 6', () => {
    const pares = Array.from({ length: 13 }, (_, i) => par('azulejos', i));
    expect(grupos(pares).map((g) => g.length)).toEqual([6, 6, 1]);
    expect(grupos(pares.slice(0, 6)).map((g) => g.length)).toEqual([6]);
    expect(grupos([])).toEqual([]);
    expect(grupos(pares, 5).map((g) => g.length)).toEqual([5, 5, 3]);
  });

  it('parHueco no tiene fotos, dice qué foto va y lleva alt descriptivos', () => {
    const h = parHueco({ slug: 'mamparas', nombre: 'Reparación de mamparas' });
    expect(h.servicio).toBe('mamparas');
    expect(h.antes).toBeNull();
    expect(h.despues).toBeNull();
    expect(h.hueco).toBe('Foto de Reparación de mamparas antes y después');
    expect(h.alt_antes).toContain('Reparación de mamparas');
    expect(h.alt_despues).toContain('Reparación de mamparas');
    expect(h.alt_antes).not.toBe(h.alt_despues);
    expect(galeriaSchema.safeParse([h]).success).toBe(true);
  });
});
