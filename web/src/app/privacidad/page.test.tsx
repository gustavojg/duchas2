import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { cargarNegocio } from '../../lib/content';
import { APP_NAME } from '../../lib/site';
import { metadata, PaginaPrivacidad } from './page';

const negocio = cargarNegocio();
const html = renderToStaticMarkup(<PaginaPrivacidad negocio={negocio} retencion_dias={45} />);
const texto = html
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ');

describe('/privacidad/', () => {
  it('tiene un solo H1 «Política de privacidad»', () => {
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(html).toMatch(/<h1[^>]*>(?:(?!<\/h1>).)*Política de privacidad/s);
  });

  it('explica los datos del formulario, la foto, la IP y el plazo de conservación', () => {
    for (const d of ['teléfono', 'nombre', 'zona', 'mensaje', 'foto']) expect(texto).toContain(d);
    expect(texto).toContain('45 días');
    expect(texto).toMatch(/foto solo la vemos nosotros/);
    expect(texto).toContain('HMAC');
  });

  it('no muestra datos pendientes ni NIF inventados', () => {
    expect(html).not.toContain('PENDIENTE');
    expect(html).not.toContain('{{');
    expect(texto).not.toMatch(/NIF|CIF/);
  });

  it('enlaza el teléfono de negocio.json si lo hay', () => {
    if (negocio.telefono.valor) expect(html).toMatch(/href="tel:\+?\d+"/);
    const sinTelefono = renderToStaticMarkup(
      <PaginaPrivacidad negocio={{ ...negocio, telefono: { valor: null, confirmado: false } }} retencion_dias={45} />,
    );
    expect(sinTelefono).not.toContain('href="tel:');
  });

  it('metadata con el título de la página', () => {
    expect(metadata.title).toBe(`Política de privacidad · ${APP_NAME}`);
  });
});
