import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Cookies, metadata } from './page';

const textoPlano = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

describe('cookies', () => {
  it('sin GA4: no hay cookies de análisis ni publicidad', () => {
    const html = renderToStaticMarkup(<Cookies ga4Id={null} />);
    const texto = textoPlano(html).toLowerCase();
    expect(texto).toContain('no usamos cookies');
    expect(texto).not.toContain('google analytics');
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(html).toMatch(/class="[^"]*\btexto-largo\b[^"]*"/);
  });

  it('con GA4: explica «Aceptar», localStorage y cómo cambiar la elección', () => {
    const html = renderToStaticMarkup(<Cookies ga4Id="G-TEST123456" />);
    const texto = textoPlano(html);
    expect(texto).toContain('Google Analytics');
    expect(texto).toContain('Aceptar');
    expect(texto).toContain('localStorage');
    expect(texto).toMatch(/borra/i);
    expect(html).not.toContain('<script');
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
  });

  it('exporta metadata con canonical propio', () => {
    expect(metadata.alternates.canonical).toMatch(/\/cookies\/$/);
  });
});
