import { describe, expect, it } from 'vitest';
import { cargarGaleria, cargarServicios, type ParGaleria } from './content.ts';
import { filtrarPares, serviciosConPares } from './galeria.ts';

const par = (servicio: string, hueco: string): ParGaleria => ({
  servicio,
  antes: null,
  despues: null,
  alt_antes: `antes ${hueco}`,
  alt_despues: `después ${hueco}`,
  hueco,
});

const pares: ParGaleria[] = [
  par('platos-de-ducha', 'ducha 1'),
  par('azulejos', 'azulejo 1'),
  par('platos-de-ducha', 'ducha 2'),
];

const servicios = [
  { slug: 'azulejos', nombre: 'Esmaltado de azulejos' },
  { slug: 'mamparas', nombre: 'Reparación de mamparas' },
  { slug: 'platos-de-ducha', nombre: 'Platos de ducha' },
];

describe('filtrarPares', () => {
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
  it('omite servicios sin pares y conserva el orden y el nombre de servicios.json', () => {
    expect(serviciosConPares(pares, servicios)).toEqual([
      { slug: 'azulejos', nombre: 'Esmaltado de azulejos' },
      { slug: 'platos-de-ducha', nombre: 'Platos de ducha' },
    ]);
  });

  it('un slug que no está en servicios.json usa el slug como nombre', () => {
    expect(serviciosConPares([par('otro-servicio', 'x')], servicios)).toEqual([
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
