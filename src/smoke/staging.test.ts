import { describe, expect, it } from 'vitest';
import { PAGES } from '../../web/src/lib/site.js';
import { esperadoContacto, rutasDelSmoke, statusContactoEsperado } from './staging.js';

describe('rutasDelSmoke', () => {
  it("incluye '/' y todas las de PAGES", () => {
    const rutas = rutasDelSmoke([]);
    expect(rutas).toContain('/');
    for (const p of PAGES) expect(rutas).toContain(p);
  });

  it('añade los servicios de tipo servicio sin duplicados', () => {
    const x = { slug: 'x', ruta: '/servicios/x/', tipo: 'servicio' };
    const rutas = rutasDelSmoke([x, x]);
    expect(rutas.filter((r) => r === '/servicios/x/')).toHaveLength(1);
    expect(new Set(rutas).size).toBe(rutas.length);
  });

  it('no añade servicios de otro tipo', () => {
    const rutas = rutasDelSmoke([{ slug: 'y', ruta: '/servicios/y/', tipo: 'empresas' }]);
    expect(rutas).not.toContain('/servicios/y/');
    expect(rutas).toHaveLength(new Set(PAGES).size);
  });
});

describe('esperadoContacto', () => {
  it("vacío o sin definir da 'con'", () => {
    expect(esperadoContacto(undefined)).toBe('con');
    expect(esperadoContacto('')).toBe('con');
    expect(esperadoContacto('con')).toBe('con');
  });

  it("'sin' da 'sin'", () => {
    expect(esperadoContacto('sin')).toBe('sin');
  });

  it('otro valor lanza un error que nombra la variable', () => {
    expect(() => esperadoContacto('xx')).toThrow(/E2E_EMAIL_DESTINO/);
  });
});

describe('statusContactoEsperado', () => {
  it("'sin' solo acepta 503", () => {
    const ok = statusContactoEsperado('sin');
    expect(ok(503)).toBe(true);
    expect(ok(201)).toBe(false);
    expect(ok(500)).toBe(false);
  });

  it("'con' acepta 2xx", () => {
    const ok = statusContactoEsperado('con');
    expect(ok(201)).toBe(true);
    expect(ok(200)).toBe(true);
    expect(ok(299)).toBe(true);
    expect(ok(300)).toBe(false);
    expect(ok(503)).toBe(false);
  });
});
