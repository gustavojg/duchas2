import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { cargarGaleria, cargarNegocio, type ParGaleria } from '../../lib/content';
import { APP_NAME } from '../../lib/site';
import { AntesYDespues, metadata } from './page';

const negocio = cargarNegocio();
const galeria = cargarGaleria();
const render = (g: ParGaleria[], n = negocio) => renderToStaticMarkup(<AntesYDespues galeria={g} negocio={n} />);
const plano = (html: string) =>
  html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ');

const conFoto: ParGaleria = {
  ...galeria[0],
  antes: '/galeria/antes-1.jpg',
  despues: '/galeria/despues-1.jpg',
  hueco: undefined,
} as ParGaleria;

describe('/antes-y-despues/', () => {
  it('tiene un solo H1 «Antes y después»', () => {
    const html = render(galeria);
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(html).toMatch(/<h1[^>]*>(?:(?!<\/h1>).)*Antes y después/s);
  });

  it('con el contenido actual (sin fotos) avisa una vez y ofrece mandar la foto, sin ilustraciones', () => {
    const html = render(galeria);
    const texto = plano(html);
    expect(galeria.some((p) => p.antes && p.despues)).toBe(false);
    expect(texto.split('Pronto, fotos reales de este trabajo')).toHaveLength(2);
    if (negocio.whatsapp.valor) expect(texto).toContain('Manda la foto del tuyo');
    expect(html).not.toContain('<img');
  });

  it('sin WhatsApp no pinta el botón', () => {
    const html = render(galeria, { ...negocio, whatsapp: { valor: null, confirmado: false } });
    expect(plano(html)).not.toContain('Manda la foto del tuyo');
  });

  it('con pares con foto pinta las dos fotos de cada par y no el aviso', () => {
    const html = render([conFoto, ...galeria]);
    expect(html).toContain('src="/galeria/antes-1.jpg"');
    expect(html).toContain('src="/galeria/despues-1.jpg"');
    expect(html.match(/<img\b/g)).toHaveLength(2);
    expect(plano(html)).not.toContain('Pronto, fotos reales de este trabajo');
  });

  it('no muestra datos pendientes', () => {
    const html = render(galeria);
    expect(html).not.toContain('PENDIENTE');
    expect(html).not.toContain('{{');
  });

  it('metadata con el título de la página', () => {
    expect(metadata.title).toBe(`Antes y después · ${APP_NAME}`);
  });
});
