import { describe, expect, it } from 'vitest';
import { filasComparativa, resolverPasos, serviciosConPrecio, serviciosOrdenados } from './catalogo.ts';
import { cargarComparativa, cargarNegocio, cargarPasos, cargarServicios, type Negocio } from './content.ts';

const servicios = cargarServicios();
const pasos = cargarPasos();
const comparativa = cargarComparativa();
const negocio = cargarNegocio();

const conPlazos: Negocio = structuredClone(negocio);
conPlazos.plazos.presupuesto = { valor: 'en 24 h', confirmado: true };
conPlazos.plazos.reparacion = { valor: 'en unas horas', confirmado: true };
conPlazos.garantia.anios = { valor: 2, confirmado: true };

describe('serviciosOrdenados', () => {
  it('ordena por `orden` sin mutar la entrada', () => {
    const revuelta = [...servicios].reverse();
    const copia = [...revuelta];
    const r = serviciosOrdenados(revuelta);
    expect(r.map((s) => s.orden)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(r[0].slug).toBe('platos-de-ducha');
    expect(revuelta).toEqual(copia);
    expect(r).not.toBe(revuelta);
  });
});

describe('resolverPasos', () => {
  it('sin plazos confirmados usa el texto sin plazo y la garantía sin años', () => {
    const r = resolverPasos(pasos, negocio, 'publico');
    expect(r.map((p) => p.numero)).toEqual([1, 2, 3, 4]);
    expect(r[0].accion).toBe('whatsapp');
    expect(r[1].texto).toBe('Presupuesto gratuito y sin compromiso');
    expect(r[2].texto).toBe('Reparación sin obras ni polvo');
    expect(r[3].texto).toBe('Garantía por escrito');
    for (const p of r) expect(p.texto).not.toMatch(/\{|PENDIENTE/);
  });

  it('con plazos confirmados los sustituye', () => {
    const r = resolverPasos(pasos, conPlazos, 'publico');
    expect(r[1].texto).toBe('Presupuesto gratuito en 24 h');
    expect(r[2].texto).toBe('Reparación en unas horas');
    expect(r[3].texto).toBe('Garantía por escrito de 2 años');
  });

  it('en modo pendientes deja ver el hueco', () => {
    const r = resolverPasos(pasos, negocio, 'pendientes');
    expect(r[1].texto).toContain('{{PENDIENTE}}');
    expect(r[3].texto).toContain('{{PENDIENTE}}');
  });
});

describe('filasComparativa', () => {
  it('sin cifras confirmadas devuelve solo tiempo y obra', () => {
    const r = filasComparativa(comparativa, 'publico');
    expect(r.map((f) => f.id)).toEqual(['tiempo', 'obra']);
    for (const f of r) {
      expect(f.reparar).not.toBe('');
      expect(f.cambiar).not.toBe('');
    }
  });

  it('con el coste confirmado devuelve las tres', () => {
    const c = structuredClone(comparativa);
    c.filas[0].reparar = { valor: 'Desde 150 €', confirmado: true };
    c.filas[0].cambiar = { valor: '865-1.200 €', confirmado: true };
    const r = filasComparativa(c, 'publico');
    expect(r.map((f) => f.id)).toEqual(['coste', 'tiempo', 'obra']);
    expect(r[0].cambiar).toBe('865-1.200 €');
  });

  it('en modo pendientes enseña todas, con el hueco marcado', () => {
    const r = filasComparativa(comparativa, 'pendientes');
    expect(r).toHaveLength(3);
    expect(r[0].reparar).toBe('{{PENDIENTE}}');
  });
});

describe('serviciosConPrecio', () => {
  it('sin precios confirmados no hay ninguno', () => {
    expect(serviciosConPrecio(servicios, 'publico')).toEqual([]);
  });

  it('con un precio confirmado devuelve solo ese; un 0 no cuenta', () => {
    const s = structuredClone(servicios);
    s[1].precio_desde = { valor: 90, confirmado: true };
    s[2].precio_desde = { valor: 0, confirmado: true };
    expect(serviciosConPrecio(s, 'publico').map((x) => x.slug)).toEqual([s[1].slug]);
  });

  it('en modo pendientes, todos', () => {
    expect(serviciosConPrecio(servicios, 'pendientes')).toHaveLength(servicios.length);
  });
});
