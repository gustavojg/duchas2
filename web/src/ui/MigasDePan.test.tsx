import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { MigasDePan } from './MigasDePan';

const migas = [
  { nombre: 'Inicio', ruta: '/' },
  { nombre: 'Servicios', ruta: '/servicios/' },
  { nombre: 'Platos de ducha', ruta: '/platos-de-ducha/' },
];
const html = renderToStaticMarkup(<MigasDePan migas={migas} />);
const textoPlano = (h: string) => h.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

describe('MigasDePan', () => {
  it('es un nav con aria-label «Migas de pan» y una lista ordenada', () => {
    expect(html).toMatch(/^<nav[^>]*aria-label="Migas de pan"/);
    expect(html).toMatch(/<ol[\s>]/);
    expect(html.match(/<li[\s>]/g)).toHaveLength(3);
  });

  it('las dos primeras son enlaces con su href', () => {
    const hrefs = [...html.matchAll(/<a\b[^>]*href="([^"]*)"/g)].map((m) => m[1]);
    expect(hrefs).toEqual(['/', '/servicios/']);
  });

  it('la última no es enlace y lleva aria-current="page"', () => {
    const ultima = [...html.matchAll(/<li\b[^>]*>(?:(?!<\/li>).)*<\/li>/gs)].map((m) => m[0]).at(-1)!;
    expect(ultima).toContain('Platos de ducha');
    expect(ultima).not.toContain('<a');
    expect(ultima).toContain('aria-current="page"');
    expect(html.match(/aria-current="page"/g)).toHaveLength(1);
  });

  it('el texto sale en el orden de la lista', () => {
    const t = textoPlano(html);
    const pos = migas.map((m) => t.indexOf(m.nombre));
    expect(pos.every((p) => p >= 0)).toBe(true);
    expect([...pos].sort((a, b) => a - b)).toEqual(pos);
  });

  it('sin <div>, <span> propios ni estilos en línea', () => {
    expect(html).not.toMatch(/<div[\s>]/);
    expect(html).not.toMatch(/\bstyle="/);
  });
});
