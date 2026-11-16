import { describe, expect, it } from 'vitest';
import { avisoBorrador, datosFaltantes, esBorrador } from './borrador.js';
import { cargarNegocio, type Negocio } from './content.js';

// Lo ejecuta el vitest de la raíz (lógica pura de web/src/lib).
const ejemplo = cargarNegocio();

const completo = (): Negocio => {
  const n = structuredClone(ejemplo);
  n.legal.razon_social = { valor: 'Duchas Madrid SL', confirmado: true };
  n.legal.nif = { valor: 'B12345678', confirmado: true };
  n.legal.domicilio = { valor: 'Calle Falsa 1, Madrid', confirmado: true };
  n.telefono = { valor: '+34 611 222 333', confirmado: true };
  n.garantia.anios = { valor: 2, confirmado: true };
  return n;
};

describe('borrador', () => {
  it('con el negocio de ejemplo faltan los 5 datos, en orden, y es borrador', () => {
    expect(datosFaltantes(ejemplo)).toEqual(['razón social', 'NIF', 'domicilio', 'teléfono', 'plazo de garantía']);
    expect(esBorrador(ejemplo)).toBe(true);
  });

  it('con todo confirmado no falta nada y no es borrador', () => {
    expect(datosFaltantes(completo())).toEqual([]);
    expect(esBorrador(completo())).toBe(false);
  });

  it('una garantía de 0 años cuenta como no confirmada', () => {
    const n = completo();
    n.garantia.anios = { valor: 0, confirmado: true };
    expect(datosFaltantes(n)).toEqual(['plazo de garantía']);
  });

  it('solo el NIF sin confirmar', () => {
    const n = completo();
    n.legal.nif = { valor: 'B12345678', confirmado: false };
    expect(datosFaltantes(n)).toEqual(['NIF']);
  });

  it('aviso con la lista de faltantes, o vacío', () => {
    expect(avisoBorrador(['NIF', 'teléfono']).startsWith('⚠ MODO BORRADOR: faltan NIF, teléfono')).toBe(true);
    expect(avisoBorrador(['NIF'])).toContain('noindex');
    expect(avisoBorrador(['NIF'])).toContain('web/content/negocio.json');
    expect(avisoBorrador([])).toBe('');
  });
});
