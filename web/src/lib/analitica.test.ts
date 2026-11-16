import { describe, expect, it } from 'vitest';
import { CLAVE_ELECCION, ga4IdValido, guardarEleccion, leerEleccion, urlGa4 } from './analitica.js';

// Lo ejecuta el vitest de la raíz (lógica pura de web/src/lib).
const storage = (valor: string | null) => ({ getItem: (_k: string) => valor });

describe('analitica', () => {
  it('ga4IdValido acepta ids G-XXXX y rechaza el resto', () => {
    for (const id of ['G-TEST123456', 'G-ABCD']) expect(ga4IdValido(id), id).toBe(true);
    for (const id of ['', null, undefined, 'g-test123456', 'G-ABC', 'G-AB CD', 'UA-12345']) expect(ga4IdValido(id), String(id)).toBe(false);
  });

  it('urlGa4 construye la URL de gtag.js', () => {
    expect(urlGa4('G-TEST123456')).toBe('https://www.googletagmanager.com/gtag/js?id=G-TEST123456');
  });

  it('leerEleccion devuelve solo elecciones válidas', () => {
    expect(leerEleccion(storage(null))).toBeNull();
    expect(leerEleccion(storage('aceptadas'))).toBe('aceptadas');
    expect(leerEleccion(storage('rechazadas'))).toBe('rechazadas');
    expect(leerEleccion(storage('basura'))).toBeNull();
    expect(
      leerEleccion({
        getItem: () => {
          throw new Error('bloqueado');
        },
      }),
    ).toBeNull();
  });

  it('leerEleccion lee de la clave cookies-eleccion', () => {
    const claves: string[] = [];
    leerEleccion({ getItem: (k) => (claves.push(k), null) });
    expect(claves).toEqual(['cookies-eleccion']);
  });

  it('guardarEleccion escribe en cookies-eleccion y no propaga si setItem lanza', () => {
    const escrito: [string, string][] = [];
    guardarEleccion({ setItem: (k, v) => void escrito.push([k, v]) }, 'aceptadas');
    expect(escrito).toEqual([['cookies-eleccion', 'aceptadas']]);
    expect(CLAVE_ELECCION).toBe('cookies-eleccion');
    expect(() =>
      guardarEleccion(
        {
          setItem: () => {
            throw new Error('modo privado');
          },
        },
        'rechazadas',
      ),
    ).not.toThrow();
  });
});
