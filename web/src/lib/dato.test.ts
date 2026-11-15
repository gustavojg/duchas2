import { describe, expect, it } from 'vitest';
import { modoActual, PENDIENTE, texto } from './dato.js';

describe('texto()', () => {
  const si = { valor: 'en 24 h', confirmado: true };
  const no = { valor: 'en 24 h', confirmado: false };

  it('confirmado → el valor (o su formato)', () => {
    expect(texto(si, 'publico')).toBe('en 24 h');
    expect(texto(si, 'pendientes')).toBe('en 24 h');
    expect(texto(si, 'publico', { formato: (v) => `Presupuesto ${v}` })).toBe('Presupuesto en 24 h');
  });

  it('no confirmado en público → el alternativo (vacío por defecto)', () => {
    expect(texto(no, 'publico', { alternativo: 'Sin compromiso' })).toBe('Sin compromiso');
    expect(texto(no, 'publico')).toBe('');
  });

  it('confirmado pero sin valor cuenta como no confirmado', () => {
    expect(texto({ valor: null, confirmado: true }, 'publico', { alternativo: 'alt' })).toBe('alt');
  });

  it('no confirmado en modo pendientes → {{PENDIENTE}}', () => {
    expect(PENDIENTE).toBe('{{PENDIENTE}}');
    expect(texto(no, 'pendientes', { alternativo: 'alt' })).toBe('{{PENDIENTE}}');
  });
});

describe('modoActual()', () => {
  it('pendientes en desarrollo o con MOSTRAR_PENDIENTES=1; público en el resto (build incluido)', () => {
    expect(modoActual({ NODE_ENV: 'development' })).toBe('pendientes');
    expect(modoActual({ NODE_ENV: 'production', MOSTRAR_PENDIENTES: '1' })).toBe('pendientes');
    expect(modoActual({ NODE_ENV: 'production' })).toBe('publico');
    expect(modoActual({ NODE_ENV: 'test' })).toBe('publico');
    expect(modoActual({ MOSTRAR_PENDIENTES: '0' })).toBe('publico');
  });
});
