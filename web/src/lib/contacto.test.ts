import { describe, expect, it } from 'vitest';
import { contactoSchema, erroresPorCampo, MENSAJES, normalizarTelefono, PIEZAS } from './contacto.ts';

const base = { nombre: 'Marta', telefono: '612345678', pieza: 'plato_ducha', privacidad: 'on' };

function errores(data: Record<string, unknown>) {
  const r = contactoSchema.safeParse(data);
  if (r.success) throw new Error('debía fallar');
  return erroresPorCampo(r.error);
}

describe('normalizarTelefono()', () => {
  it('admite formatos españoles y devuelve +34XXXXXXXXX', () => {
    expect(normalizarTelefono('612345678')).toBe('+34612345678');
    expect(normalizarTelefono('+34 612 34 56 78')).toBe('+34612345678');
    expect(normalizarTelefono('0034912345678')).toBe('+34912345678');
    expect(normalizarTelefono('612.345-678')).toBe('+34612345678');
    expect(normalizarTelefono('712345678')).toBe('+34712345678');
    expect(normalizarTelefono('812345678')).toBe('+34812345678');
  });

  it('rechaza lo que no son 9 cifras que empiezan por 6-9', () => {
    for (const t of ['12345', '512345678', '', '61234567', '6123456789', '61234567a']) {
      expect(normalizarTelefono(t), t).toBeNull();
    }
  });
});

describe('contactoSchema', () => {
  it('PIEZAS lista las piezas del formulario', () => {
    expect(PIEZAS).toEqual(['plato_ducha', 'banera', 'azulejos', 'otro']);
  });

  it('con solo los obligatorios es válido y normaliza el teléfono', () => {
    const r = contactoSchema.safeParse(base);
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.data.telefono).toBe('+34612345678');
    expect(r.data.dano).toBeUndefined();
    expect(r.data.zona).toBeUndefined();
    expect(r.data.mensaje).toBeUndefined();
    expect(r.data.pagina_origen).toBeUndefined();
  });

  it('los strings vacíos de opcionales cuentan como ausentes', () => {
    const r = contactoSchema.safeParse({ ...base, dano: '', zona: '', mensaje: '', pagina_origen: '', web: '' });
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.data.zona).toBeUndefined();
    expect(r.data.web).toBeUndefined();
  });

  it('guarda los opcionales rellenos y recorta el nombre', () => {
    const r = contactoSchema.safeParse({ ...base, nombre: '  Marta  ', dano: 'Grieta', zona: 'Centro', mensaje: 'Hola', pagina_origen: '/plato-ducha/' });
    expect(r.success && r.data).toMatchObject({ nombre: 'Marta', dano: 'Grieta', zona: 'Centro', mensaje: 'Hola', pagina_origen: '/plato-ducha/' });
  });

  it('teléfono: vacío ⇒ «Falta…», mal ⇒ «9 cifras»', () => {
    expect(errores({ ...base, telefono: '' }).telefono).toBe(MENSAJES.telefono_falta);
    expect(errores({ ...base, telefono: undefined }).telefono).toBe(MENSAJES.telefono_falta);
    expect(errores({ ...base, telefono: '512345678' }).telefono).toBe(MENSAJES.telefono_cifras);
    expect(errores({ ...base, telefono: '61234567' }).telefono).toBe(MENSAJES.telefono_cifras);
    expect(MENSAJES.telefono_falta).toBe('Falta tu teléfono.');
    expect(MENSAJES.telefono_cifras).toBe('El teléfono tiene que tener 9 cifras.');
  });

  it('erroresPorCampo da el mensaje del teléfono', () => {
    expect(errores({ ...base, telefono: '12345' })).toEqual({ telefono: 'El teléfono tiene que tener 9 cifras.' });
  });

  it('nombre, privacidad y pieza llevan su mensaje', () => {
    expect(errores({ ...base, nombre: '' }).nombre).toBe(MENSAJES.nombre);
    expect(errores({ ...base, nombre: '   ' }).nombre).toBe(MENSAJES.nombre);
    expect(errores({ ...base, nombre: undefined }).nombre).toBe(MENSAJES.nombre);
    expect(errores({ ...base, privacidad: undefined }).privacidad).toBe(MENSAJES.privacidad);
    expect(errores({ ...base, privacidad: 'off' }).privacidad).toBe(MENSAJES.privacidad);
    expect(MENSAJES.privacidad).toBe('Marca la casilla de privacidad para enviar.');
    expect(errores({ ...base, pieza: 'lavabo' }).pieza).toBe(MENSAJES.pieza);
  });

  it('respeta las longitudes máximas', () => {
    expect(errores({ ...base, nombre: 'a'.repeat(101) }).nombre).toBe(MENSAJES.nombre_largo);
    expect(errores({ ...base, zona: 'a'.repeat(101) }).zona).toBe(MENSAJES.zona);
    expect(errores({ ...base, mensaje: 'a'.repeat(2001) }).mensaje).toBe(MENSAJES.mensaje);
    expect(errores({ ...base, dano: 'a'.repeat(101) }).dano).toBe(MENSAJES.dano);
    expect(errores({ ...base, pagina_origen: 'a'.repeat(301) })).toHaveProperty('pagina_origen');
    expect(contactoSchema.safeParse({ ...base, nombre: 'a'.repeat(100), zona: 'a'.repeat(100), mensaje: 'a'.repeat(2000) }).success).toBe(true);
  });
});
