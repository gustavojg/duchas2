import { describe, expect, it } from 'vitest';
import { telLink, waLink } from './whatsapp.js';

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
