import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { BannerCookies, BannerCookiesVista } from './BannerCookies';

// Sin jsdom en web/: el efecto (localStorage e inyección de GA) lo cubre tests/e2e/cookies.spec.ts.
const nada = () => {};

describe('BannerCookies', () => {
  it('sin ga4Id o con un id inválido no pinta nada', () => {
    expect(renderToStaticMarkup(<BannerCookies ga4Id={null} />)).toBe('');
    expect(renderToStaticMarkup(<BannerCookies ga4Id="G-1" />)).toBe('');
  });

  it('con ga4Id válido el HTML estático no lleva el banner ni GA (la elección se lee en el efecto)', () => {
    const html = renderToStaticMarkup(<BannerCookies ga4Id="G-TEST123456" />);
    expect(html).not.toContain('banner-cookies');
    expect(html).not.toContain('Aceptar');
    expect(html).not.toContain('googletagmanager');
  });
});

describe('BannerCookiesVista', () => {
  const html = renderToStaticMarkup(<BannerCookiesVista onAceptar={nada} onRechazar={nada} />);

  it('lleva «Aceptar», «Rechazar», el enlace a /cookies/ y la clase banner-cookies', () => {
    expect(html).toContain('Aceptar');
    expect(html).toContain('Rechazar');
    expect(html).toMatch(/href="\/cookies\/"/);
    expect(html).toContain('banner-cookies');
  });

  it('los dos botones tienen la misma clase y ninguno es primario', () => {
    const botones = [...html.matchAll(/<button\b[^>]*>/g)].map((m) => m[0]);
    expect(botones).toHaveLength(2);
    const clases = botones.map((b) => /class="([^"]*)"/.exec(b)?.[1]);
    expect(clases[0]).toBeDefined();
    expect(clases[0]).toBe(clases[1]);
    for (const b of botones) {
      expect(b).toContain('data-variant="secondary"');
      expect(b).not.toContain('data-variant="primary"');
    }
  });
});
