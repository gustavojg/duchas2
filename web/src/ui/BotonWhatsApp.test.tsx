import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { BotonWhatsApp } from './BotonWhatsApp';

const pinta = (numero: string) =>
  renderToStaticMarkup(<BotonWhatsApp numero={numero} mensaje="Hola" etiqueta="Manda la foto por WhatsApp" />);

describe('BotonWhatsApp', () => {
  it('con un número válido enlaza a wa.me y muestra la etiqueta', () => {
    const html = pinta('+34 600 000 000');
    expect(html).toContain('https://wa.me/34600000000');
    expect(html).toContain('Manda la foto por WhatsApp');
  });

  it('con un número inválido no pinta nada', () => {
    const html = pinta('12345');
    expect(html).toBe('');
    expect(html).not.toContain('<a');
    expect(html).not.toContain('Manda la foto por WhatsApp');
  });

  it('con un número vacío no pinta nada', () => {
    expect(pinta('')).toBe('');
  });
});
