import { describe, expect, it } from 'vitest';
import { configFormulario } from './config.ts';

describe('configFormulario()', () => {
  it('sin variables de entorno devuelve config.json', () => {
    expect(configFormulario({})).toEqual({ retencion_dias: 90, foto_max_mb: 10, limite_envios: 5, ventana_min: 60 });
  });

  it('las variables de entorno sobrescriben cada valor', () => {
    expect(configFormulario({ RETENCION_DIAS: '30' }).retencion_dias).toBe(30);
    expect(
      configFormulario({ FOTO_MAX_MB: '5', LIMITE_ENVIOS: '3', VENTANA_MIN: '15' }),
    ).toEqual({ retencion_dias: 90, foto_max_mb: 5, limite_envios: 3, ventana_min: 15 });
  });

  it('un override que no es un entero positivo lanza error', () => {
    expect(() => configFormulario({ FOTO_MAX_MB: 'abc' })).toThrow(/FOTO_MAX_MB/);
    expect(() => configFormulario({ RETENCION_DIAS: '0' })).toThrow(/RETENCION_DIAS/);
    expect(() => configFormulario({ LIMITE_ENVIOS: '2.5' })).toThrow(/LIMITE_ENVIOS/);
  });

  it('por defecto lee process.env', () => {
    const prev = process.env.VENTANA_MIN;
    process.env.VENTANA_MIN = '30';
    try {
      expect(configFormulario().ventana_min).toBe(30);
    } finally {
      if (prev === undefined) delete process.env.VENTANA_MIN;
      else process.env.VENTANA_MIN = prev;
    }
  });
});
