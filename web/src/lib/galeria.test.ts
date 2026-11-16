import { describe, expect, it } from 'vitest';
import { cargarGaleria, cargarServicios, galeriaSchema, type ParGaleria } from './content.ts';
import {
  filtrarPares,
  GALERIA_VACIA,
  GALERIA_VACIA_DESCRIPCION,
  GALERIA_VACIA_TITULO,
  grupos, opcionesFiltro, parHueco, serviciosConPares } from './galeria.ts';

const par = (servicio: string, n: number): ParGaleria => ({
  servicio,
  antes: null,
  despues: null,
  alt_antes: `Antes ${servicio} ${n}`,
  alt_despues: `Después ${servicio} ${n}`,
  hueco: `Hueco ${servicio} ${n}`,
});

const parConHueco = (servicio: string, hueco: string): ParGaleria => ({
  servicio,
  antes: null,
  despues: null,
  alt_antes: `antes ${hueco}`,
  alt_despues: `después ${hueco}`,
  hueco,
});

describe('galeria.ts', () => {
  const servicios = cargarServicios();

  it('GALERIA_VACIA es el texto de brain/design.md', () => {
    expect(GALERIA_VACIA).toBe('Aún no hemos subido fotos de este trabajo. Mándanos la tuya y te decimos qué podemos hacer.');
  });

  it('GALERIA_VACIA se parte en título y descripción literales (EmptyState)', () => {
    expect(GALERIA_VACIA_TITULO).toBe('Aún no hemos subido fotos de este trabajo.');
    expect(GALERIA_VACIA_DESCRIPCION).toBe('Mándanos la tuya y te decimos qué podemos hacer.');
    expect(GALERIA_VACIA).toBe(`${GALERIA_VACIA_TITULO} ${GALERIA_VACIA_DESCRIPCION}`);
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

describe('filtrarPares', () => {
  const pares: ParGaleria[] = [
    parConHueco('platos-de-ducha', 'ducha 1'),
    parConHueco('azulejos', 'azulejo 1'),
    parConHueco('platos-de-ducha', 'ducha 2'),
  ];

  it('con un slug devuelve solo los pares de ese servicio', () => {
    const r = filtrarPares(pares, 'platos-de-ducha');
    expect(r.map((p) => p.hueco)).toEqual(['ducha 1', 'ducha 2']);
    expect(r.some((p) => p.servicio === 'azulejos')).toBe(false);
  });

  it('null y «todos» devuelven todos, sin mutar la entrada', () => {
    const copia = structuredClone(pares);
    expect(filtrarPares(pares, null)).toEqual(pares);
    expect(filtrarPares(pares, 'todos')).toEqual(pares);
    expect(filtrarPares(pares, null)).not.toBe(pares);
    expect(pares).toEqual(copia);
  });

  it('un slug sin pares devuelve []', () => {
    expect(filtrarPares(pares, 'mamparas')).toEqual([]);
  });
});

describe('serviciosConPares', () => {
  const pares: ParGaleria[] = [
    parConHueco('platos-de-ducha', 'ducha 1'),
    parConHueco('azulejos', 'azulejo 1'),
    parConHueco('platos-de-ducha', 'ducha 2'),
  ];
  const servicios = [
    { slug: 'azulejos', nombre: 'Esmaltado de azulejos' },
    { slug: 'mamparas', nombre: 'Reparación de mamparas' },
    { slug: 'platos-de-ducha', nombre: 'Platos de ducha' },
  ];

  it('omite servicios sin pares y conserva el orden y el nombre de servicios.json', () => {
    expect(serviciosConPares(pares, servicios)).toEqual([
      { slug: 'azulejos', nombre: 'Esmaltado de azulejos' },
      { slug: 'platos-de-ducha', nombre: 'Platos de ducha' },
    ]);
  });

  it('un slug que no está en servicios.json usa el slug como nombre', () => {
    expect(serviciosConPares([parConHueco('otro-servicio', 'x')], servicios)).toEqual([
      { slug: 'otro-servicio', nombre: 'otro-servicio' },
    ]);
  });

  it('con galeria.json y servicios.json reales, cada filtro solo deja pares de su servicio', () => {
    const galeria = cargarGaleria();
    const lista = serviciosConPares(galeria, cargarServicios());
    expect(lista.length).toBeGreaterThan(0);
    for (const s of lista) {
      const r = filtrarPares(galeria, s.slug);
      expect(r.length).toBeGreaterThan(0);
      for (const p of r) expect(p.servicio).toBe(s.slug);
    }
  });
});
