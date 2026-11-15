import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { cargarNegocio, type Resena } from '../lib/content';
import { jsonLdLocalBusiness, notaVisible, resumenResenas } from '../lib/seo';
import { BloqueResenas } from './BloqueResenas';

const fixture: Resena[] = [
  { autor: 'Ana', nota: 5, texto: 'Quedó como nuevo.', fecha: '2026-03-01', fuente: 'Google' },
  { autor: 'Luis', nota: 4, texto: 'Rápidos y limpios.', fecha: '2026-04-12', fuente: 'Google' },
  { autor: 'Marta', nota: 5, texto: 'Muy recomendables.', fecha: '2026-05-20', fuente: 'Google' },
];

describe('BloqueResenas', () => {
  it('sin reseñas no pinta nada', () => {
    const html = renderToStaticMarkup(<BloqueResenas resenas={[]} />);
    expect(html).toBe('');
    expect(html).not.toContain('Lo que dicen');
  });

  it('con reseñas pinta la nota calculada, el número y la lista', () => {
    const html = renderToStaticMarkup(<BloqueResenas resenas={fixture} />);
    expect(html).toContain('Lo que dicen de nosotros');
    expect(html).toMatch(/<h2[^>]*>/);
    expect(html).toMatch(/aria-labelledby="[^"]+"/);
    expect(html).toContain('4,7 / 5');
    expect(html).toContain('3 opiniones');
    const nota = notaVisible(resumenResenas(fixture)!.media);
    expect(html).toContain(`${nota} / 5`);
    const ld = jsonLdLocalBusiness({ negocio: cargarNegocio(), resenas: fixture }) as {
      aggregateRating: { ratingValue: number };
    };
    expect(notaVisible(ld.aggregateRating.ratingValue)).toBe(nota);
    for (const r of fixture) {
      expect(html).toContain(r.autor);
      expect(html).toContain(r.texto);
    }
    expect(html.match(/<li[\s>]/g)).toHaveLength(3);
  });

  it('una sola reseña dice «1 opinión»', () => {
    const html = renderToStaticMarkup(<BloqueResenas resenas={[fixture[0]]} />);
    expect(html).toContain('5,0 / 5');
    expect(html).toContain('1 opinión');
    expect(html).not.toContain('1 opiniones');
  });

  it('sin estilos sueltos', () => {
    const html = renderToStaticMarkup(<BloqueResenas resenas={fixture} />);
    expect(html).not.toContain('style=');
    expect(html).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  });
});
