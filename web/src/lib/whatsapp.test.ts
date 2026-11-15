import { describe, expect, it } from 'vitest';
import { IDS_SIN_FLOTANTE, mensajePorRuta, telLink, waLink } from './whatsapp.ts';

describe('waLink()', () => {
  it('solo dígitos y el mensaje con encodeURIComponent', () => {
    expect(waLink('+34 600 000 000', 'Hola, ¿qué tal?')).toBe('https://wa.me/34600000000?text=Hola%2C%20%C2%BFqu%C3%A9%20tal%3F');
  });

  it('normaliza 0034 y números sin prefijo', () => {
    expect(waLink('0034 600 000 000', 'a')).toBe('https://wa.me/34600000000?text=a');
    expect(waLink('600000000', 'a')).toBe('https://wa.me/34600000000?text=a');
  });
});

describe('telLink()', () => {
  it('normaliza espacios y los prefijos +34 / 0034', () => {
    expect(telLink('600 000 000')).toBe('tel:+34600000000');
    expect(telLink('0034600000000')).toBe('tel:+34600000000');
    expect(telLink('+34 600 000 000')).toBe('tel:+34600000000');
    expect(telLink('912 34 56 78')).toBe('tel:+34912345678');
  });

  it('rechaza lo que no es un teléfono español de 9 cifras', () => {
    expect(() => telLink('12345')).toThrow();
    expect(() => telLink('500 000 000')).toThrow();
  });
});

describe('mensajePorRuta', () => {
  const portada = mensajePorRuta('/');

  it('portada, servicio y platos de ducha dan mensajes distintos', () => {
    const servicio = mensajePorRuta('/servicios/esmaltado-de-banera/');
    const plato = mensajePorRuta('/platos-de-ducha/');
    expect(portada).toBe('Hola, os mando una foto del daño para que me digáis si tiene arreglo.');
    expect(plato).toBe('Hola, vengo de la página de platos de ducha. Os mando una foto del daño');
    expect(servicio).toBe('Hola, vengo de la página de esmaltado de banera. Os mando una foto del daño');
    expect(new Set([portada, servicio, plato]).size).toBe(3);
  });

  it('con servicios inyectados devuelve exactamente su whatsapp_mensaje', () => {
    const servicios = [{ ruta: '/servicios/esmaltado-de-banera/', whatsapp_mensaje: 'Hola, quiero esmaltar mi bañera.' }];
    expect(mensajePorRuta('/servicios/esmaltado-de-banera/', servicios)).toBe('Hola, quiero esmaltar mi bañera.');
    expect(mensajePorRuta('/servicios/esmaltado-de-banera', servicios)).toBe('Hola, quiero esmaltar mi bañera.');
  });

  it('con y sin barra final, query o hash da lo mismo', () => {
    expect(mensajePorRuta('/platos-de-ducha')).toBe(mensajePorRuta('/platos-de-ducha/'));
    expect(mensajePorRuta('/platos-de-ducha/?a=1#x')).toBe(mensajePorRuta('/platos-de-ducha/'));
    expect(mensajePorRuta('')).toBe(portada);
  });

  it('hoteles y comunidades lleva el mensaje de empresas', () => {
    expect(mensajePorRuta('/hoteles-y-comunidades/')).toBe(
      'Hola, somos un hotel o una comunidad y queremos renovar bañeras. Os cuento cuántas y cuándo.',
    );
  });

  it('ruta desconocida y /contacto/ devuelven el mensaje por defecto', () => {
    expect(mensajePorRuta('/no-existe/')).toBe(portada);
    expect(mensajePorRuta('/contacto/')).toBe(portada);
  });

  it('ningún mensaje vacío y todos dan una URL wa.me válida', () => {
    for (const r of ['/', '/contacto/', '/platos-de-ducha/', '/servicios/x/', '/servicios/', '/hoteles-y-comunidades', '/zz']) {
      const m = mensajePorRuta(r);
      expect(m.trim()).not.toBe('');
      const url = new URL(waLink('+34 600 000 000', m));
      expect(url.origin).toBe('https://wa.me');
      expect(url.pathname).toBe('/34600000000');
      expect(url.searchParams.get('text')).toBe(m);
    }
  });

  it('IDS_SIN_FLOTANTE lista el CTA del hero y el enviar del formulario', () => {
    expect([...IDS_SIN_FLOTANTE]).toEqual(['cta-hero', 'enviar-peticion']);
  });
});
