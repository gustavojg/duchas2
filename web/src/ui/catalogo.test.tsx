import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { cargarServicios } from '../lib/content';
import { BotonWhatsApp } from './BotonWhatsApp';
import { PrecioDesde } from './PrecioDesde';
import { TarjetaServicio } from './TarjetaServicio';

const servicios = cargarServicios();
const plato = servicios.find((s) => s.tipo === 'principal')!;
const azulejos = servicios.find((s) => s.slug === 'azulejos')!;

const textoPlano = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
const sinEstilos = (html: string) => {
  expect(html).not.toContain('style=');
  expect(html).not.toContain('<style');
};

describe('TarjetaServicio', () => {
  const grande = renderToStaticMarkup(<TarjetaServicio servicio={plato} />);
  const compacta = renderToStaticMarkup(<TarjetaServicio servicio={azulejos} />);

  it('la del plato enlaza a su página, lleva el nombre en H3 y se marca como grande', () => {
    expect(grande).toContain('href="/platos-de-ducha/"');
    expect(grande).toMatch(/<h3[^>]*>(?:(?!<\/h3>).)*Reparación y esmaltado de platos de ducha/s);
    expect(textoPlano(grande)).toContain(plato.resumen);
    expect(grande).toContain('data-tamano="grande"');
    expect(grande).not.toContain('data-tamano="compacta"');
    sinEstilos(grande);
  });

  it('las demás son compactas y enlazan a su ruta', () => {
    expect(compacta).toContain(`href="${azulejos.ruta}"`);
    expect(compacta).toContain('data-tamano="compacta"');
    expect(compacta).not.toContain('data-tamano="grande"');
    expect(textoPlano(compacta)).toContain(azulejos.nombre);
    sinEstilos(compacta);
  });

  it('no muestra precio', () => {
    expect(grande).not.toMatch(/€|Desde|presupuesto/i);
  });
});

describe('PrecioDesde', () => {
  it('con precio confirmado pinta «Desde X €» en mono', () => {
    const html = renderToStaticMarkup(<PrecioDesde dato={{ valor: 90, confirmado: true }} modo="publico" />);
    expect(html).toMatch(/data-type="code"[^>]*>Desde 90 €</);
  });

  it('sin confirmar dice «Pide presupuesto gratuito» en texto normal', () => {
    const html = renderToStaticMarkup(<PrecioDesde dato={{ valor: null, confirmado: false }} modo="publico" />);
    expect(textoPlano(html)).toContain('Pide presupuesto gratuito');
    expect(html).not.toContain('data-type="code"');
  });

  it('nunca pinta «0»', () => {
    const html = renderToStaticMarkup(<PrecioDesde dato={{ valor: 0, confirmado: true }} modo="publico" />);
    expect(textoPlano(html)).not.toMatch(/\b0\b/);
    expect(textoPlano(html)).toContain('Pide presupuesto gratuito');
  });
});

describe('BotonWhatsApp', () => {
  const props = { numero: '+34 600 000 000', mensaje: 'Hola', etiqueta: 'Escríbenos' };
  it('por defecto es primario', () => {
    expect(renderToStaticMarkup(<BotonWhatsApp {...props} />)).toContain('data-variant="primary"');
  });
  it('con variante secondary es secundario', () => {
    const html = renderToStaticMarkup(<BotonWhatsApp {...props} variante="secondary" />);
    expect(html).toContain('data-variant="secondary"');
    expect(html).not.toContain('data-variant="primary"');
    expect(html).toContain('href="https://wa.me/');
  });
});
