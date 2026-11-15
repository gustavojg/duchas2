import { describe, expect, it } from 'vitest';
import { cargarFaq, cargarNegocio, type Negocio } from './content.ts';
import { anclaTema, preguntasResueltas, respuestaFaq } from './faq.ts';

const negocio = cargarNegocio();
const ctx = { negocio, retencion_dias: 90, modo: 'publico' as const };

const confirmado: Negocio = structuredClone(negocio);
confirmado.plazos.reparacion = { valor: 'en unas horas', confirmado: true };
confirmado.plazos.presupuesto = { valor: 'en 24 h', confirmado: true };
confirmado.plazos.uso_ducha = { valor: 'a las 24 h', confirmado: true };
confirmado.garantia.anios = { valor: 2, confirmado: true };

describe('respuestaFaq', () => {
  it('sin datos confirmados usa los textos alternativos', () => {
    expect(respuestaFaq('{reparacion}', ctx)).toBe('Sin obras ni polvo');
    expect(respuestaFaq('{presupuesto}', ctx)).toBe('Presupuesto gratuito y sin compromiso');
    expect(respuestaFaq('{garantia}', ctx)).toBe('Garantía por escrito');
    expect(respuestaFaq('{uso_ducha}', ctx)).toBe('Te decimos cuándo puedes usar la ducha');
    expect(respuestaFaq('{respuesta}', ctx)).toBe('Te respondemos lo antes posible');
  });

  it('con plazos y garantía confirmados los publica', () => {
    const c = { ...ctx, negocio: confirmado };
    expect(respuestaFaq('{reparacion}.', c)).toBe('Reparado en unas horas.');
    expect(respuestaFaq('{presupuesto}', c)).toBe('Presupuesto gratuito en 24 h');
    expect(respuestaFaq('{uso_ducha}', c)).toBe('Puedes usar la ducha a las 24 h');
    expect(respuestaFaq('{garantia}', c)).toBe('Garantía por escrito de 2 años');
  });

  it('en modo pendientes marca lo no confirmado', () => {
    expect(respuestaFaq('{uso_ducha}', { ...ctx, modo: 'pendientes' })).toContain('{{PENDIENTE}}');
    expect(respuestaFaq('{reparacion}', { ...ctx, modo: 'pendientes' })).toContain('{{PENDIENTE}}');
  });

  it('sustituye {retencion_dias} por el número', () => {
    expect(respuestaFaq('Se borra a los {retencion_dias} días.', ctx)).toBe('Se borra a los 90 días.');
  });

  it('un marcador desconocido lanza con su nombre', () => {
    expect(() => respuestaFaq('Hola {otro}', ctx)).toThrow(/otro/);
  });
});

describe('preguntasResueltas', () => {
  it('sobre el faq.json real en modo público no deja marcadores ni pendientes', () => {
    const temas = preguntasResueltas(cargarFaq(), ctx);
    expect(temas.length).toBeGreaterThan(0);
    for (const t of temas) {
      expect(t.ancla).toBe(anclaTema(t.tema));
      for (const p of t.preguntas) {
        expect(p.r).not.toContain('{');
        expect(p.r).not.toContain('PENDIENTE');
      }
    }
  });

  it('el tema «Tu foto y el contacto» tiene 3 preguntas, entre ellas la de zonas, sin marcadores', () => {
    const temas = preguntasResueltas(cargarFaq(), ctx);
    const tema = temas.find((t) => t.tema === 'Tu foto y el contacto');
    expect(tema, 'falta el tema').toBeDefined();
    expect(tema!.preguntas).toHaveLength(3);
    const zonas = tema!.preguntas.find((p) => p.p === '¿Venís a mi barrio o mi municipio?');
    expect(zonas, 'falta la pregunta de zonas').toBeDefined();
    expect(zonas!.r).not.toContain('{');
    expect(zonas!.r).not.toContain('PENDIENTE');
  });

  it('anclaTema hace un slug ASCII sin tildes', () => {
    expect(anclaTema('Plazos, presupuesto y garantía')).toBe('plazos-presupuesto-y-garantia');
    expect(anclaTema('Tu foto y el contacto')).toBe('tu-foto-y-el-contacto');
  });
});
